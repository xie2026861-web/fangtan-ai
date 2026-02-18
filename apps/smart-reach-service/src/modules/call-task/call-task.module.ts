import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallTask } from './entities/call-task.entity';
import { CallTaskService } from './call-task.service';
import { CallTaskController } from './call-task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CallTask])],
  controllers: [CallTaskController],
  providers: [CallTaskService],
  exports: [CallTaskService],
})
export class CallTaskModule {}
