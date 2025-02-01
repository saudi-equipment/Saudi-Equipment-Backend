import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'New password must be at least 8 characters long.', required: true })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({description: 'The confirmation of the new password', required: true })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({ description: 'Id of the user', required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
