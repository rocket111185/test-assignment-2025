import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EventHandlerService } from './event-handler.service';
import { Event } from '../events';

@Controller('events')
export class EventHandlerController {
    constructor(private readonly eventHandlerService: EventHandlerService) {}

    @Post()
    async handleEvent(@Body() body: Event[]) {
        if (!Array.isArray(body)) {
            throw new BadRequestException('Array of events was expected');
        }

        await this.eventHandlerService.processEvent(body);
        return { status: 'ok' };
    }
}
