import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NatsConnection, JetStreamClient, StringCodec, connect } from 'nats';
import { Event } from '../events';

@Injectable()
export class EventHandlerService implements OnModuleInit, OnModuleDestroy {
    private connection: NatsConnection;
    private jetStream: JetStreamClient;
    private codec = StringCodec();

    async onModuleInit() {
        this.connection = await connect({
            servers: process.env.NATS_URL
        });

        this.jetStream = this.connection.jetstream();
        const jetstreamManager = await this.connection.jetstreamManager();
        console.log('Connected to NATS JetStream');

        // Ensure stream exists
        try {
            await jetstreamManager.streams.info('events');
        } catch {
            await jetstreamManager.streams.add({
                name: 'events',
                subjects: ['facebook', 'tiktok'],
            });

            console.log('Created stream "events"');
        }
    }

    async onModuleDestroy() {
        await this.connection.drain();
        console.log('Disconnected from NATS JetStream');
    }

    async publish(event: Event) {
        const data = this.codec.encode(JSON.stringify(event));
        await this.jetStream.publish(event.source, data);
    }

    async processEvent(body: Event[]) {
        for (let i = 0; i < 10; i++) {
            const event = body[i];
            await this.publish(event);
        }

        console.log('Processed a batch of events');
    }
}
