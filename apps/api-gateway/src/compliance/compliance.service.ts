import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  // 敏感词库
  private sensitiveWords = [
    '最好', '第一', '顶级', '唯一', '绝对',
    '稳赚', '保本', '保证盈利', '无风险',
    '虚假', '欺骗', '诈骗', '骗子',
    // 房地产相关
    '学区房', '地铁房', '精装交付', '拎包入住',
  ];

  // 敏感词分类
  private wordCategories = {
    extreme: ['最好', '第一', '顶级', '唯一', '绝对'],
    financial: ['稳赚', '保本', '保证盈利', '无风险'],
    fraud: ['虚假', '欺骗', '诈骗', '骗子'],
    realestate: ['学区房', '地铁房', '精装交付', '拎包入住'],
  };

  constructor(private prisma: PrismaService) {}

  /**
   * 内容合规检查
   */
  async checkContent(content: string, userId: string): Promise<{
    passed: boolean;
    issues: Array<{
      type: string;
      word: string;
      position: number;
      suggestion: string;
    }>;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const issues = [];
    const lowerContent = content.toLowerCase();

    // 检查敏感词
    for (const word of this.sensitiveWords) {
      const index = lowerContent.indexOf(word.toLowerCase());
      if (index !== -1) {
        let type = 'general';
        let suggestion = '建议删除或替换此词汇';

        // 判断敏感词类型
        for (const [category, words] of Object.entries(this.wordCategories)) {
          if (words.includes(word)) {
            type = category;
            if (category === 'extreme') {
              suggestion = '使用"优质"等替代词汇';
            } else if (category === 'financial') {
              suggestion = '删除绝对化承诺';
            } else if (category === 'fraud') {
              suggestion = '删除欺诈相关内容';
            } else if (category === 'realestate') {
              suggestion = '避免使用未经验证的承诺';
            }
            break;
          }
        }

        issues.push({
          type,
          word,
          position: index,
          suggestion,
        });
      }
    }

    // 检查长度
    const lengthIssues = [];
    if (content.length < 10) {
      lengthIssues.push('内容过短，建议补充更多信息');
    }
    if (content.length > 5000) {
      lengthIssues.push('内容过长，建议精简');
    }

    // 计算风险等级
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (issues.length >= 5) {
      riskLevel = 'high';
    } else if (issues.length >= 2) {
      riskLevel = 'medium';
    }

    const passed = issues.length === 0 && content.length >= 10 && content.length <= 5000;

    // 保存审核日志
    await this.prisma.complianceLog.create({
      data: {
        userId,
        content: content.substring(0, 500), // 只保存前500字符
        result: passed ? 'passed' : 'failed',
        riskLevel,
        issues: issues as any,
        checkedAt: new Date(),
      },
    });

    return {
      passed,
      issues: [...issues, ...lengthIssues.map(issue => ({
        type: 'length',
        word: issue,
        position: 0,
        suggestion: issue,
      }))],
      riskLevel,
    };
  }

  /**
   * 批量内容检查
   */
  async batchCheck(userId: string, contents: string[]): Promise<{
    results: Array<{
      index: number;
      passed: boolean;
      issues: any[];
      riskLevel: string;
    }>;
    summary: {
      total: number;
      passed: number;
      failed: number;
      highRisk: number;
    };
  }> {
    const results = [];
    let passed = 0;
    let highRisk = 0;

    for (let i = 0; i < contents.length; i++) {
      const result = await this.checkContent(contents[i], userId);
      results.push({
        index: i,
        passed: result.passed,
        issues: result.issues,
        riskLevel: result.riskLevel,
      });
      if (result.passed) passed++;
      if (result.riskLevel === 'high') highRisk++;
    }

    return {
      results,
      summary: {
        total: contents.length,
        passed,
        failed: contents.length - passed,
        highRisk,
      },
    };
  }

  /**
   * 添加敏感词
   */
  async addSensitiveWord(word: string, category: string, userId: string) {
    const newWord = await this.prisma.sensitiveWord.create({
      data: {
        word,
        category,
        createdBy: userId,
        isActive: true,
      },
    });

    // 更新内存中的敏感词库
    if (!this.sensitiveWords.includes(word)) {
      this.sensitiveWords.push(word);
    }

    return newWord;
  }

  /**
   * 获取敏感词列表
   */
  async getSensitiveWords(options?: {
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;

    const [words, total] = await Promise.all([
      this.prisma.sensitiveWord.findMany({
        where: {
          ...(options?.category && { category: options.category }),
          ...(options?.isActive !== undefined && { isActive: options.isActive }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sensitiveWord.count({
        where: {
          ...(options?.category && { category: options.category }),
          ...(options?.isActive !== undefined && { isActive: options.isActive }),
        },
      }),
    ]);

    return {
      data: words,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 删除敏感词
   */
  async deleteSensitiveWord(wordId: string) {
    return this.prisma.sensitiveWord.delete({
      where: { id: wordId },
    });
  }

  /**
   * 获取合规日志
   */
  async getComplianceLogs(options?: {
    userId?: string;
    result?: string;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;

    const where = {
      ...(options?.userId && { userId: options.userId }),
      ...(options?.result && { result: options.result as any }),
      ...(options?.riskLevel && { riskLevel: options.riskLevel as any }),
      ...(options?.startDate && options?.endDate && {
        checkedAt: {
          gte: options.startDate,
          lte: options.endDate,
        },
      }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.complianceLog.findMany({
        where,
        orderBy: { checkedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.complianceLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取合规统计
   */
  async getComplianceStatistics(userId?: string, startDate?: Date, endDate?: Date) {
    const where = {
      ...(userId && { userId }),
      ...(startDate && endDate && {
        checkedAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [total, passed, failed, highRisk, mediumRisk, lowRisk] = await Promise.all([
      this.prisma.complianceLog.count({ where }),
      this.prisma.complianceLog.count({ where: { ...where, result: 'passed' } }),
      this.prisma.complianceLog.count({ where: { ...where, result: 'failed' } }),
      this.prisma.complianceLog.count({ where: { ...where, riskLevel: 'high' } }),
      this.prisma.complianceLog.count({ where: { ...where, riskLevel: 'medium' } }),
      this.prisma.complianceLog.count({ where: { ...where, riskLevel: 'low' } }),
    ]);

    // 按类型统计
    const issueTypes = await this.prisma.complianceLog.groupBy({
      by: ['issues'],
      where,
    });

    return {
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%',
      },
      riskDistribution: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk,
      },
    };
  }

  /**
   * 话术模板审核
   */
  async reviewScript(scriptId: string, userId: string): Promise<{
    passed: boolean;
    issues: any[];
    suggestions: string[];
  }> {
    const script = await this.prisma.scriptTemplate.findUnique({
      where: { id: scriptId },
    });

    if (!script) {
      return {
        passed: false,
        issues: [{ type: 'error', message: '话术模板不存在' }],
        suggestions: [],
      };
    }

    const content = script.content;
    const checkResult = await this.checkContent(content, userId);

    // 更新话术状态
    await this.prisma.scriptTemplate.update({
      where: { id: scriptId },
      data: {
        complianceStatus: checkResult.passed ? 'approved' : 'rejected',
        complianceCheckedAt: new Date(),
        complianceIssues: checkResult.issues as any,
      },
    });

    return {
      passed: checkResult.passed,
      issues: checkResult.issues,
      suggestions: checkResult.passed 
        ? ['话术模板已通过审核'] 
        : ['请根据审核意见修改话术内容', '删除敏感词汇', '避免绝对化承诺'],
    };
  }

  /**
   * 创建话术模板
   */
  async createScriptTemplate(userId: string, data: {
    name: string;
    content: string;
    type: string;
    tags?: string[];
  }) {
    // 先检查内容合规
    const checkResult = await this.checkContent(data.content, userId);

    return this.prisma.scriptTemplate.create({
      data: {
        userId,
        name: data.name,
        content: data.content,
        type: data.type,
        tags: data.tags || [],
        complianceStatus: checkResult.passed ? 'approved' : 'pending',
        complianceIssues: checkResult.issues as any,
        version: 1,
        isActive: true,
      },
    });
  }

  /**
   * 获取话术模板
   */
  async getScriptTemplates(options?: {
    type?: string;
    complianceStatus?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const [templates, total] = await Promise.all([
      this.prisma.scriptTemplate.findMany({
        where: {
          ...(options?.type && { type: options.type }),
          ...(options?.complianceStatus && { complianceStatus: options.complianceStatus as any }),
          ...(options?.isActive !== undefined && { isActive: options.isActive }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.scriptTemplate.count({
        where: {
          ...(options?.type && { type: options.type }),
          ...(options?.complianceStatus && { complianceStatus: options.complianceStatus as any }),
          ...(options?.isActive !== undefined && { isActive: options.isActive }),
        },
      }),
    ]);

    return {
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
