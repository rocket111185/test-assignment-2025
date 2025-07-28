import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ReportsModule],
  controllers: [HealthController],
})
export class AppModule {}
