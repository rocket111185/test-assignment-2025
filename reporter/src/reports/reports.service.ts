import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../prisma/client';
import { Source } from './dto/enums';
import { GetEventsParams } from './dto/events.dto';
import { GetRevenueParams } from './dto/revenue.dto';
import { GetDemographicsParams } from './dto/demographics.dto';

type GetEventsResult = {
  facebook?: any;
  tiktok?: any;
};

type GetRevenueResult = {
  purchaseAmount: number | null;
};

type GroupResult<Field extends string> = {
  _count: {
    [K in Field]: number
  };
} & {
  [K in Field]: string
};

type TransformedResult = {
  [key: string]: number
};

@Injectable()
export class ReportsService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  async onModuleInit() {
    this.prisma = new PrismaClient();
    await this.prisma.$connect();
    console.log('Connected to the database');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    console.log('Disconnected from the database');
  }

  private transformEventResults(groupResults: GroupResult<'eventType'>[]): TransformedResult {
    const result: TransformedResult = {};

    for (const groupInfo of groupResults) {
      const count = groupInfo._count.eventType;
      const { eventType } = groupInfo;

      result[eventType] = count;
    }

    return result;
  }

  async getEvents(filters: GetEventsParams): Promise<GetEventsResult> {
    const { from, to, source, funnelStage, eventType } = filters;

    const timestamp = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };

    const where = {
      ...(Object.keys(timestamp).length > 0 && { timestamp }),
      ...(funnelStage && { funnelStage }),
      ...(eventType && { eventType }),
    };

    const result: GetEventsResult = {};

    if (!source || source !== Source.tiktok) {
      const facebookResults = await this.prisma.facebookEvent.groupBy({
        where,
        by: ['eventType'],
        _count: {
          eventType: true
        }
      });

      result.facebook = this.transformEventResults(facebookResults);
    }

    if (!source || source !== Source.facebook) {
      const tiktokResults = await this.prisma.tiktokEvent.groupBy({
        where,
        by: ['eventType'],
        _count: {
          eventType: true
        }
      });

      result.tiktok = this.transformEventResults(tiktokResults);
    }

    return result;
  }

  async getRevenue(filters: GetRevenueParams): Promise<GetRevenueResult> {
    const { from, to, source, campaignId } = filters;
    const result: GetRevenueResult = {
      purchaseAmount: 0
    };

    const where = {
      event: {
        timestamp: {
          gte: new Date(from),
          lte: new Date(to),
        }
      },
      ...(campaignId && source === Source.facebook && { campaignId })
    };

    if (source === Source.facebook) {
      const aggregation = await this.prisma.facebookEngagementBottom.aggregate({
        where,
        _sum: {
          purchaseAmount: true
        }
      });

      result.purchaseAmount = aggregation._sum.purchaseAmount;
    }else if (source === Source.tiktok) {
      const aggregation = await this.prisma.tiktokEngagementBottom.aggregate({
        where,
        _sum: {
          purchaseAmount: true
        }
      });

      result.purchaseAmount = aggregation._sum.purchaseAmount;
    }

    return result;
  }

  async getDemographics(filters: GetDemographicsParams): Promise<any> {
    const { from, to, source } = filters;

    const result: any = {};
    return result;
  }
}
