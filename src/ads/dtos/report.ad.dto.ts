import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReportAdDto {

  @ApiProperty({ description: 'Message content of the report'})
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'Report type of the ad'})
  @IsNotEmpty()
  @IsString()
  reportType: string;

}
