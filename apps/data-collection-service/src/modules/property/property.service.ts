import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './dto/property.dto';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(createDto: CreatePropertyDto): Promise<Property> {
    // 检查是否已存在
    const existing = await this.propertyRepository.findOne({
      where: { externalId: createDto.externalId, source: createDto.source },
    });

    if (existing) {
      // 更新现有记录
      return this.update(existing.id, createDto);
    }

    const property = this.propertyRepository.create(createDto);
    const saved = await this.propertyRepository.save(property);
    
    this.logger.log(`创建房源成功: ${saved.id} - ${saved.title}`);
    return saved;
  }

  async findAll(query: PropertyQueryDto): Promise<{ data: Property[]; total: number }> {
    const { page = 1, limit = 20, source, status, city, district, minPrice, maxPrice, propertyType, transactionType } = query;

    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    if (source) {
      queryBuilder.andWhere('property.source = :source', { source });
    }

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }

    if (city) {
      queryBuilder.andWhere('property.city = :city', { city });
    }

    if (district) {
      queryBuilder.andWhere('property.district LIKE :district', { district: `%${district}%` });
    }

    if (minPrice) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', { propertyType });
    }

    if (transactionType) {
      queryBuilder.andWhere('property.transactionType = :transactionType', { transactionType });
    }

    queryBuilder
      .orderBy('property.collectedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({ where: { id } });
    
    if (!property) {
      throw new NotFoundException(`房源不存在: ${id}`);
    }

    return property;
  }

  async update(id: string, updateDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    
    Object.assign(property, updateDto);
    const saved = await this.propertyRepository.save(property);
    
    this.logger.log(`更新房源成功: ${id}`);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
    
    this.logger.log(`删除房源成功: ${id}`);
  }

  async bulkCreate(properties: CreatePropertyDto[]): Promise<Property[]> {
    const results: Property[] = [];
    
    for (const dto of properties) {
      try {
        const property = await this.create(dto);
        results.push(property);
      } catch (error) {
        this.logger.error(`批量创建房源失败: ${dto.externalId}`, error);
      }
    }

    this.logger.log(`批量创建房源完成: 成功 ${results.length}/${properties.length}`);
    return results;
  }

  async getPriceStatistics(district?: string, propertyType?: string) {
    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .select('property.district', 'district')
      .addSelect('property.propertyType', 'propertyType')
      .addSelect('AVG(property.price)', 'avgPrice')
      .addSelect('MIN(property.price)', 'minPrice')
      .addSelect('MAX(property.price)', 'maxPrice')
      .addSelect('COUNT(*)', 'count')
      .where('property.status = :status', { status: 'ON_SALE' });

    if (district) {
      queryBuilder.andWhere('property.district = :district', { district });
    }

    if (propertyType) {
      queryBuilder.andWhere('property.propertyType = :propertyType', { propertyType });
    }

    queryBuilder.groupBy('property.district').addGroupBy('property.propertyType');

    return queryBuilder.getRawMany();
  }
}
