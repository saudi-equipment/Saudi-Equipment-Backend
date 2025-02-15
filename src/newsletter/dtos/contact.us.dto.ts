import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class ContactUsDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number of the user' })
  @IsNotEmpty()
  @IsNumber()
  phoneNumber: number;

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
