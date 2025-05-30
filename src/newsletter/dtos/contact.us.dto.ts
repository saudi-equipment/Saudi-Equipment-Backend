import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ContactUsDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @MaxLength(12)
  @MinLength(9)
  readonly phoneNumber: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'City of the user' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Type of inquiry' })
  @IsNotEmpty()
  @IsString()
  inquiryType: string;

  @ApiProperty({ description: 'Subject of the inquiry' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
