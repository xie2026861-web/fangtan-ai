import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionTask } from './entities/collection-task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/collection-task.dto';

@Injectable()
export class CollectionTaskService {
  private readonly logger = new Logger(CollectionTaskService.name);

  constructor(
    @InjectRepository(CollectionTask)
    private readonly taskRepository: Repository<CollectionTask>,
  ) {}

  async create(createDto: CreateTaskDto): Promise<CollectionTask> {
    const task = this.taskRepository.create({
      ...createDto,
      status: 'PENDING',
    });
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`创建采集任务: ${saved.id} - ${saved.name}`);
    return saved;
  }

  async findAll(query: TaskQueryDto): Promise<{ data: CollectionTask[]; total: number }> {
    const { page = 1, limit = 20, status, source } = query;

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('task.source = :source', { source });
    }

    queryBuilder
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<CollectionTask> {
    const task = await this.taskRepository.findOne({ where: { id } });
    
    if (!task) {
      throw new NotFoundException(`采集任务不存在: ${id}`);
    }

    return task;
  }

  async update(id: string, updateDto: UpdateTaskDto): Promise<CollectionTask> {
    const task = await this.findOne(id);
    
    Object.assign(task, updateDto);
    const saved = await this.taskRepository.save(task);
    
    this.logger.log(`更新采集任务: ${id}`);
    return saved;
  }

  async start(id: string): Promise<CollectionTask> {
    const task = await this.findOne(id);
    
    task.status = 'IN_PROGRESS';
    task.startedAt = new Date();
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`开始采集任务: ${id}`);
    return saved;
  }

  async complete(id: string, collectedItems: number): Promise<CollectionTask> {
    const task = await this.findOne(id);
    
    task.status = 'COMPLETED';
    task.completedAt = new Date();
    task.collectedItems = collectedItems;
    
    const saved = await this.taskRepository.save(task);
    this.logger.log(`完成采集任务: ${id}, 采集数量: ${collectedItems}`);
    return saved;
  }

  async fail(id: string, errorMessage: string): Promise<CollectionTask> {
    const task = await this.findOne(id);
    
    task.status = 'FAILED';
    task.errorMessage = errorMessage;
    task.completedAt = new Date();
    
    const saved = await this.taskRepository.save(task);
    this.logger.error(`采集任务失败: ${id} - ${errorMessage}`);
    return saved;
  }

  async updateProgress(id: string, collectedPages: number, collectedItems: number): Promise<CollectionTask> {
    const task = await this.findOne(id);
    
    task.collectedPages = collectedPages;
    task.collectedItems = collectedItems;
    
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    
    this.logger.log(`删除采集任务: ${id}`);
  }

  async getPendingTasks(): Promise<CollectionTask[]> {
    return this.taskRepository.find({
      where: { status: 'PENDING' },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }
}
