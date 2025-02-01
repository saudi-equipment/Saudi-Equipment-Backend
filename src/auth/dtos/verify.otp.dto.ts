import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({description: 'The OTP code'})
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  readonly code: string;

  @ApiProperty({ description: 'Id of the otp' })
  @IsString()
  readonly otpId: string;

  @ApiProperty({ description: 'Id of the otp' })
  @IsString()
  readonly userId: string;
}
