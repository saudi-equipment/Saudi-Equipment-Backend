import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PromoteAdDto {
  @ApiProperty({
    description: 'The ID of the advertisement to promote',
    example: '646a8c9b1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  readonly adId: string;

  @ApiProperty({
    description: 'The promotion plan duration',
    example: '7days',
  })
  @IsString()
  @IsNotEmpty()
  readonly promotionPlan: string;

  @ApiProperty({
    description: 'The ID of the user making the payment',
    example: '646a8c9b1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({
    description: 'The type of payment method used',
    example: 'credit_card',
  })
  @IsString()
  @IsNotEmpty()
  readonly paymentType: string;

  @ApiProperty({
    description: 'The payment company name',
    example: 'Moyasar',
  })
  @IsString()
  @IsNotEmpty()
  readonly paymentCompany: string;

  @ApiProperty({
    description: 'The transaction ID from the payment provider',
    example: 'txn_1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  readonly transactionId: string;

  @ApiProperty({
    description: 'The amount paid for the promotion',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty({
    description: 'The status of the payment',
    example: 'paid',
  })
  @IsString()
  @IsNotEmpty()
  readonly status: string;
}
