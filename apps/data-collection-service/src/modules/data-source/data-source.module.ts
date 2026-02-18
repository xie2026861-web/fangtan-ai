import { Module } from '@nestjs/common';
import { DataSourceModule } from './data-source.module';
import { LianjiaCollector } from './collectors/lianjia.collector';
import { BeikeCollector } from './collectors/beike.collector';
import { FangCollector } from './collectors/fang.collector';

@Module({
  imports: [],
  controllers: [],
  providers: [LianjiaCollector, BeikeCollector, FangCollector],
  exports: [LianjiaCollector, BeikeCollector, FangCollector],
})
export class DataSourceModule {}
