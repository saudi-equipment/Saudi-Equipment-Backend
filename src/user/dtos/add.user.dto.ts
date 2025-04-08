import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddUser {
  @ApiProperty({ description: 'The city of the user' })
  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsString()
  @MaxLength(50)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @MaxLength(12)
  @MinLength(9)
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty({ description: 'The status of the email' })
  @IsBoolean()
  @IsNotEmpty()
  readonly emailStatus: boolean;

  @ApiProperty({ description: 'The status of the phoneNumber' })
  @IsBoolean()
  @IsNotEmpty()
  readonly phoneNumberStatus: boolean;

  @ApiProperty({ description: 'User status', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPremiumUser: boolean;

  @IsOptional()
  @ApiProperty({ description: 'Start Date of the sub scription' })
  startDate: Date;

  @IsOptional()
  @ApiProperty({ description: 'End Date of the sub scription' })
  endDate: Date;

  @ApiProperty({ description: 'The plan of the prmium user' })
  @IsString()
  @IsOptional()
  readonly plan: string;

  @ApiProperty({ description: 'The duration of the plan' })
  @IsString()
  @IsOptional()
  readonly duration: string;

  @ApiProperty({ description: 'The price of the plan' })
  @IsString()
  @IsOptional()
  readonly price: string;

  @ApiProperty({ description: 'The payment type of the plan' })
  @IsString()
  @IsOptional()
  readonly paymentType: string;

  @ApiProperty({ description: 'The paymentCompany of the plan' })
  @IsString()
  @IsOptional()
  readonly paymentCompany: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ description: 'The confrim password of the user' })
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly confirmPassword: string;

  @ApiProperty({ description: 'The English name of the user' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
