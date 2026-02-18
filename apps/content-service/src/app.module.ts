import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from './modules/content/content.module';
import { TemplateModule } from './modules/template/template.module';
import { CampaignModule } from './modules/campaign/campaign.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ContentModule,
    TemplateModule,
    CampaignModule,
  ],
})
export class AppModule {}
