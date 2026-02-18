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
import { CallTaskService } from './call-task.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, ProgressDto } from './dto/call-task.dto';
import { CallTask } from './entities/call-task.entity';

@ApiTags('call-tasks')
@ApiBearerAuth()
@Controller('call-tasks')
export class CallTaskController {
  private readonly logger = new Logger(CallTaskController.name);

  constructor(private readonly taskService: CallTaskService) {}

  @Post()
  @ApiOperation({ summary: '创建外呼任务' })
  @ApiResponse({ status: 201, description: '任务创建成功' })
  async create(@Body() createDto: CreateTaskDto): Promise<CallTask> {
    this.logger.log(`创建外呼任务: ${createDto.name}`);
    return this.taskService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '查询外呼任务列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: TaskQueryDto): Promise<{ data: CallTask[]; total: number; page: number; limit: number }> {
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
  async getPendingTasks(): Promise<CallTask[]> {
    return this.taskService.getPendingTasks();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async findOne(@Param('id') id: string): Promise<CallTask> {
    return this.taskService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateTaskDto): Promise<CallTask> {
    return this.taskService.update(id, updateDto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '启动任务' })
  @ApiResponse({ status: 200, description: '任务已启动' })
  async start(@Param('id') id: string): Promise<CallTask> {
    this.logger.log(`启动外呼任务: ${id}`);
    return this.taskService.start(id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: '暂停任务' })
  @ApiResponse({ status: 200, description: '任务已暂停' })
  async pause(@Param('id') id: string): Promise<CallTask> {
    return this.taskService.pause(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成任务' })
  @ApiResponse({ status: 200, description: '任务已完成' })
  async complete(@Param('id') id: string): Promise<CallTask> {
    return this.taskService.complete(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消任务' })
  @ApiResponse({ status: 200, description: '任务已取消' })
  async cancel(@Param('id') id: string): Promise<CallTask> {
    return this.taskService.cancel(id);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: '更新任务进度' })
  @ApiResponse({ status: 200, description: '进度已更新' })
  async updateProgress(@Param('id') id: string, @Body() progress: ProgressDto): Promise<CallTask> {
    return this.taskService.updateProgress(
      id,
      progress.completedCalls,
      progress.successfulCalls,
      progress.failedCalls,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除任务' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}
