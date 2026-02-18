import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '13800138000',
    };

    it('应该成功注册新用户', async () => {
      const hashedPassword = 'hashed_password';
      const createdUser = {
        id: 'user-uuid',
        email: registerDto.email,
        name: registerDto.name,
        role: 'AGENT',
        createdAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('mocked_token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('应该抛出ConflictException如果邮箱已存在', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-uuid',
      email: loginDto.email,
      password: 'hashed_password',
      name: 'Test User',
      role: 'AGENT',
      status: 'ACTIVE',
      avatar: null,
    };

    it('应该成功登录并返回token', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mocked_token');
      mockPrismaService.session.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('应该抛出UnauthorizedException如果用户不存在', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('应该抛出UnauthorizedException如果密码错误', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('应该抛出UnauthorizedException如果账户被暂停', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'SUSPENDED',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('应该成功登出', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({});

      const result = await service.logout('user-uuid', 'token');

      expect(result).toEqual({ message: '登出成功' });
      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-uuid',
          token: 'token',
        },
      });
    });
  });

  describe('getProfile', () => {
    it('应该返回用户信息', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        name: 'Test User',
        phone: '13800138000',
        role: 'AGENT',
        status: 'ACTIVE',
        avatar: null,
        subscriptionTier: 'FREE',
        subscriptionExpiresAt: null,
        clientCount: 0,
        monthlyReachCount: 0,
        monthlyContentCount: 0,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-uuid');

      expect(result).toEqual(mockUser);
    });

    it('应该抛出NotFoundException如果用户不存在', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-uuid')).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('应该成功刷新token', async () => {
      const mockSession = {
        id: 'session-uuid',
        userId: 'user-uuid',
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() + 86400000),
      };

      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        role: 'AGENT',
        status: 'ACTIVE',
      };

      mockPrismaService.session.findFirst.mockResolvedValue(mockSession);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_token');
      mockPrismaService.session.update.mockResolvedValue({});

      const result = await service.refreshToken('refresh_token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('应该抛出UnauthorizedException如果refreshToken无效', async () => {
      mockPrismaService.session.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
