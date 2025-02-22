import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class ResendOtpDto {
  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @MaxLength(12)
  @MinLength(9)
  @IsOptional()
  readonly phoneNumber: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsString()
  @IsOptional()
  readonly email: string;
}
