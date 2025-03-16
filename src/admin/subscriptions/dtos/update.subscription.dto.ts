import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subscriptionName?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  plan: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  subscriptionStatus: string;
}
