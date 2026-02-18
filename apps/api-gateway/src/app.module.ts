import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DataCollectionModule } from './data-collection/data-collection.module';
import { SmartReachModule } from './smart-reach/smart-reach.module';
import { ContentGenerationModule } from './content-generation/content-generation.module';
import { CrmModule } from './crm/crm.module';
import { ComplianceModule } from './compliance/compliance.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Prisma数据库模块
    PrismaModule,

    // 功能模块
    AuthModule,
    UsersModule,
    DataCollectionModule,
    SmartReachModule,
    ContentGenerationModule,
    CrmModule,
    ComplianceModule,

    // 健康检查模块
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
