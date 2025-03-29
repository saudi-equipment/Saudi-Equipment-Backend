import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddAdminUser {
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
