import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../prisma/client';

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

  async getEvents(filters: any): Promise<any> {
    return filters;
  }
}
