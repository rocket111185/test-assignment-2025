import { Module } from '@nestjs/common';
import { EventHandlerModule } from './event-handler/event-handler.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [EventHandlerModule],
  controllers: [HealthController],
})
export class AppModule {}
