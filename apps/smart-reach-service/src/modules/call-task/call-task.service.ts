import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallTask } from './entities/call-task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/call-task.dto';

@Injectable()
export class CallTaskService {
  private readonly logger = new Logger(CallTaskService.name);

  constructor(
    @InjectRepository(CallTask)
    private readonly taskRepository: Repository<CallTask>,
  ) {}

  async create(createDto: CreateTaskDto): Promise<CallTask> {
    const task = this.taskRepository.create({
      ...createDto,
      status: 'PENDING',
      totalCustomers: createDto.customerIds?.length || 0,
    });
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`创建外呼任务: ${saved.id} - ${saved.name}`);
    return saved;
  }

  async findAll(query: TaskQueryDto): Promise<{ data: CallTask[]; total: number }> {
    const { page = 1, limit = 20, status } = query;

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    queryBuilder
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<CallTask> {
    const task = await this.taskRepository.findOne({ where: { id } });
    
    if (!task) {
      throw new NotFoundException(`外呼任务不存在: ${id}`);
    }

    return task;
  }

  async update(id: string, updateDto: UpdateTaskDto): Promise<CallTask> {
    const task = await this.findOne(id);
    
    Object.assign(task, updateDto);
    const saved = await this.taskRepository.save(task);
    
    this.logger.log(`更新外呼任务: ${id}`);
    return saved;
  }

  async start(id: string): Promise<CallTask> {
    const task = await this.findOne(id);
    
    task.status = 'IN_PROGRESS';
    task.startedAt = new Date();
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`开始外呼任务: ${id}`);
    return saved;
  }

  async pause(id: string): Promise<CallTask> {
    const task = await this.findOne(id);
    
    task.status = 'PAUSED';
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`暂停外呼任务: ${id}`);
    return saved;
  }

  async complete(id: string): Promise<CallTask> {
    const task = await this.findOne(id);
    
    task.status = 'COMPLETED';
    task.completedAt = new Date();
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`完成外呼任务: ${id}`);
    return saved;
  }

  async cancel(id: string): Promise<CallTask> {
    const task = await this.findOne(id);
    
    task.status = 'CANCELLED';
    task.completedAt = new Date();
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`取消外呼任务: ${id}`);
    return saved;
  }

  async updateProgress(id: string, completedCalls: number, successfulCalls: number, failedCalls: number): Promise<CallTask> {
    const task = await this.findOne(id);
    
    task.completedCalls = completedCalls;
    task.successfulCalls = successfulCalls;
    task.failedCalls = failedCalls;
    
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    
    this.logger.log(`删除外呼任务: ${id}`);
  }

  async getPendingTasks(): Promise<CallTask[]> {
    return this.taskRepository.find({
      where: { status: 'PENDING' },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }
}
