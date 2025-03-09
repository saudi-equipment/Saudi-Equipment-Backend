import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
  
  @IsString()
  @IsNotEmpty()
  publishable : string;
}
