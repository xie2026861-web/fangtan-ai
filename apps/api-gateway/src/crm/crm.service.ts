import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建客户
   */
  async createCustomer(userId: string, data: {
    name: string;
    phone: string;
    email?: string;
    gender?: 'male' | 'female' | 'other';
    tags?: string[];
    source?: string;
    notes?: string;
  }) {
    return this.prisma.customer.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        gender: data.gender,
        tags: data.tags || [],
        source: data.source,
        notes: data.notes,
        intentionLevel: 'unknown',
        lifecycleStage: 'lead',
        status: 'active',
      },
    });
  }

  /**
   * 获取客户列表
   */
  async getCustomers(userId: string, options?: {
    status?: string;
    intentionLevel?: string;
    lifecycleStage?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const where = {
      userId,
      ...(options?.status && { status: options.status }),
      ...(options?.intentionLevel && { intentionLevel: options.intentionLevel }),
      ...(options?.lifecycleStage && { lifecycleStage: options.lifecycleStage }),
      ...(options?.search && {
        OR: [
          { name: { contains: options.search } },
          { phone: { contains: options.search } },
          { notes: { contains: options.search } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { lastContactedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取客户详情
   */
  async getCustomerDetail(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        followUps: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        callRecords: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    return customer;
  }

  /**
   * 更新客户信息
   */
  async updateCustomer(customerId: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    tags?: string[];
    intentionLevel?: string;
    lifecycleStage?: string;
    notes?: string;
  }) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 添加跟进记录
   */
  async addFollowUp(customerId: string, userId: string, data: {
    type: 'call' | 'visit' | 'message' | 'meeting' | 'other';
    content: string;
    nextFollowUp?: Date;
  }) {
    const followUp = await this.prisma.followUp.create({
      data: {
        customerId,
        userId,
        type: data.type,
        content: data.content,
        nextFollowUp: data.nextFollowUp,
      },
    });

    // 更新客户最后跟进时间
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        lastContactedAt: new Date(),
        ...(data.nextFollowUp && { nextFollowUpAt: data.nextFollowUp }),
      },
    });

    return followUp;
  }

  /**
   * 获取客户统计
   */
  async getCustomerStatistics(userId: string) {
    const [total, byIntention, byLifecycle, bySource, byStatus] = await Promise.all([
      this.prisma.customer.count({ where: { userId } }),
      this.prisma.customer.groupBy({
        by: ['intentionLevel'],
        where: { userId },
        _count: true,
      }),
      this.prisma.customer.groupBy({
        by: ['lifecycleStage'],
        where: { userId },
        _count: true,
      }),
      this.prisma.customer.groupBy({
        by: ['source'],
        where: { userId },
        _count: true,
      }),
      this.prisma.customer.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      total,
      byIntention: byIntention.map(i => ({ level: i.intentionLevel, count: i._count })),
      byLifecycle: byLifecycle.map(l => ({ stage: l.lifecycleStage, count: l._count })),
      bySource: bySource.map(s => ({ source: s.source, count: s._count })),
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    };
  }

  /**
   * 获取待跟进客户
   */
  async getPendingFollowUps(userId: string) {
    return this.prisma.customer.findMany({
      where: {
        userId,
        nextFollowUpAt: {
          lte: new Date(),
        },
      },
      orderBy: { nextFollowUpAt: 'asc' },
      take: 20,
    });
  }

  /**
   * 删除客户
   */
  async deleteCustomer(customerId: string) {
    return this.prisma.customer.delete({
      where: { id: customerId },
    });
  }
}
