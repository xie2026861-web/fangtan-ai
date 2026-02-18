import { IsString, IsOptional, IsEnum, IsNumber, IsObject, Min, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CollectionTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DataSource {
  LIANJIA = 'LIANJIA',
  BEIKE = 'BEIKE',
  FANG = 'FANG',
  ANJUKE = 'ANJUKE',
}

export class CollectionTaskConfigDto {
  @ApiProperty({ description: '目标URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: '区域列表' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '最小价格(万元)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: '最大价格(万元)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: '房产类型' })
  @IsOptional()
  @IsString()
  propertyType?: string;

  @ApiPropertyOptional({ description: '最大页数' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  maxPages?: number;
}

export class CreateTaskDto {
  @ApiProperty({ description: '任务名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '任务描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DataSource, description: '数据来源' })
  @IsEnum(DataSource)
  source: DataSource;

  @ApiProperty({ description: '采集配置' })
  @IsObject()
  config: CollectionTaskConfigDto;

  @ApiPropertyOptional({ description: '优先级', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number = 1;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: '任务名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '任务描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ enum: CollectionTaskStatus, description: '任务状态' })
  @IsOptional()
  @IsEnum(CollectionTaskStatus)
  status?: CollectionTaskStatus;
}

export class TaskQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: CollectionTaskStatus, description: '任务状态' })
  @IsOptional()
  @IsEnum(CollectionTaskStatus)
  status?: CollectionTaskStatus;

  @ApiPropertyOptional({ enum: DataSource, description: '数据来源' })
  @IsOptional()
  @IsEnum(DataSource)
  source?: DataSource;
}

export class StartTaskDto {
  @ApiPropertyOptional({ description: '最大页数' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxPages?: number;
}

export class CompleteTaskDto {
  @ApiProperty({ description: '采集到的数量' })
  @Type(() => Number)
  @IsNumber()
  collectedItems: number;
}

export class FailTaskDto {
  @ApiProperty({ description: '错误信息' })
  @IsString()
  errorMessage: string;
}
