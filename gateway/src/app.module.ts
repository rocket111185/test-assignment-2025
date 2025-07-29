import { Module } from '@nestjs/common';
import { EventHandlerModule } from './event-handler/event-handler.module';

@Module({
  imports: [EventHandlerModule],
})
export class AppModule {}
