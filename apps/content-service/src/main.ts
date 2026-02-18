import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const config = new DocumentBuilder()
    .setTitle('Content Service')
    .setDescription('房探AI - 内容生成服务 API 文档')
    .setVersion('1.0')
    .addTag('content', '内容生成')
    .addTag('templates', '模板管理')
    .addTag('campaigns', '营销活动')
    .build();
  
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  
  await app.listen(process.env.PORT || 3003);
  Logger.log(`内容生成服务已启动: http://localhost:${process.env.PORT || 3003}`);
}

bootstrap();
