import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DataCollectionService } from './data-collection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/v1/data-collection')
@UseGuards(JwtAuthGuard)
export class DataCollectionController {
  constructor(private readonly dataCollectionService: DataCollectionService) {}

  /**
   * 获取所有数据源配置
   */
  @Get('sources')
  async getDataSources() {
    const sources = await this.dataCollectionService.getDataSources();
    return {
      code: 0,
      data: sources,
    };
  }

  /**
   * 更新数据源配置
   */
  @Post('sources/:sourceId')
  async updateDataSource(
    @Param('sourceId') sourceId: string,
    @Body() updates: any
  ) {
    const source = await this.dataCollectionService.updateDataSource(
      sourceId,
      updates
    );
    
    if (!source) {
      return {
        code: 404,
        message: '数据源不存在',
      };
    }

    return {
      code: 0,
      data: source,
    };
  }

  /**
   * 创建数据采集任务
   */
  @Post('tasks')
  async createCollectionTask(
    @Body() data: {
      sourceIds: string[];
      region?: string;
      propertyType?: string;
      keywords?: string[];
      maxRecords?: number;
      priority?: 'low' | 'normal' | 'high';
    }
  ) {
    // 从JWT获取用户ID（实际应从request.user获取）
    const userId = data['userId'] || 'default-user';

    const task = await this.dataCollectionService.createCollectionTask({
      userId,
      sourceIds: data.sourceIds,
      region: data.region,
      propertyType: data.propertyType,
      keywords: data.keywords,
      maxRecords: data.maxRecords,
      priority: data.priority,
    });

    return {
      code: 0,
      data: task,
      message: '采集任务已创建',
    };
  }

  /**
   * 获取采集任务列表
   */
  @Get('tasks')
  async getCollectionTasks(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const userId = 'default-user'; // 从JWT获取
    const result = await this.dataCollectionService.getCollectionTasks(userId, {
      status,
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
   * 获取采集任务详情
   */
  @Get('tasks/:taskId')
  async getCollectionTaskDetail(@Param('taskId') taskId: string) {
    const task = await this.dataCollectionService.getCollectionTaskDetail(taskId);
    
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
   * 获取采集的数据列表
   */
  @Get('data')
  async getCollectedData(
    @Query('source') source?: string,
    @Query('region') region?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const result = await this.dataCollectionService.getCollectedData({
      source,
      region,
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
   * 获取数据统计
   */
  @Get('statistics')
  async getDataStatistics() {
    const userId = 'default-user'; // 从JWT获取
    const stats = await this.dataCollectionService.getDataStatistics(userId);
    
    return {
      code: 0,
      data: stats,
    };
  }

  /**
   * 删除采集的数据
   */
  @Post('data/delete')
  async deleteCollectedData(@Body() body: { ids: string[] }) {
    const result = await this.dataCollectionService.deleteCollectedData(body.ids);
    
    return {
      code: 0,
      data: { deletedCount: result.count },
      message: `已删除 ${result.count} 条数据`,
    };
  }
}
