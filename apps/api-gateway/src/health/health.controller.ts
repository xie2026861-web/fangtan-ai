import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  async check() {
    const database = await this.checkDatabase();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      services: {
        database,
        api: 'up',
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: '就绪检查' })
  @ApiResponse({ status: 200, description: '服务已就绪' })
  async ready() {
    const database = await this.checkDatabase();
    
    if (database.status !== 'up') {
      return {
        status: 'not_ready',
        message: 'Database not available',
      };
    }

    return { status: 'ready' };
  }

  @Get('live')
  @ApiOperation({ summary: '存活检查' })
  @ApiResponse({ status: 200, description: '服务存活' })
  async live() {
    return { status: 'alive' };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        version: 'PostgreSQL',
        latency: '0ms',
      };
    } catch (error) {
      return {
        status: 'down',
        error: error.message,
      };
    }
  }
}
