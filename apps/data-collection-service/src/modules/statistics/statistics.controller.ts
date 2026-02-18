import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { PriceStatisticsQueryDto, CollectionLogQueryDto, CreateLogDto, RecordStatisticsDto } from './dto/statistics.dto';
import { PriceStatistics } from './entities/price-statistics.entity';
import { CollectionLog } from './entities/collection-log.entity';

@ApiTags('statistics')
@ApiBearerAuth()
@Controller('statistics')
export class StatisticsController {
  private readonly logger = new Logger(StatisticsController.name);

  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('price')
  @ApiOperation({ summary: '获取价格统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPriceStatistics(@Query() query: PriceStatisticsQueryDto): Promise<PriceStatistics[]> {
    return this.statisticsService.getPriceStatistics(
      query.city,
      query.district,
      query.propertyType,
    );
  }

  @Post('price')
  @ApiOperation({ summary: '记录价格统计' })
  @ApiResponse({ status: 201, description: '记录成功' })
  async recordPriceStatistics(@Body() dto: RecordStatisticsDto): Promise<PriceStatistics> {
    return this.statisticsService.recordPriceStatistics(
      dto.district,
      dto.city || '上海',
      dto.propertyType,
      dto.avgPrice,
      dto.minPrice,
      dto.maxPrice,
      dto.count,
    );
  }

  @Get('logs')
  @ApiOperation({ summary: '获取采集日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCollectionLogs(@Query() query: CollectionLogQueryDto): Promise<CollectionLog[]> {
    return this.statisticsService.getCollectionLogs(
      query.taskId,
      query.source,
      query.level,
      query.startDate,
      query.endDate,
      query.limit,
    );
  }

  @Post('logs')
  @ApiOperation({ summary: '创建日志' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createLog(@Body() dto: CreateLogDto): Promise<CollectionLog> {
    return this.statisticsService.log(
      dto.level,
      dto.message,
      dto.taskId,
      dto.source,
      dto.metadata,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: '获取采集汇总' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCollectionSummary(@Query('source') source?: string): Promise<any> {
    return this.statisticsService.getCollectionSummary(source);
  }
}
