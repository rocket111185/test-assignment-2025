import { IsOptional, IsString, IsISO8601, IsEnum } from 'class-validator';
import { Source } from './enums';

export class GetRevenueDto {
  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;

  @IsEnum(Source)
  source: Source;

  @IsOptional()
  @IsString()
  campaignId?: string;
}

export type GetRevenueParams = {
  from: string;
  to: string;
  source: Source;
  campaignId?: string;
}
