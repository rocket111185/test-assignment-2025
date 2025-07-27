import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NatsConnection, StringCodec, connect, ConsumerMessages } from 'nats';
import { Event } from './events';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private connection: NatsConnection;

  async onModuleInit() {
    this.connection = await connect({
      servers: process.env.NATS_URL
    });

    const codec = StringCodec();
    const js = this.connection.jetstream();

    const consumer = await js.consumers.get('events');
    const messages = await consumer.consume();

    // Consume messages using async iterator
    try {
      for await (const msg of messages) {
        const decoded: Event = JSON.parse(codec.decode(msg.data));
        console.log('[Consumer] Received:', decoded);
        msg.ack();
      }

      console.log('[Consumer] Message stream closed');
    } catch (error) {
      console.error('[Consumer] Error:', error);
    }
  }

  async onModuleDestroy() {
    await this.connection.drain();
    console.log('Disconnected from NATS JetStream');
  }
}
