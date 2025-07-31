import { IsISO8601, IsEnum } from 'class-validator';
import { Source } from './enums';

export class GetDemographicsDto {
  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;

  @IsEnum(Source)
  source: Source;
}

export type GetDemographicsParams = {
  from: string;
  to: string;
  source: Source;
}
