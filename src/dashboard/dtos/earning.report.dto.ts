// earnings-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class EarningsReportDto {
  @ApiProperty({
    description: 'The period type for the earnings report (year or month)',
    example: 'year',
    enum: ['year', 'month'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['year', 'month'], {
    message: 'periodType must be either "year" or "month"',
  })
  readonly periodType?: 'year' | 'month';

  @ApiProperty({
    description: 'The period value (YYYY for year, YYYY-MM for month)',
    example: '2023 or 2023-05',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(?:\d{4}|\d{4}-\d{2})$/, {
    message: 'periodValue must be in format YYYY or YYYY-MM',
  })
  readonly periodValue?: string;
}
