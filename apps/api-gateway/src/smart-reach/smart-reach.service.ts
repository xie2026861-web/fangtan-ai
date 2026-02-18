import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReachTaskConfig {
  campaignName: string;
  campaignType: 'ai_call' | 'wechat' | 'sms' | 'email';
  script?: string;
  voiceId?: string;
  batchSize: number; // 每批处理数量
  retryCount: number; // 重试次数
  scheduleTime?: Date; // 计划执行时间
  filters?: {
    tags?: string[];
    regions?: string[];
    intentionLevel?: string[];
  };
}

export interface ReachResult {
  taskId: string;
  total: number;
  completed: number;
  failed: number;
  pending: number;
  successRate: string;
  averageDuration: number; // 平均通话时长(秒)
  intentionDistribution: {
    highlyInterested: number;
    interested: number;
    neutral: number;
    notInterested: number;
  };
}

@Injectable()
export class SmartReachService {
  private readonly logger = new Logger(SmartReachService.name);
  
  // AI外呼配置
  private aiCallConfig = {
    maxConcurrent: 10, // 最大并发数
    maxDuration: 300, // 最大通话时长(5分钟)
    silenceTimeout: 30, // 静默超时(秒)
    retryInterval: 60, // 重试间隔(秒)
    voiceSpeed: 1.0, // 语速
    voiceVolume: 1.0, // 音量
  };

  // 意图识别关键词
  private intentionKeywords = {
    highlyInterested: ['感兴趣', '看看', '什么时候', '多少钱', '预约'],
    interested: ['可以', '再说', '了解', '考虑一下'],
    notInterested: ['不需要', '不用', '忙', '挂了', '再见'],
  };

  constructor(private prisma: PrismaService) {}

  /**
   * 创建触达任务
   */
  async createReachTask(userId: string, config: ReachTaskConfig) {
    const task = await this.prisma.reachTask.create({
      data: {
        userId,
        campaignName: config.campaignName,
        campaignType: config.campaignType,
        script: config.script,
        voiceId: config.voiceId,
        batchSize: config.batchSize,
        retryCount: config.retryCount,
        scheduleTime: config.scheduleTime,
        filters: config.filters || {},
        status: 'pending',
        config: config as any,
      },
    });

    // 异步执行任务
    this.executeReachTask(task.id).catch(error => {
      this.logger.error(`Reach task ${task.id} failed:`, error);
    });

    return task;
  }

  /**
   * 执行触达任务
   */
  async executeReachTask(taskId: string): Promise<ReachResult> {
    const task = await this.prisma.reachTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.status !== 'pending') {
      throw new Error('Task not found or not in pending status');
    }

    await this.prisma.reachTask.update({
      where: { id: taskId },
      data: { status: 'running', startedAt: new Date() },
    });

    // 获取目标客户
    const customers = await this.getTargetCustomers(task.filters as any);
    const targetCount = customers.length;

    this.logger.log(`Starting reach task ${taskId} for ${targetCount} customers`);

    const results = {
      taskId,
      total: targetCount,
      completed: 0,
      failed: 0,
      pending: targetCount,
      successRate: '0%',
      averageDuration: 0,
      intentionDistribution: {
        highlyInterested: 0,
        interested: 0,
        neutral: 0,
        notInterested: 0,
      },
    };

    try {
      // 根据任务类型执行不同的触达方式
      switch (task.campaignType) {
        case 'ai_call':
          await this.executeAICall(task, customers, results);
          break;
        case 'sms':
          await this.executeSMS(task, customers, results);
          break;
        case 'wechat':
          await this.executeWeChat(task, customers, results);
          break;
        default:
          throw new Error(`Unsupported campaign type: ${task.campaignType}`);
      }

      // 更新任务状态
      await this.prisma.reachTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          resultStats: results,
        },
      });

      this.logger.log(`Reach task ${taskId} completed`);
    } catch (error) {
      await this.prisma.reachTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });
    }

    return results;
  }

  /**
   * AI外呼执行
   */
  private async executeAICall(
    task: any,
    customers: any[],
    results: ReachResult
  ): Promise<void> {
    for (const customer of customers) {
      try {
        // 模拟AI外呼
        const callResult = await this.mockAICall(task, customer);
        
        // 记录通话结果
        await this.saveCallRecord(task.id, customer.id, callResult);

        // 更新统计
        results.completed++;
        results.pending--;
        
        // 统计意图分布
        if (callResult.intentionLevel === 'highly_interested') {
          results.intentionDistribution.highlyInterested++;
        } else if (callResult.intentionLevel === 'interested') {
          results.intentionDistribution.interested++;
        } else if (callResult.intentionLevel === 'not_interested') {
          results.intentionDistribution.notInterested++;
        } else {
          results.intentionDistribution.neutral++;
        }

        // 更新客户标签
        await this.updateCustomerIntention(customer.id, callResult.intentionLevel);

        // 模拟延时
        await this.sleep(1000);

      } catch (error) {
        results.failed++;
        results.pending--;
        this.logger.error(`AI call failed for customer ${customer.id}:`, error);
      }
    }

    // 计算成功率
    results.successRate = results.total > 0 
      ? ((results.completed / results.total) * 100).toFixed(2) + '%'
      : '0%';
  }

  /**
   * 模拟AI外呼
   */
  private async mockAICall(task: any, customer: any): Promise<{
    success: boolean;
    duration: number;
    intentionLevel: string;
    transcript: string[];
    summary: string;
  }> {
    // 模拟通话时长 30-180秒
    const duration = Math.floor(Math.random() * 150) + 30;
    
    // 模拟对话记录
    const transcript = [
      'AI: 您好，请问是XX先生/女士吗？',
      'AI: 我们是房探AI，有一套优质的房源想为您推荐...',
      customer.name || '客户: 是的，什么房源？',
      'AI: 这是一套位于XX区域的XX平米房源...',
      customer.name || '客户: 多少钱？',
      'AI: 这套房源售价XXX万...',
    ];

    // 模拟意图识别
    const intentionRoll = Math.random();
    let intentionLevel: string;
    let summary: string;

    if (intentionRoll > 0.7) {
      intentionLevel = 'highly_interested';
      summary = '客户表现出高度兴趣，询问了价格和看房时间';
    } else if (intentionRoll > 0.4) {
      intentionLevel = 'interested';
      summary = '客户表示感兴趣，需要考虑一下';
    } else if (intentionRoll > 0.2) {
      intentionLevel = 'neutral';
      summary = '客户态度中立，未明确表达意向';
    } else {
      intentionLevel = 'not_interested';
      summary = '客户表示不感兴趣';
    }

    return {
      success: true,
      duration,
      intentionLevel,
      transcript,
      summary,
    };
  }

  /**
   * 保存通话记录
   */
  private async saveCallRecord(taskId: string, customerId: string, result: any) {
    await this.prisma.callRecord.create({
      data: {
        taskId,
        customerId,
        phone: '138****8888', // 脱敏
        duration: result.duration,
        intentionLevel: result.intentionLevel,
        transcript: result.transcript,
        summary: result.summary,
        status: result.success ? 'completed' : 'failed',
        startedAt: new Date(),
        endedAt: new Date(Date.now() + result.duration * 1000),
      },
    });
  }

  /**
   * 更新客户意向等级
   */
  private async updateCustomerIntention(customerId: string, intentionLevel: string) {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        intentionLevel,
        lastContactedAt: new Date(),
      },
    });
  }

  /**
   * 获取目标客户
   */
  private async getTargetCustomers(filters: any): Promise<any[]> {
    // 模拟返回目标客户列表
    const mockCustomers = [];
    for (let i = 0; i < 10; i++) {
      mockCustomers.push({
        id: `customer-${i}`,
        name: `客户${i + 1}`,
        phone: `138****${String(i).padStart(4, '0')}`,
        intentionLevel: 'unknown',
        tags: filters.tags || [],
        region: filters.regions?.[0] || '上海',
      });
    }
    return mockCustomers;
  }

  /**
   * SMS发送执行
   */
  private async executeSMS(
    task: any,
    customers: any[],
    results: ReachResult
  ): Promise<void> {
    for (const customer of customers) {
      try {
        // 模拟发送短信
        await this.mockSendSMS(task, customer);
        
        await this.prisma.smsRecord.create({
          data: {
            taskId,
            customerId: customer.id,
            phone: customer.phone,
            content: task.script,
            status: 'sent',
            sentAt: new Date(),
          },
        });

        results.completed++;
        results.pending--;
        await this.sleep(500);
      } catch (error) {
        results.failed++;
        results.pending--;
      }
    }

    results.successRate = results.total > 0 
      ? ((results.completed / results.total) * 100).toFixed(2) + '%'
      : '0%';
  }

  /**
   * 模拟发送短信
   */
  private async mockSendSMS(task: any, customer: any): Promise<void> {
    // 模拟短信发送
    await this.sleep(100);
  }

  /**
   * 企业微信执行
   */
  private async executeWeChat(
    task: any,
    customers: any[],
    results: ReachResult
  ): Promise<void> {
    for (const customer of customers) {
      try {
        // 模拟发送企业微信消息
        await this.mockSendWeChat(task, customer);

        await this.prisma.wechatRecord.create({
          data: {
            taskId,
            customerId: customer.id,
            content: task.script,
            status: 'sent',
            sentAt: new Date(),
          },
        });

        results.completed++;
        results.pending--;
        await this.sleep(500);
      } catch (error) {
        results.failed++;
        results.pending--;
      }
    }

    results.successRate = results.total > 0 
      ? ((results.completed / results.total) * 100).toFixed(2) + '%'
      : '0%';
  }

  /**
   * 模拟发送企业微信
   */
  private async mockSendWeChat(task: any, customer: any): Promise<void> {
    await this.sleep(100);
  }

  /**
   * 延时辅助方法
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取触达任务列表
   */
  async getReachTasks(userId: string, options?: {
    status?: string;
    campaignType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [tasks, total] = await Promise.all([
      this.prisma.reachTask.findMany({
        where: {
          userId,
          ...(options?.status && { status: options.status as any }),
          ...(options?.campaignType && { campaignType: options.campaignType as any }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reachTask.count({
        where: {
          userId,
          ...(options?.status && { status: options.status as any }),
          ...(options?.campaignType && { campaignType: options.campaignType as any }),
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
   * 获取触达任务详情
   */
  async getReachTaskDetail(taskId: string) {
    return this.prisma.reachTask.findUnique({
      where: { id: taskId },
    });
  }

  /**
   * 获取通话记录列表
   */
  async getCallRecords(taskId: string, options?: {
    intentionLevel?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [records, total] = await Promise.all([
      this.prisma.callRecord.findMany({
        where: {
          taskId,
          ...(options?.intentionLevel && { intentionLevel: options.intentionLevel as any }),
        },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.callRecord.count({
        where: {
          taskId,
          ...(options?.intentionLevel && { intentionLevel: options.intentionLevel as any }),
        },
      }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取触达统计
   */
  async getReachStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const [totalTasks, completedTasks, failedTasks, totalCalls, totalSMS, totalWeChat] = 
      await Promise.all([
        this.prisma.reachTask.count({ where }),
        this.prisma.reachTask.count({ where: { ...where, status: 'completed' } }),
        this.prisma.reachTask.count({ where: { ...where, status: 'failed' } }),
        this.prisma.callRecord.count(),
        this.prisma.smsRecord.count(),
        this.prisma.wechatRecord.count(),
      ]);

    // 通话意图分布
    const intentionDistribution = await this.prisma.callRecord.groupBy({
      by: ['intentionLevel'],
      _count: true,
    });

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        failed: failedTasks,
        pending: totalTasks - completedTasks - failedTasks,
      },
      channels: {
        calls: totalCalls,
        sms: totalSMS,
        wechat: totalWeChat,
        total: totalCalls + totalSMS + totalWeChat,
      },
      intention: intentionDistribution.map(i => ({
        level: i.intentionLevel,
        count: i._count,
      })),
    };
  }
}
