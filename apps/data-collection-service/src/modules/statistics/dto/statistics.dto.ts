import { IsString, IsOptional, IsEnum, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PriceStatisticsQueryDto {
  @ApiPropertyOptional({ description: '城市', default: '上海' })
  @IsOptional()
  @IsString()
  city?: string = '上海';

  @ApiPropertyOptional({ description: '区域' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '房产类型' })
  @IsOptional()
  @IsString()
  propertyType?: string;
}

export class CollectionLogQueryDto {
  @ApiPropertyOptional({ description: '任务ID' })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({ description: '数据来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '日志级别' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: '限制数量', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 100;
}

export class CreateLogDto {
  @ApiProperty({ description: '日志级别' })
  @IsString()
  level: string;

  @ApiProperty({ description: '日志消息' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '任务ID' })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({ description: '数据来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '元数据' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class RecordStatisticsDto {
  @ApiProperty({ description: '区域' })
  @IsString()
  district: string;

  @ApiPropertyOptional({ description: '城市', default: '上海' })
  @IsOptional()
  @IsString()
  city?: string = '上海';

  @ApiProperty({ description: '房产类型' })
  @IsString()
  propertyType: string;

  @ApiProperty({ description: '平均价格' })
  @IsNumber()
  avgPrice: number;

  @ApiProperty({ description: '最低价格' })
  @IsNumber()
  minPrice: number;

  @ApiProperty({ description: '最高价格' })
  @IsNumber()
  maxPrice: number;

  @ApiProperty({ description: '房源数量' })
  @IsNumber()
  count: number;
}
