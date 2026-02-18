import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const expectedUser = {
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        createdAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(expectedUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token');
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw an error if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('login', () => {
    it('should login successfully and return token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedUser = {
        id: '1',
        email: loginDto.email,
        name: 'Test User',
      };

      mockAuthService.validateUser.mockResolvedValue(expectedUser);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token');
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw an error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
