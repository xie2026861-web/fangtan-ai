import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ContentConfig {
  type: 'property_description' | 'promotion' | '软文' | '朋友圈' | '短视频脚本' | '海报';
  templateId?: string;
  properties?: {
    title?: string;
    price?: string;
    area?: string;
    region?: string;
    features?: string[];
  };
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'formal';
  length?: 'short' | 'medium' | 'long';
  platform?: string[]; // 微信, 抖音, 小红书, 贝壳等
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  images?: string[];
  videoScript?: string;
  error?: string;
  generationTime: number;
}

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);
  
  // 内容模板
  private templates = {
    property_description: [
      {
        id: 'tpl-001',
        name: '专业房源描述',
        content: '位于{region}的{area}平米房源，{features}，售价{price}万。周边配套齐全，交通便利。',
      },
      {
        id: 'tpl-002',
        name: '简洁房源描述',
        content: '{region} {area}平 {price}万 {features}。',
      },
    ],
    promotion: [
      {
        id: 'tpl-003',
        name: '限时优惠',
        content: '🎉 重磅推荐！{region}稀缺房源，仅售{price}万！{features}，错过不再有！',
      },
      {
        id: 'tpl-004',
        name: '新上房源',
        content: '🏠 新上好房！{region} {area}平米，{price}万，{features}。',
      },
    ],
  };

  // AI生成配置
  private aiConfig = {
    maxTokens: 2000,
    temperature: 0.7,
    topP: 0.9,
  };

  constructor(private prisma: PrismaService) {}

  /**
   * 获取内容模板列表
   */
  async getTemplates(type?: string) {
    if (type) {
      return this.templates[type] || [];
    }
    
    return Object.values(this.templates).flat();
  }

  /**
   * 创建内容生成任务
   */
  async createGenerationTask(userId: string, config: ContentConfig) {
    const task = await this.prisma.contentGenerationTask.create({
      data: {
        userId,
        type: config.type,
        templateId: config.templateId,
        config: config as any,
        status: 'pending',
      },
    });

    // 异步执行生成任务
    this.executeGenerationTask(task.id).catch(error => {
      this.logger.error(`Content generation task ${task.id} failed:`, error);
    });

    return task;
  }

  /**
   * 执行内容生成任务
   */
  async executeGenerationTask(taskId: string): Promise<GenerationResult> {
    const startTime = Date.now();
    const task = await this.prisma.contentGenerationTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.status !== 'pending') {
      throw new Error('Task not found or not in pending status');
    }

    await this.prisma.contentGenerationTask.update({
      where: { id: taskId },
      data: { status: 'running', startedAt: new Date() },
    });

    const config = task.config as ContentConfig;
    let result: GenerationResult;

    try {
      // 根据内容类型生成不同的内容
      switch (config.type) {
        case 'property_description':
          result = await this.generatePropertyDescription(config);
          break;
        case 'promotion':
          result = await this.generatePromotion(config);
          break;
        case '软文':
          result = await this.generateArticle(config);
          break;
        case '朋友圈':
          result = await this.generateSocialPost(config);
          break;
        case '短视频脚本':
          result = await this.generateVideoScript(config);
          break;
        case '海报':
          result = await this.generatePoster(config);
          break;
        default:
          throw new Error(`Unsupported content type: ${config.type}`);
      }

      result.generationTime = (Date.now() - startTime) / 1000;

      // 保存生成的内容
      await this.prisma.contentGenerationTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: result as any,
        },
      });

      // 保存到内容库
      await this.saveGeneratedContent(userId, config, result);

      this.logger.log(`Content generation task ${taskId} completed in ${result.generationTime}s`);
    } catch (error) {
      await this.prisma.contentGenerationTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });

      result = {
        success: false,
        error: error.message,
        generationTime: (Date.now() - startTime) / 1000,
      };
    }

    return result;
  }

  /**
   * 生成房源描述
   */
  private async generatePropertyDescription(config: ContentConfig): Promise<GenerationResult> {
    const props = config.properties || {};
    const template = this.templates.property_description[0];
    
    let content = template.content
      .replace('{region}', props.region || '该区域')
      .replace('{area}', props.area || '100')
      .replace('{price}', props.price || '500')
      .replace('{features}', (props.features || ['交通便利', '配套齐全']).join('、'));

    // 根据语气调整
    if (config.tone === 'enthusiastic') {
      content = '🔥 强烈推荐！' + content + ' 性价比超高，抓紧联系！';
    } else if (config.tone === 'professional') {
      content = '【专业推荐】' + content + ' 欢迎实地看房。';
    }

    return {
      success: true,
      content,
      generationTime: Math.random() * 2 + 0.5,
    };
  }

  /**
   * 生成推广文案
   */
  private async generatePromotion(config: ContentConfig): Promise<GenerationResult> {
    const props = config.properties || {};
    const template = this.templates.promotion[0];
    
    let content = template.content
      .replace('{region}', props.region || '热门区域')
      .replace('{area}', props.area || '100')
      .replace('{price}', props.price || '500')
      .replace('{features}', (props.features || ['采光好', '户型方正']).join('、'));

    // 根据平台调整
    if (config.platform?.includes('抖音')) {
      content += ' 📍 点击主页了解更多！';
    } else if (config.platform?.includes('小红书')) {
      content += ' 💕 喜欢就点个赞吧~';
    }

    return {
      success: true,
      content,
      generationTime: Math.random() * 2 + 0.5,
    };
  }

  /**
   * 生成软文
   */
  private async generateArticle(config: ContentConfig): Promise<GenerationResult> {
    const props = config.properties || {};
    
    const article = `
# ${props.title || '房产投资指南'}

在当今房地产市场，选择合适的房源至关重要。本文为您详细介绍位于${props.region || '核心区域'}的优质房源。

## 房源亮点

${(props.features || ['南北通透', '采光充足', '交通便利']).map(f => `- ${f}`).join('\n')}

## 价格分析

该房源售价${props.price || '面议'}，${props.area || '100'}平米的空间满足您的各种需求。

## 投资价值

${props.region || '该区域'}作为城市发展的重点区域，未来升值潜力巨大。抓住机会，就是现在！

---
如有购房意向，欢迎随时联系。
    `.trim();

    return {
      success: true,
      content: article,
      generationTime: Math.random() * 3 + 1,
    };
  }

  /**
   * 生成朋友圈文案
   */
  private async generateSocialPost(config: ContentConfig): Promise<GenerationResult> {
    const props = config.properties || {};
    
    const emojis = ['🏠', '✨', '🔥', '💫', '🎉'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const content = `${randomEmoji} 新上好房推荐！

${props.region || '核心区域'} ${props.area || '100'}㎡
💰 ${props.price || '面议'}万
${(props.features || ['采光好', '户型正']).join(' ')}

${randomEmoji} 性价比超高
📱 感兴趣的朋友私信我~

#房产 #买房 #上海房产
    `.trim();

    return {
      success: true,
      content,
      generationTime: Math.random() * 1 + 0.5,
    };
  }

  /**
   * 生成短视频脚本
   */
  private async generateVideoScript(config: ContentConfig): Promise<GenerationResult> {
    const props = config.properties || {};
    
    const script = {
      scenes: [
        {
          duration: 3,
          content: `开场：${props.title || '优质房源推荐'}`,
          visual: '房源封面图',
          audio: '背景音乐+旁白：今天给大家推荐一套好房！',
        },
        {
          duration: 5,
          content: '房源基本信息',
          visual: '房源实拍图+信息卡片',
          audio: `这套房子位于${props.region || '核心区域'}，${props.area || '100'}平米，${props.price || '面议'}万。`,
        },
        {
          duration: 10,
          content: '房源亮点介绍',
          visual: '各房间展示',
          audio: `房源亮点：${(props.features || ['南北通透', '采光好', '交通便利']).join('、')}。`,
        },
        {
          duration: 5,
          content: '结尾引导',
          visual: '联系方式',
          audio: '感兴趣的朋友评论区扣1，或者私信我，带您看房！',
        },
      ],
      totalDuration: 23,
      tips: '建议配合热门背景音乐，字幕清晰突出',
    };

    return {
      success: true,
      videoScript: JSON.stringify(script, null, 2),
      generationTime: Math.random() * 3 + 1,
    };
  }

  /**
   * 生成海报
   */
  private async generatePoster(config: ContentConfig): Promise<GenerationResult> {
    const props = config.properties || {};
    
    const poster = {
      title: props.title || '优质房源推荐',
      subtitle: `${props.region || '核心区域'} | ${props.area || '100'}㎡ | ${props.price || '面议'}万`,
      features: props.features || ['南北通透', '采光好', '交通便利'],
      cta: '扫码了解更多',
      qrCode: 'placeholder_qr_code',
      designTips: '建议使用红色或金色为主色调，突出节日氛围',
    };

    return {
      success: true,
      images: [JSON.stringify(poster)],
      generationTime: Math.random() * 2 + 0.5,
    };
  }

  /**
   * 保存生成的内容到内容库
   */
  private async saveGeneratedContent(userId: string, config: ContentConfig, result: GenerationResult) {
    await this.prisma.generatedContent.create({
      data: {
        userId,
        type: config.type,
        content: result.content || result.videoScript || '',
        images: result.images || [],
        platform: config.platform || [],
        metadata: config as any,
        createdAt: new Date(),
      },
    });
  }

  /**
   * 获取内容生成任务列表
   */
  async getGenerationTasks(userId: string, options?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [tasks, total] = await Promise.all([
      this.prisma.contentGenerationTask.findMany({
        where: {
          userId,
          ...(options?.status && { status: options.status as any }),
          ...(options?.type && { type: options.type as any }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contentGenerationTask.count({
        where: {
          userId,
          ...(options?.status && { status: options.status as any }),
          ...(options?.type && { type: options.type as any }),
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
   * 获取内容库
   */
  async getContentLibrary(userId: string, options?: {
    type?: string;
    platform?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [contents, total] = await Promise.all([
      this.prisma.generatedContent.findMany({
        where: {
          userId,
          ...(options?.type && { type: options.type as any }),
          ...(options?.platform && { platform: { has: options.platform } }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.generatedContent.count({
        where: {
          userId,
          ...(options?.type && { type: options.type as any }),
          ...(options?.platform && { platform: { has: options.platform } }),
        },
      }),
    ]);

    return {
      data: contents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取内容统计
   */
  async getContentStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const [totalTasks, completedTasks, failedTasks, totalContent] = await Promise.all([
      this.prisma.contentGenerationTask.count({ where }),
      this.prisma.contentGenerationTask.count({ where: { ...where, status: 'completed' } }),
      this.prisma.contentGenerationTask.count({ where: { ...where, status: 'failed' } }),
      this.prisma.generatedContent.count({ where }),
    ]);

    // 按类型统计
    const byType = await this.prisma.generatedContent.groupBy({
      by: ['type'],
      _count: true,
    });

    // 按平台统计
    const byPlatform = await this.prisma.generatedContent.findMany({
      where: { userId },
      select: { platform: true, id: true },
    });

    const platformCounts: Record<string, number> = {};
    byPlatform.forEach(item => {
      (item.platform as string[]).forEach(p => {
        platformCounts[p] = (platformCounts[p] || 0) + 1;
      });
    });

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        failed: failedTasks,
        pending: totalTasks - completedTasks - failedTasks,
      },
      content: {
        total: totalContent,
        byType: byType.map(t => ({ type: t.type, count: t._count })),
        byPlatform: Object.entries(platformCounts).map(([platform, count]) => ({ platform, count })),
      },
    };
  }
}
