import { Module } from '@nestjs/common';
import { DataCollectionController } from './data-collection.controller';
import { DataCollectionService } from './data-collection.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DataCollectionController],
  providers: [DataCollectionService],
  exports: [DataCollectionService],
})
export class DataCollectionModule {}
