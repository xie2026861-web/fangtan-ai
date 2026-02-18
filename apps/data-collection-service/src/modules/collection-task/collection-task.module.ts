import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionTask } from './entities/collection-task.entity';
import { CollectionTaskService } from './collection-task.service';
import { CollectionTaskController } from './collection-task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionTask])],
  controllers: [CollectionTaskController],
  providers: [CollectionTaskService],
  exports: [CollectionTaskService],
})
export class CollectionTaskModule {}
