import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminLoginDto {

  @ApiProperty({ description: 'The email of the admin' })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(15, { message: 'Password must not exceed 15 characters' })
  readonly password: string;
}
