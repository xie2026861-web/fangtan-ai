import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './dto/property.dto';
import { Property } from './entities/property.entity';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  private readonly logger = new Logger(PropertyController.name);

  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: '创建房源' })
  @ApiResponse({ status: 201, description: '房源创建成功' })
  async create(@Body() createDto: CreatePropertyDto): Promise<Property> {
    this.logger.log(`创建房源: ${createDto.title}`);
    return this.propertyService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '查询房源列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: PropertyQueryDto): Promise<{ data: Property[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.propertyService.findAll(query);
    return {
      data,
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get('statistics/price')
  @ApiOperation({ summary: '获取价格统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPriceStatistics(
    @Query('district') district?: string,
    @Query('propertyType') propertyType?: string,
  ): Promise<any[]> {
    return this.propertyService.getPriceStatistics(district, propertyType);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取房源详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '房源不存在' })
  async findOne(@Param('id') id: string): Promise<Property> {
    return this.propertyService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新房源' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.update(id, updateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '部分更新房源' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除房源' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`删除房源: ${id}`);
    return this.propertyService.remove(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: '批量创建房源' })
  @ApiResponse({ status: 201, description: '批量创建成功' })
  async bulkCreate(@Body() createDtos: CreatePropertyDto[]): Promise<{ created: number; data: Property[] }> {
    this.logger.log(`批量创建房源: ${createDtos.length} 条`);
    const data = await this.propertyService.bulkCreate(createDtos);
    return { created: data.length, data };
  }
}
