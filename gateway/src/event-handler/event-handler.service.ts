import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EventHandlerService implements OnModuleInit {
    async onModuleInit() {
        console.log('YES!');
    }

    async processEvent(body: any) {
        console.log(body);
    }
}
