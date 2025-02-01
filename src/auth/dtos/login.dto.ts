import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @IsNotEmpty()
//   @MinLength(9)
//   @MaxLength(12)
  readonly phoneNumber: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(15, { message: 'Password must not exceed 15 characters' })
  readonly password: string;
}
