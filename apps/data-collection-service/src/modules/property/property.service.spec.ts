import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PropertyService', () => {
  let service: PropertyService;
  let repository: Repository<Property>;

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
        PropertyService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    repository = module.get<Repository<Property>>(getRepositoryToken(Property));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const createDto = {
        externalId: 'test-001',
        source: 'LIANJIA' as any,
        title: '测试房源',
        propertyType: '住宅',
        transactionType: '出售',
        price: 500,
        area: 100,
      };

      const savedProperty = { id: 'uuid-1', ...createDto };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedProperty);
      mockRepository.save.mockResolvedValue(savedProperty);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedProperty);
    });

    it('should update existing property', async () => {
      const createDto = {
        externalId: 'test-001',
        source: 'LIANJIA' as any,
        title: '测试房源',
        propertyType: '住宅',
        transactionType: '出售',
        price: 500,
        area: 100,
      };

      const existingProperty = { id: 'uuid-1', externalId: 'test-001', source: 'LIANJIA' };
      const updatedProperty = { ...existingProperty, price: 600 };

      mockRepository.findOne.mockResolvedValue(existingProperty);
      mockRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(updatedProperty);
    });
  });

  describe('findOne', () => {
    it('should return a property', async () => {
      const property = { id: 'uuid-1', title: '测试房源' };
      mockRepository.findOne.mockResolvedValue(property);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(property);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('should throw NotFoundException if property not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const properties = [
        { id: 'uuid-1', title: '房源1' },
        { id: 'uuid-2', title: '房源2' },
      ];

      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([properties, 2]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(properties);
      expect(result.total).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove a property', async () => {
      const property = { id: 'uuid-1', title: '测试房源' };
      mockRepository.findOne.mockResolvedValue(property);
      mockRepository.remove.mockResolvedValue(property);

      await service.remove('uuid-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(property);
    });
  });
});
