import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GetEventsDto } from './dto/events.dto';
import { GetRevenueDto } from './dto/revenue.dto';
import { GetDemographicsDto } from './dto/demographics.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('events')
  async getEvents(@Query() query: GetEventsDto) {
    const events = await this.reportsService.getEvents(query);
    return events;
  }

  @Get('revenue')
  async getRevenue(@Query() query: GetRevenueDto) {
    const revenue = await this.reportsService.getRevenue(query);
    return revenue;
  }

  @Get('demographics')
  async getDemographics(@Query() query: GetDemographicsDto) {
    const demographics = await this.reportsService.getDemographics(query);
    return demographics;
  }
}
