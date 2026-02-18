import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PropertyStatus {
  ON_SALE = 'ON_SALE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  OFF_MARKET = 'OFF_MARKET',
}

export enum DataSource {
  LIANJIA = 'LIANJIA',
  BEIKE = 'BEIKE',
  FANG = 'FANG',
  ANJUKE = 'ANJUKE',
  DIY = 'DIY',
  MANUAL = 'MANUAL',
}

export class CreatePropertyDto {
  @ApiProperty({ description: '外部系统ID' })
  @IsString()
  externalId: string;

  @ApiProperty({ enum: DataSource, description: '数据来源' })
  @IsEnum(DataSource)
  source: DataSource;

  @ApiProperty({ description: '房源标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '房源描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '房产类型: 住宅, 公寓, 商铺, 写字楼' })
  @IsString()
  propertyType: string;

  @ApiProperty({ description: '交易类型: 出售, 出租' })
  @IsString()
  @IsIn(['出售', '出租'])
  transactionType: string;

  @ApiProperty({ description: '价格' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '价格单位', default: '万元' })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiProperty({ description: '面积(平方米)' })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiPropertyOptional({ description: '卧室数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms?: number;

  @ApiPropertyOptional({ description: '卫生间数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  bathrooms?: number;

  @ApiPropertyOptional({ description: '楼层' })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiPropertyOptional({ description: '总楼层' })
  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @ApiPropertyOptional({ description: '建造年份' })
  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @ApiPropertyOptional({ description: '装修情况' })
  @IsOptional()
  @IsString()
  renovation?: string;

  @ApiPropertyOptional({ description: '朝向' })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiPropertyOptional({ description: '区域' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '城市', default: '上海' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ enum: PropertyStatus, description: '房源状态' })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: '图片URL列表' })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: '经纪人姓名' })
  @IsOptional()
  @IsString()
  agentName?: string;

  @ApiPropertyOptional({ description: '经纪人电话' })
  @IsOptional()
  @IsString()
  agentPhone?: string;

  @ApiPropertyOptional({ description: '经纪公司' })
  @IsOptional()
  @IsString()
  agencyName?: string;
}

export class UpdatePropertyDto {
  @ApiPropertyOptional({ description: '房源标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '房源描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '房源状态' })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: '图片URL列表' })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class PropertyQueryDto {
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

  @ApiPropertyOptional({ enum: DataSource, description: '数据来源' })
  @IsOptional()
  @IsEnum(DataSource)
  source?: DataSource;

  @ApiPropertyOptional({ enum: PropertyStatus, description: '房源状态' })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '区域' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '最低价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: '最高价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: '房产类型' })
  @IsOptional()
  @IsString()
  propertyType?: string;

  @ApiPropertyOptional({ description: '交易类型' })
  @IsOptional()
  @IsString()
  @IsIn(['出售', '出租'])
  transactionType?: string;
}
