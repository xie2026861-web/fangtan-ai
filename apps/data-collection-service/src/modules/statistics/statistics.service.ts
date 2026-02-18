import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PriceStatistics } from './entities/price-statistics.entity';
import { CollectionLog } from './entities/collection-log.entity';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(PriceStatistics)
    private readonly statisticsRepository: Repository<PriceStatistics>,
    @InjectRepository(CollectionLog)
    private readonly logRepository: Repository<CollectionLog>,
  ) {}

  async getPriceStatistics(
    city: string = '上海',
    district?: string,
    propertyType?: string,
  ): Promise<PriceStatistics[]> {
    const queryBuilder = this.statisticsRepository
      .createQueryBuilder('stats')
      .where('stats.city = :city', { city });

    if (district) {
      queryBuilder.andWhere('stats.district = :district', { district });
    }

    if (propertyType) {
      queryBuilder.andWhere('stats.propertyType = :propertyType', { propertyType });
    }

    queryBuilder.orderBy('stats.avgPrice', 'DESC');

    return queryBuilder.getMany();
  }

  async recordPriceStatistics(
    district: string,
    city: string,
    propertyType: string,
    avgPrice: number,
    minPrice: number,
    maxPrice: number,
    count: number,
  ): Promise<PriceStatistics> {
    const statistics = this.statisticsRepository.create({
      district,
      city,
      propertyType,
      avgPrice,
      minPrice,
      maxPrice,
      count,
    });

    return this.statisticsRepository.save(statistics);
  }

  async getCollectionLogs(
    taskId?: string,
    source?: string,
    level?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<CollectionLog[]> {
    const queryBuilder = this.logRepository.createQueryBuilder('log');

    if (taskId) {
      queryBuilder.andWhere('log.taskId = :taskId', { taskId });
    }

    if (source) {
      queryBuilder.andWhere('log.source = :source', { source });
    }

    if (level) {
      queryBuilder.andWhere('log.level = :level', { level });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }

  async log(
    level: string,
    message: string,
    taskId?: string,
    source?: string,
    metadata?: Record<string, any>,
  ): Promise<CollectionLog> {
    const log = this.logRepository.create({
      level,
      message,
      taskId,
      source,
      metadata,
    });

    return this.logRepository.save(log);
  }

  async getCollectionSummary(source?: string): Promise<any> {
    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .select('log.source', 'source')
      .addSelect('log.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) });

    if (source) {
      queryBuilder.andWhere('log.source = :source', { source });
    }

    queryBuilder.groupBy('log.source').addGroupBy('log.level');

    return queryBuilder.getRawMany();
  }
}
