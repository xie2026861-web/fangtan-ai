import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WinstonLoggerService } from './common/logger/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerService(),
  });

  const configService = app.get(ConfigService);

  // 安全中间件
  app.use(helmet());

  // 压缩响应
  app.use(compression());

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // CORS配置
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Swagger文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fangtan AI API')
    .setDescription('房探AI - 房产经纪人专属AI营销智能体矩阵 API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关')
    .addTag('users', '用户管理')
    .addTag('customers', '客户管理')
    .addTag('reach', '触达任务')
    .addTag('content', '内容生成')
    .addTag('crm', 'CRM协同')
    .addTag('compliance', '合规管理')
    .addTag('analytics', '数据分析')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT', 3001);
  
  await app.listen(port);
  
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🏠 Fangtan AI API Gateway                          ║
  ║                                                       ║
  ║   API文档: http://localhost:${port}/docs             ║
  ║   健康检查: http://localhost:${port}/health          ║
  ║                                                       ║
  ║   环境: ${configService.get('NODE_ENV', 'development')}                            ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
