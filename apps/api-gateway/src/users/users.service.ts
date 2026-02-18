import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建用户
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 获取所有用户（分页）
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const { skip, take, role, status, search } = params;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: skip || 0,
        take: take || 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          subscriptionTier: true,
          clientCount: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page: Math.floor((skip || 0) / (take || 20)) + 1,
      pageSize: take || 20,
      totalPages: Math.ceil(total / (take || 20)),
    };
  }

  /**
   * 更新用户
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id); // 检查是否存在

    // 检查邮箱是否被其他用户使用
    if (updateUserDto.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('该邮箱已被使用');
      }
    }

    // 检查手机号是否被其他用户使用
    if (updateUserDto.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: updateUserDto.phone },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('该手机号已被使用');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  /**
   * 删除用户
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 获取用户统计
   */
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole,
      usersByTier,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      usersByTier: usersByTier.map((item) => ({
        tier: item.subscriptionTier,
        count: item._count,
      })),
    };
  }
}
