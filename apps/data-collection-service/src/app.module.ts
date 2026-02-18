import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyModule } from './modules/property/property.module';
import { CollectionTaskModule } from './modules/collection-task/collection-task.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.LOG_LEVEL === 'debug',
    }),
    PropertyModule,
    CollectionTaskModule,
    DataSourceModule,
    StatisticsModule,
  ],
})
export class AppModule {}
