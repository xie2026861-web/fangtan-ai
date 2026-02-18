import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SmartReachService } from './smart-reach.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/reach')
@UseGuards(JwtAuthGuard)
export class SmartReachController {
  constructor(private readonly smartReachService: SmartReachService) {}

  /**
   * 创建触达任务
   */
  @Post('tasks')
  async createReachTask(
    @Body() data: {
      campaignName: string;
      campaignType: 'ai_call' | 'wechat' | 'sms' | 'email';
      script?: string;
      voiceId?: string;
      batchSize?: number;
      retryCount?: number;
      scheduleTime?: Date;
      filters?: {
        tags?: string[];
        regions?: string[];
        intentionLevel?: string[];
      };
    }
  ) {
    const userId = data['userId'] || 'default-user';

    const task = await this.smartReachService.createReachTask(userId, {
      campaignName: data.campaignName,
      campaignType: data.campaignType,
      script: data.script,
      voiceId: data.voiceId,
      batchSize: data.batchSize || 100,
      retryCount: data.retryCount || 3,
      scheduleTime: data.scheduleTime,
      filters: data.filters,
    });

    return {
      code: 0,
      data: task,
      message: '触达任务已创建',
    };
  }

  /**
   * 获取触达任务列表
   */
  @Get('tasks')
  async getReachTasks(
    @Query('status') status?: string,
    @Query('campaignType') campaignType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const userId = 'default-user';
    const result = await this.smartReachService.getReachTasks(userId, {
      status,
      campaignType,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return {
      code: 0,
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * 获取触达任务详情
   */
  @Get('tasks/:taskId')
  async getReachTaskDetail(@Param('taskId') taskId: string) {
    const task = await this.smartReachService.getReachTaskDetail(taskId);
    
    if (!task) {
      return {
        code: 404,
        message: '任务不存在',
      };
    }

    return {
      code: 0,
      data: task,
    };
  }

  /**
   * 获取通话记录列表
   */
  @Get('tasks/:taskId/calls')
  async getCallRecords(
    @Param('taskId') taskId: string,
    @Query('intentionLevel') intentionLevel?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.smartReachService.getCallRecords(taskId, {
      intentionLevel,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return {
      code: 0,
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * 获取触达统计
   */
  @Get('statistics')
  async getReachStatistics() {
    const userId = 'default-user';
    const stats = await this.smartReachService.getReachStatistics(userId);
    
    return {
      code: 0,
      data: stats,
    };
  }
}
