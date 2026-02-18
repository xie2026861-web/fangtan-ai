import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const config = new DocumentBuilder()
    .setTitle('Smart Reach Service')
    .setDescription('房探AI - 智能触达服务 API 文档')
    .setVersion('1.0')
    .addTag('call-tasks', '外呼任务')
    .addTag('call-records', '外呼记录')
    .addTag('call-scripts', '话术管理')
    .addTag('sms-templates', '短信模板')
    .addTag('touch-records', '触达记录')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  logger.log(`智能触达服务已启动: http://localhost:${port}`);
  logger.log(`API文档: http://localhost:${port}/docs`);
}

bootstrap();
