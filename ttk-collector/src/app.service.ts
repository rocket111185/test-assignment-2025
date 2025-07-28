import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NatsConnection, StringCodec, connect, AckPolicy, Consumer } from 'nats';
import { PrismaClient, TiktokEvent as PrismaTiktokEvent } from '../prisma/client';
import {
  TiktokEventSchema,
  TiktokEvent,
  TiktokEngagementTop,
  TiktokEngagementBottom
} from './validator';

// We don't want to set ID explicitly
// Besides that, it must be OK to specify time in string
type DbTiktokEvent = Omit<PrismaTiktokEvent, 'id' | 'timestamp'> & {
  timestamp: string
};

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
    console.log('Connected to the database');
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

      const eventInput: DbTiktokEvent = {
        ...eventData,
        userId: userObject.id,
        engagementTopId: null,
        engagementBottomId: null
      };

      if (eventData.funnelStage === 'top') {
        const engagementObject = await tx.tiktokEngagementTop.create({
          data: engagement as TiktokEngagementTop
        });

        eventInput.engagementTopId = engagementObject.id;
      } else if (eventData.funnelStage === 'bottom') {
        const engagementObject = await tx.tiktokEngagementBottom.create({
          data: engagement as TiktokEngagementBottom
        });

        eventInput.engagementBottomId = engagementObject.id;
      }

      await tx.tiktokEvent.create({ data: eventInput });
    });
  }

  async onModuleInit() {
    await this.initializeNats();
    await this.initializePrisma();

    const codec = StringCodec();
    const messages = await this.consumer.consume();

    try {
      for await (const msg of messages) {
        const decoded = JSON.parse(codec.decode(msg.data));
        const validated = await TiktokEventSchema.safeParseAsync(decoded);

        if (validated.success && validated.data) {
          await this.processEvent(validated.data);
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
    console.log('Disconnected from the database');

    await this.connection.drain();
    console.log('Disconnected from NATS JetStream');
  }
}
