import { IsOptional, IsString, IsISO8601, IsEnum } from 'class-validator';
import { Source, FunnelStage } from './enums';

export class GetEventsDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @IsOptional()
  @IsEnum(FunnelStage)
  funnelStage?: FunnelStage;

  @IsOptional()
  @IsString()
  eventType?: string;
}

export type GetEventsParams = {
  from?: string;
  to?: string;
  source?: Source;
  funnelStage?: FunnelStage;
  eventType?: string;
}
