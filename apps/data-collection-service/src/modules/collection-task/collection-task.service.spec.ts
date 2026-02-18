import { Test, TestingModule } from '@nestjs/testing';
import { CollectionTaskService } from './collection-task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionTask } from './entities/collection-task.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CollectionTaskService', () => {
  let service: CollectionTaskService;
  let repository: Repository<CollectionTask>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionTaskService,
        {
          provide: getRepositoryToken(CollectionTask),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CollectionTaskService>(CollectionTaskService);
    repository = module.get<Repository<CollectionTask>>(getRepositoryToken(CollectionTask));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task with PENDING status', async () => {
      const createDto = {
        name: '采集链家上海房源',
        source: 'LIANJIA',
        config: { url: 'https://sh.lianjia.com/ershoufang/' },
      };

      const savedTask = { id: 'uuid-1', ...createDto, status: 'PENDING' };

      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: createDto.name,
        status: 'PENDING',
      }));
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('PENDING');
    });
  });

  describe('findOne', () => {
    it('should return a task', async () => {
      const task = { id: 'uuid-1', name: '测试任务' };
      mockRepository.findOne.mockResolvedValue(task);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(task);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('start', () => {
    it('should update task status to IN_PROGRESS', async () => {
      const task = { id: 'uuid-1', name: '测试任务', status: 'PENDING' };
      const startedTask = { ...task, status: 'IN_PROGRESS', startedAt: new Date() };

      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(startedTask);

      const result = await service.start('uuid-1');

      expect(result.status).toBe('IN_PROGRESS');
      expect(result.startedAt).toBeDefined();
    });
  });

  describe('complete', () => {
    it('should update task status to COMPLETED', async () => {
      const task = { id: 'uuid-1', name: '测试任务', status: 'IN_PROGRESS' };
      const completedTask = { ...task, status: 'COMPLETED', completedAt: new Date(), collectedItems: 100 };

      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(completedTask);

      const result = await service.complete('uuid-1', 100);

      expect(result.status).toBe('COMPLETED');
      expect(result.collectedItems).toBe(100);
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('fail', () => {
    it('should update task status to FAILED', async () => {
      const task = { id: 'uuid-1', name: '测试任务', status: 'IN_PROGRESS' };
      const failedTask = { ...task, status: 'FAILED', errorMessage: '网络错误', completedAt: new Date() };

      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue(failedTask);

      const result = await service.fail('uuid-1', '网络错误');

      expect(result.status).toBe('FAILED');
      expect(result.errorMessage).toBe('网络错误');
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const task = { id: 'uuid-1', name: '测试任务' };
      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.remove.mockResolvedValue(task);

      await service.remove('uuid-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(task);
    });
  });
});
