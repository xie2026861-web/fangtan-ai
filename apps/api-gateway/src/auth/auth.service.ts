import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, phone } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException('该手机号已被注册');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'AGENT',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // 生成token
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 记录会话
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查账户状态
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('账户已被暂停，请联系管理员');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('账户已停用');
    }

    // 生成token
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 记录会话
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken, ip, userAgent);

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  /**
   * 用户登出
   */
  async logout(userId: string, accessToken: string) {
    // 删除会话
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token: accessToken,
      },
    });

    return { message: '登出成功' };
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        clientCount: true,
        monthlyReachCount: true,
        monthlyContentCount: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('无效的刷新Token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('用户状态异常');
    }

    // 生成新的tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 更新会话
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });

    return tokens;
  }

  /**
   * 验证用户
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return user;
  }

  /**
   * 生成Tokens
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1小时
    };
  }

  /**
   * 创建会话
   */
  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    await this.prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        ip,
        userAgent,
        expiresAt,
      },
    });
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 清除其他会话（除当前会话外）
    // 注意：这里需要传入当前token，暂时省略

    return { message: '密码修改成功' };
  }
}
