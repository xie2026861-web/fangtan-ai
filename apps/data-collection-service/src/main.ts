import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // 全局前缀
  app.setGlobalPrefix('api/v1');
  
  // 验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('Data Collection Service')
    .setDescription('房探AI - 数据采集服务 API 文档')
    .setVersion('1.0')
    .addTag('properties', '房源管理')
    .addTag('collection-tasks', '采集任务')
    .addTag('statistics', '数据统计')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`数据采集服务已启动: http://localhost:${port}`);
  logger.log(`API文档: http://localhost:${port}/docs`);
}

bootstrap();
