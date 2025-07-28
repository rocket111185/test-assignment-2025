import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('events')
  async getEvents(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Query('source') source: string | undefined,
    @Query('funnelStage') funnelStage: string | undefined,
    @Query('eventType') eventType: string | undefined
  ) {
    const events = await this.reportsService.getEvents({
      from,
      to,
      source,
      funnelStage,
      eventType
    });

    return events;
  }
}
