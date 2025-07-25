import { Controller, Post, Body } from '@nestjs/common';
import { EventHandlerService } from './event-handler.service';

@Controller('events')
export class EventHandlerController {
    constructor(private readonly eventHandlerService: EventHandlerService) {}

    @Post()
    async handleEvent(@Body() body: any) {
        await this.eventHandlerService.processEvent(body);
        return { status: 'ok' };
    }
}
