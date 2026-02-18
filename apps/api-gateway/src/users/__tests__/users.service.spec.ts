import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('应该返回用户信息', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-uuid');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
      });
    });

    it('应该返回null如果用户不存在', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('user-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('应该根据邮箱返回用户', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('findAll', () => {
    it('应该返回分页用户列表', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
        { id: 'user-2', email: 'user2@example.com', name: 'User 2' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('应该支持搜索功能', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'test@example.com', name: 'Test' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'test' });

      expect(result.users).toHaveLength(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('应该成功更新用户', async () => {
      const existingUser = {
        id: 'user-uuid',
        email: 'old@example.com',
        name: 'Old Name',
      };

      const updatedUser = {
        id: 'user-uuid',
        email: 'new@example.com',
        name: 'New Name',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-uuid', { name: 'New Name' });

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('应该抛出ConflictException如果邮箱已被使用', async () => {
      const existingUser = {
        id: 'user-uuid',
        email: 'old@example.com',
      };

      const anotherUser = {
        id: 'another-user',
        email: 'new@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(existingUser);
      mockPrismaService.user.findUnique.mockResolvedValueOnce(anotherUser);

      await expect(
        service.update('user-uuid', { email: 'new@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('应该成功删除用户', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        email: 'test@example.com',
      });
      mockPrismaService.user.delete.mockResolvedValue({});

      await service.remove('user-uuid');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
      });
    });

    it('应该抛出NotFoundException如果用户不存在', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('user-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('应该返回用户统计信息', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(80) // activeUsers
        .mockResolvedValueOnce(5); // newUsersToday

      mockPrismaService.user.groupBy.mockResolvedValue([
        { role: 'AGENT', _count: 70 },
        { role: 'MANAGER', _count: 20 },
        { role: 'ADMIN', _count: 10 },
      ]);

      mockPrismaService.user.groupBy.mockResolvedValue([
        { subscriptionTier: 'FREE', _count: 60 },
        { subscriptionTier: 'BASIC', _count: 30 },
        { subscriptionTier: 'PROFESSIONAL', _count: 10 },
      ]);

      const result = await service.getStats();

      expect(result.totalUsers).toBe(100);
      expect(result.activeUsers).toBe(80);
      expect(result.newUsersToday).toBe(5);
      expect(result.usersByRole).toHaveLength(3);
      expect(result.usersByTier).toHaveLength(3);
    });
  });
});
