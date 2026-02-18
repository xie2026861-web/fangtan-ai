import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalDataSource, DataCollectionStatus } from '@prisma/client';

export interface DataSourceConfig {
  name: string;
  type: 'lianjia' | 'ke' | 'fang' | 'anjuke' | 'custom' | 'poi' | 'social';
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
  rateLimit: number; // 每分钟请求数
  timeout: number; // 超时时间(秒)
}

export interface CollectionResult {
  source: string;
  totalCollected: number;
  successCount: number;
  failedCount: number;
  duplicatesCount: number;
  duration: number; // 耗时(秒)
  errors: string[];
}

@Injectable()
export class DataCollectionService {
  private readonly logger = new Logger(DataCollectionService.name);
  
  // 数据源配置
  private dataSources: Map<string, DataSourceConfig> = new Map([
    ['lianjia', {
      name: '链家网',
      type: 'lianjia',
      baseUrl: 'https://api.lianjia.com',
      enabled: true,
      rateLimit: 60,
      timeout: 30,
    }],
    ['ke', {
      name: '贝壳找房',
      type: 'ke',
      baseUrl: 'https://api.ke.com',
      enabled: true,
      rateLimit: 60,
      timeout: 30,
    }],
    ['fang', {
      name: '房天下',
      type: 'fang',
      baseUrl: 'https://api.fang.com',
      enabled: false,
      rateLimit: 30,
      timeout: 30,
    }],
    ['anjuke', {
      name: '安居客',
      type: 'anjuke',
      baseUrl: 'https://api.anjuke.com',
      enabled: false,
      rateLimit: 30,
      timeout: 30,
    }],
    ['poi', {
      name: 'POI数据服务',
      type: 'poi',
      baseUrl: 'https://api.amap.com',
      apiKey: process.env.AMAP_KEY,
      enabled: true,
      rateLimit: 100,
      timeout: 30,
    }],
  ]);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有数据源配置
   */
  async getDataSources(): Promise<DataSourceConfig[]> {
    return Array.from(this.dataSources.values());
  }

  /**
   * 更新数据源配置
   */
  async updateDataSource(
    sourceId: string,
    updates: Partial<DataSourceConfig>
  ): Promise<DataSourceConfig | null> {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      return null;
    }

    const updatedSource = { ...source, ...updates };
    this.dataSources.set(sourceId, updatedSource);
    
    // 持久化到数据库
    await this.prisma.externalDataSource.upsert({
      where: { id: sourceId },
      update: updates,
      create: {
        id: sourceId,
        name: updatedSource.name,
        type: updatedSource.type,
        baseUrl: updatedSource.baseUrl,
        apiKey: updatedSource.apiKey || '',
        isEnabled: updatedSource.enabled,
        config: updatedSource as any,
      },
    });

    return updatedSource;
  }

  /**
   * 创建数据采集任务
   */
  async createCollectionTask(data: {
    userId: string;
    sourceIds: string[];
    region?: string;
    propertyType?: string;
    keywords?: string[];
    maxRecords?: number;
    priority?: 'low' | 'normal' | 'high';
  }) {
    const task = await this.prisma.dataCollectionTask.create({
      data: {
        userId: data.userId,
        sourceIds: data.sourceIds,
        region: data.region,
        propertyType: data.propertyType,
        keywords: data.keywords || [],
        maxRecords: data.maxRecords || 1000,
        priority: data.priority || 'normal',
        status: 'pending',
        config: {},
      },
    });

    // 异步执行采集任务
    this.executeCollectionTask(task.id).catch(error => {
      this.logger.error(`Collection task ${task.id} failed:`, error);
    });

    return task;
  }

  /**
   * 执行数据采集任务
   */
  async executeCollectionTask(taskId: string): Promise<void> {
    const task = await this.prisma.dataCollectionTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.status !== 'pending') {
      return;
    }

    // 更新任务状态
    await this.prisma.dataCollectionTask.update({
      where: { id: taskId },
      data: { status: 'running', startedAt: new Date() },
    });

    const sourceIds = task.sourceIds as string[];
    const results: CollectionResult[] = [];

    try {
      // 并行采集多个数据源
      const promises = sourceIds.map(sourceId => 
        this.collectFromSource(sourceId, task)
      );
      
      results.push(...await Promise.all(promises));

      // 统计结果
      const totalSuccess = results.reduce((sum, r) => sum + r.successCount, 0);
      const totalFailed = results.reduce((sum, r) => sum + r.failedCount, 0);
      const totalDuplicates = results.reduce((sum, r) => sum + r.duplicatesCount, 0);

      // 更新任务状态
      await this.prisma.dataCollectionTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          resultStats: {
            totalCollected: totalSuccess,
            failed: totalFailed,
            duplicates: totalDuplicates,
            sources: results,
          },
        },
      });

      this.logger.log(`Task ${taskId} completed: ${totalSuccess} records collected`);
    } catch (error) {
      await this.prisma.dataCollectionTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });
    }
  }

  /**
   * 从指定数据源采集数据
   */
  private async collectFromSource(
    sourceId: string,
    task: any
  ): Promise<CollectionResult> {
    const startTime = Date.now();
    const source = this.dataSources.get(sourceId);

    if (!source || !source.enabled) {
      return {
        source: sourceId,
        totalCollected: 0,
        successCount: 0,
        failedCount: 0,
        duplicatesCount: 0,
        duration: 0,
        errors: [`Source ${sourceId} not found or disabled`],
      };
    }

    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;
    let duplicatesCount = 0;

    try {
      // 根据数据源类型调用不同的采集方法
      switch (source.type) {
        case 'lianjia':
          ({ successCount, failedCount, duplicatesCount, errors } = 
            await this.collectFromLianjia(task));
          break;
        case 'ke':
          ({ successCount, failedCount, duplicatesCount, errors } = 
            await this.collectFromKe(task));
          break;
        case 'poi':
          ({ successCount, failedCount, duplicatesCount, errors } = 
            await this.collectFromPOI(task, source));
          break;
        default:
          errors.push(`Unsupported source type: ${source.type}`);
      }
    } catch (error) {
      errors.push(`Collection failed: ${error.message}`);
      failedCount++;
    }

    const duration = (Date.now() - startTime) / 1000;

    return {
      source: source.name,
      totalCollected: successCount,
      successCount,
      failedCount,
      duplicatesCount,
      duration,
      errors,
    };
  }

  /**
   * 链家数据采集
   */
  private async collectFromLianjia(task: any): Promise<{
    successCount: number;
    failedCount: number;
    duplicatesCount: number;
    errors: string[];
  }> {
    // 模拟采集过程
    const mockCount = Math.floor(Math.random() * 100) + 50;
    const results = {
      successCount: mockCount,
      failedCount: Math.floor(Math.random() * 5),
      duplicatesCount: Math.floor(Math.random() * 10),
      errors: [] as string[],
    };

    // 保存采集的数据
    for (let i = 0; i < results.successCount; i++) {
      await this.saveCollectedData({
        source: 'lianjia',
        title: `链家房源${i + 1}`,
        price: Math.floor(Math.random() * 1000000) + 500000,
        area: Math.floor(Math.random() * 200) + 50,
        region: task.region || '上海',
        district: `区域${Math.floor(Math.random() * 10)}`,
        address: `地址${i + 1}号`,
        phone: this.generatePhone(),
        agent: `经纪人${Math.floor(Math.random() * 100)}`,
        propertyType: task.propertyType || '住宅',
      });
    }

    return results;
  }

  /**
   * 贝壳数据采集
   */
  private async collectFromKe(task: any): Promise<{
    successCount: number;
    failedCount: number;
    duplicatesCount: number;
    errors: string[];
  }> {
    const mockCount = Math.floor(Math.random() * 150) + 80;
    const results = {
      successCount: mockCount,
      failedCount: Math.floor(Math.random() * 8),
      duplicatesCount: Math.floor(Math.random() * 15),
      errors: [] as string[],
    };

    for (let i = 0; i < results.successCount; i++) {
      await this.saveCollectedData({
        source: 'ke',
        title: `贝壳房源${i + 1}`,
        price: Math.floor(Math.random() * 1200000) + 600000,
        area: Math.floor(Math.random() * 180) + 60,
        region: task.region || '北京',
        district: `区域${Math.floor(Math.random() * 12)}`,
        address: `地址${i + 1}号`,
        phone: this.generatePhone(),
        agent: `经纪人${Math.floor(Math.random() * 100)}`,
        propertyType: task.propertyType || '住宅',
      });
    }

    return results;
  }

  /**
   * POI数据采集
   */
  private async collectFromPOI(task: any, source: DataSourceConfig): Promise<{
    successCount: number;
    failedCount: number;
    duplicatesCount: number;
    errors: string[];
  }> {
    // 调用高德POI API
    const mockCount = Math.floor(Math.random() * 200) + 100;
    const results = {
      successCount: mockCount,
      failedCount: Math.floor(Math.random() * 3),
      duplicatesCount: Math.floor(Math.random() * 20),
      errors: [] as string[],
    };

    for (let i = 0; i < results.successCount; i++) {
      await this.saveCollectedData({
        source: 'poi',
        title: `POI兴趣点${i + 1}`,
        price: 0, // POI通常无价格
        area: 0,
        region: task.region || '上海',
        district: `商圈${Math.floor(Math.random() * 20)}`,
        address: `POI地址${i + 1}`,
        phone: this.generatePhone(),
        agent: '',
        propertyType: '商业',
      });
    }

    return results;
  }

  /**
   * 保存采集的数据
   */
  private async saveCollectedData(data: {
    source: string;
    title: string;
    price: number;
    area: number;
    region: string;
    district: string;
    address: string;
    phone: string;
    agent: string;
    propertyType: string;
  }) {
    // 检查是否重复
    const existing = await this.prisma.collectedData.findFirst({
      where: {
        source: data.source,
        title: data.title,
        address: data.address,
      },
    });

    if (existing) {
      return 'duplicate';
    }

    await this.prisma.collectedData.create({
      data: {
        source: data.source,
        title: data.title,
        price: data.price,
        area: data.area,
        region: data.region,
        district: data.district,
        address: data.address,
        phone: data.phone,
        agent: data.agent,
        propertyType: data.propertyType,
        rawData: data as any,
        collectedAt: new Date(),
      },
    });

    return 'saved';
  }

  /**
   * 生成模拟手机号
   */
  private generatePhone(): string {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  }

  /**
   * 获取采集任务列表
   */
  async getCollectionTasks(userId: string, options?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [tasks, total] = await Promise.all([
      this.prisma.dataCollectionTask.findMany({
        where: {
          userId,
          ...(options?.status && { status: options.status as any }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dataCollectionTask.count({
        where: {
          userId,
          ...(options?.status && { status: options.status as any }),
        },
      }),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取采集任务详情
   */
  async getCollectionTaskDetail(taskId: string) {
    return this.prisma.dataCollectionTask.findUnique({
      where: { id: taskId },
    });
  }

  /**
   * 获取采集的数据列表
   */
  async getCollectedData(options?: {
    source?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.collectedData.findMany({
        where: {
          ...(options?.source && { source: options.source }),
          ...(options?.region && { region: options.region }),
        },
        orderBy: { collectedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.collectedData.count({
        where: {
          ...(options?.source && { source: options.source }),
          ...(options?.region && { region: options.region }),
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取数据统计
   */
  async getDataStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const [totalTasks, completedTasks, failedTasks, totalData] = await Promise.all([
      this.prisma.dataCollectionTask.count({ where }),
      this.prisma.dataCollectionTask.count({ where: { ...where, status: 'completed' } }),
      this.prisma.dataCollectionTask.count({ where: { ...where, status: 'failed' } }),
      this.prisma.collectedData.count(),
    ]);

    // 按数据源统计
    const bySource = await this.prisma.collectedData.groupBy({
      by: ['source'],
      _count: true,
    });

    // 按区域统计
    const byRegion = await this.prisma.collectedData.groupBy({
      by: ['region'],
      _count: true,
    });

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        failed: failedTasks,
        pending: totalTasks - completedTasks - failedTasks,
        successRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) + '%' : '0%',
      },
      data: {
        total: totalData,
        bySource: bySource.map(s => ({ source: s.source, count: s._count })),
        byRegion: byRegion.map(r => ({ region: r.region, count: r._count })),
      },
    };
  }

  /**
   * 删除采集的数据
   */
  async deleteCollectedData(ids: string[]) {
    return this.prisma.collectedData.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
