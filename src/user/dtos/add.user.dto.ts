import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddUser {
  @ApiProperty({ description: 'The city of the user' })
  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsString()
  @MaxLength(50)
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
}
