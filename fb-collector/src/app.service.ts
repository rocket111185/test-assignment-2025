import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  NatsConnection,
  StringCodec,
  connect,
  AckPolicy,
  Consumer,
} from 'nats';
import { FacebookEventSchema, FacebookEvent } from './validator';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private connection: NatsConnection;
  private consumer: Consumer;

  async initializeNats() {
    this.connection = await connect({
      servers: process.env.NATS_URL,
    });

    const js = this.connection.jetstream();
    const jsm = await this.connection.jetstreamManager();
    const STREAM_NAME = 'events';
    const CONSUMER_NAME = 'facebook-consumer';

    await jsm.consumers.add(STREAM_NAME, {
      durable_name: CONSUMER_NAME,
      filter_subject: 'facebook',
      ack_policy: AckPolicy.Explicit,
    });

    this.consumer = await js.consumers.get(STREAM_NAME, CONSUMER_NAME);
  }

  async onModuleInit() {
    await this.initializeNats();
    const codec = StringCodec();
    const messages = await this.consumer.consume();

    try {
      for await (const msg of messages) {
        const decoded = JSON.parse(codec.decode(msg.data));
        const validated = await FacebookEventSchema.safeParseAsync(decoded);

        if (validated.success) {
          const data: FacebookEvent = validated.data;
          console.log('Received an object, source:', data.source);
        } else {
          console.error(
            'This data piece was malfunctioned, source:',
            decoded.source,
          );
        }

        msg.ack();
      }

      console.log('Message stream closed');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async onModuleDestroy() {
    await this.connection.drain();
    console.log('Disconnected from NATS JetStream');
  }
}
