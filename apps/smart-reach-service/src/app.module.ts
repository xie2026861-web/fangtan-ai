import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CallTaskModule } from './modules/call-task/call-task.module';
import { CallRecordModule } from './modules/call-record/call-record.module';
import { CallScriptModule } from './modules/call-script/call-script.module';
import { SmsTemplateModule } from './modules/sms-template/sms-template.module';
import { TouchRecordModule } from './modules/touch-record/touch-record.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ScheduleModule.forRoot(),
    CallTaskModule,
    CallRecordModule,
    CallScriptModule,
    SmsTemplateModule,
    TouchRecordModule,
  ],
})
export class AppModule {}
