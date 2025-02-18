import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({description: 'The OTP code'})
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  readonly code: string;

  @ApiProperty({ description: 'Id of the otp' })
  @IsString()
  readonly otpId: string;

  @ApiProperty({ description: 'Email of the user' })
  @IsOptional()
  @IsString()
  readonly email: string;

  @ApiProperty({ description: 'Id of the otp' })
  @IsString()
  readonly userId: string;
}
