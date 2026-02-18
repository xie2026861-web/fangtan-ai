import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Property } from '../property/entities/property.entity';

@Injectable()
export class FangCollector {
  private readonly logger = new Logger(FangCollector.name);
  private readonly baseUrl = 'https://sh.fang.com/ershoufang/';

  async collect(
    config: { district?: string; minPrice?: number; maxPrice?: number; maxPages?: number },
    onItem: (property: Partial<Property>) => Promise<void>,
  ): Promise<number> {
    this.logger.log('开始采集房天下房源数据...');

    let collectedCount = 0;
    const maxPages = config.maxPages || 50;

    try {
      for (let page = 1; page <= maxPages; page++) {
        try {
          const url = this.buildUrl(page, config);
          this.logger.debug(`采集页面: ${url}`);

          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 30000,
          });

          const properties = this.parseProperties(response.data);
          
          if (properties.length === 0) {
            this.logger.log(`页面 ${page} 无数据，停止采集`);
            break;
          }

          for (const property of properties) {
            await onItem(property);
            collectedCount++;
          }

          this.logger.log(`页面 ${page} 采集完成，本页 ${properties.length} 条`);
        } catch (error) {
          this.logger.error(`采集页面 ${page} 失败: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`房天下采集失败: ${error.message}`);
    }

    this.logger.log(`房天下采集完成，共 ${collectedCount} 条`);
    return collectedCount;
  }

  private buildUrl(page: number, config: any): string {
    let url = `${this.baseUrl}i3${page}/`;
    
    if (config.district) {
      url = `https://${config.district}.fang.com/ershoufang/ls${page}/`;
    }
    
    return url;
  }

  private parseProperties(html: string): Partial<Property>[] {
    const $ = cheerio.load(html);
    const properties: Partial<Property>[] = [];

    $('.nlc_details_list li').each((_, element) => {
      try {
        const title = $(element).find('.tit a').text().trim();
        const priceText = $(element).find('.price').text();
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
        const address = $(element).find('.add').text().trim();
        const areaMatch = address.match(/(\d+\.?\d*)㎡/);
        const area = areaMatch ? parseFloat(areaMatch[1]) : 0;
        const district = $(element).find('.add a').first().text().trim();
        const link = $(element).find('.tit a').attr('href');
        const externalId = link?.split('/').pop()?.replace('.html', '') || '';

        if (title && price > 0) {
          properties.push({
            externalId,
            source: 'FANG',
            title,
            price,
            priceUnit: '万元',
            area,
            district,
            address,
            status: 'ON_SALE',
          });
        }
      } catch (error) {
        this.logger.error(`解析房源失败: ${error.message}`);
      }
    });

    return properties;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(this.baseUrl, { timeout: 10000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
