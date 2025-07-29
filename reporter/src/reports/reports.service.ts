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
        _count: true
      });

      result.facebook = facebookResults.reduce((acc, value) => ({
        ...acc,
        [value.eventType]: value._count
      }), {});
    }

    if (!source || source !== Source.facebook) {
      const tiktokResults = await this.prisma.tiktokEvent.groupBy({
        where,
        by: ['eventType'],
        _count: true
      });

      result.tiktok = tiktokResults.reduce((acc, value) => ({
        ...acc,
        [value.eventType]: value._count
      }), {});
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

    const where = {
      events: {
        some: {
          timestamp: {
            gte: new Date(from),
            lte: new Date(to),
          }
        }
      }
    };

    if (source === Source.facebook) {
      const [gender, country, age] = await Promise.all([
        this.prisma.facebookUser.groupBy({
          where,
          by: ['gender'],
          _count: true
        }),

        this.prisma.facebookUser.groupBy({
          where,
          by: ['country'],
          _count: true
        }),

        this.prisma.facebookUser.groupBy({
          where,
          by: ['age'],
          _count: true
        }),
      ]);

      return {
        gender: gender.reduce((acc, value) => ({
          ...acc,
          [value.gender]: value._count
        }), {}),

        country: country.reduce((acc, value) => ({
          ...acc,
          [value.country]: value._count
        }), {}),

        age: age.reduce((acc, value) => ({
          ...acc,
          [value.age]: value._count
        }), {}),
      };
    } else if (source === Source.tiktok) {
      const { _min, _max } = await this.prisma.tiktokUser.aggregate({
        _min: { followers: true },
        _max: { followers: true },
      });

      const min = _min.followers ?? 0;
      const max = _max.followers ?? 0;
      const bucketCount = 10;
      const step = Math.ceil((max - min + 1) / bucketCount);

      // Dynamic breaking into chunks
      const ranges = Array.from({ length: bucketCount }, (_, i) => {
        const from = min + i * step;
        const to = from + step - 1;
        return { label: `${from}-${to}`, from, to };
      });

      const counts = await Promise.all(
        ranges.map(async ({ from, to, label }) => {
          const count = await this.prisma.tiktokUser.count({
            where: {
              followers: { gte: from, lte: to },
            },
          });
          return { range: label, count };
        })
      );

      return {
        followers: counts.reduce((acc, value) => ({
          ...acc,
          [value.range]: value.count
        }), {}),
      };
    }

    return {};
  }
}
