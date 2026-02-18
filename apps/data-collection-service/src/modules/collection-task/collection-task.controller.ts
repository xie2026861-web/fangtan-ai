import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionTaskService } from './collection-task.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, StartTaskDto, CompleteTaskDto, FailTaskDto } from './dto/collection-task.dto';
import { CollectionTask } from './entities/collection-task.entity';

@ApiTags('collection-tasks')
@ApiBearerAuth()
@Controller('collection-tasks')
export class CollectionTaskController {
  private readonly logger = new Logger(CollectionTaskController.name);

  constructor(private readonly taskService: CollectionTaskService) {}

  @Post()
  @ApiOperation({ summary: '创建采集任务' })
  @ApiResponse({ status: 201, description: '任务创建成功' })
  async create(@Body() createDto: CreateTaskDto): Promise<CollectionTask> {
    this.logger.log(`创建采集任务: ${createDto.name}`);
    return this.taskService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '查询采集任务列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: TaskQueryDto): Promise<{ data: CollectionTask[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.taskService.findAll(query);
    return {
      data,
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get('pending')
  @ApiOperation({ summary: '获取待执行任务' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPendingTasks(): Promise<CollectionTask[]> {
    return this.taskService.getPendingTasks();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async findOne(@Param('id') id: string): Promise<CollectionTask> {
    return this.taskService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
  ): Promise<CollectionTask> {
    return this.taskService.update(id, updateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '部分更新任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
  ): Promise<CollectionTask> {
    return this.taskService.update(id, updateDto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '启动任务' })
  @ApiResponse({ status: 200, description: '任务已启动' })
  async start(@Param('id') id: string): Promise<CollectionTask> {
    this.logger.log(`启动采集任务: ${id}`);
    return this.taskService.start(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成任务' })
  @ApiResponse({ status: 200, description: '任务已完成' })
  async complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteTaskDto,
  ): Promise<CollectionTask> {
    return this.taskService.complete(id, completeDto.collectedItems);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: '标记任务失败' })
  @ApiResponse({ status: 200, description: '任务已标记为失败' })
  async fail(
    @Param('id') id: string,
    @Body() failDto: FailTaskDto,
  ): Promise<CollectionTask> {
    return this.taskService.fail(id, failDto.errorMessage);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: '更新任务进度' })
  @ApiResponse({ status: 200, description: '进度已更新' })
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { collectedPages: number; collectedItems: number },
  ): Promise<CollectionTask> {
    return this.taskService.updateProgress(id, body.collectedPages, body.collectedItems);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除任务' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`删除采集任务: ${id}`);
    return this.taskService.remove(id);
  }
}
