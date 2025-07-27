import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NatsConnection, StringCodec, connect, AckPolicy, Consumer } from 'nats';
import { PrismaClient } from '../prisma/client';
import { TiktokEventSchema, TiktokEvent } from './validator';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private connection: NatsConnection;
  private consumer: Consumer;
  private prisma: PrismaClient;

  async initializeNats() {
    this.connection = await connect({
      servers: process.env.NATS_URL
    });

    const js = this.connection.jetstream();
    const jsm = await this.connection.jetstreamManager();
    const STREAM_NAME = 'events';
    const CONSUMER_NAME = 'tiktok-consumer';

    await jsm.consumers.add(STREAM_NAME, {
      durable_name: CONSUMER_NAME,
      filter_subject: 'tiktok',
      ack_policy: AckPolicy.Explicit
    });

    this.consumer = await js.consumers.get(STREAM_NAME, CONSUMER_NAME);
  }

  async initializePrisma() {
    this.prisma = new PrismaClient();
    await this.prisma.$connect();
  }

  async processEvent(event: TiktokEvent) {
    await this.prisma.$transaction(async (tx) => {
      const { data, ...eventData } = event;
      const { user, engagement } = data;
      let userObject = await tx.tiktokUser.findFirst({
        where: {
          userId: user.userId
        }
      });

      if (!userObject) {
        userObject = await tx.tiktokUser.create({ data: user });
      }

      const engagementObject = await tx.tiktokEngagement.create({
        data: engagement
      });

      await tx.tiktokEvent.create({
        data: {
          ...eventData,
          userId: user.userId,
          engagementId: engagementObject.id
        }
      });
    });
  }

  async onModuleInit() {
    await this.initializeNats();
    const codec = StringCodec();
    const messages = await this.consumer.consume();

    try {
      for await (const msg of messages) {
        const decoded = JSON.parse(codec.decode(msg.data));
        const validated = await TiktokEventSchema.safeParseAsync(decoded);

        if (validated.success) {
          const data: TiktokEvent = validated.data;
          console.log('Received an object, source:', data.source);
        } else {
          console.error('This data piece was malfunctioned, source:', decoded.source);
        }

        msg.ack();
      }

      console.log('Message stream closed');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.connection.drain();
    console.log('Disconnected from NATS JetStream');
  }
}
