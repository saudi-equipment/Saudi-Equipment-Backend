import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {

  @ApiProperty({ required: false })
  @IsNotEmpty()
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
  subscriptionStatus: string
}
