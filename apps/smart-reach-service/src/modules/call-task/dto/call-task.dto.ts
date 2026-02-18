import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CallTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export class CreateTaskDto {
  @ApiProperty({ description: '任务名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '任务描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '话术ID' })
  @IsOptional()
  @IsString()
  scriptId?: string;

  @ApiProperty({ description: '客户ID列表' })
  @IsArray()
  customerIds: string[];

  @ApiPropertyOptional({ description: '优先级', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number = 1;

  @ApiPropertyOptional({ description: '计划执行时间' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
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

  @ApiPropertyOptional({ description: '话术ID' })
  @IsOptional()
  @IsString()
  scriptId?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: '计划执行时间' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
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

  @ApiPropertyOptional({ enum: CallTaskStatus, description: '任务状态' })
  @IsOptional()
  @IsEnum(CallTaskStatus)
  status?: CallTaskStatus;
}

export class ProgressDto {
  @ApiProperty({ description: '已完成数量' })
  @Type(() => Number)
  @IsNumber()
  completedCalls: number;

  @ApiProperty({ description: '成功数量' })
  @Type(() => Number)
  @IsNumber()
  successfulCalls: number;

  @ApiProperty({ description: '失败数量' })
  @Type(() => Number)
  @IsNumber()
  failedCalls: number;
}
