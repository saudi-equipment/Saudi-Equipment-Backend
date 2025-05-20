import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';


export class SubscriptionDto {
  @ApiProperty({
    description: 'The transaction ID from the payment provider',
    example: 'txn_1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @ApiProperty({
    description: 'The invoice ID',
    example: 'inv_1234567890abcdef',
  })
  @IsString()
  @IsOptional()
  readonly invoice_id: string;

  @ApiProperty({
    description: 'The price of the subscription',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @ApiProperty({
    description: 'The subscription plan duration',
    example: 'month',
  })
  @IsEnum(['month', 'year'])
  @IsNotEmpty()
  readonly plan: string;

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
    description: 'The ID of the user',
    example: '646a8c9b1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({
    description: 'The status of the payment',
    example: 'paid',
  })
  @IsString()
  @IsNotEmpty()
  readonly status: string;

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2025-05-19T01:29:06+05:00',
  })
  @IsString()
  @IsNotEmpty()
  readonly created_at: string;
}
