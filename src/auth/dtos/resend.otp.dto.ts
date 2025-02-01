import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResendOtpDto {
  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @MaxLength(12)
  @MinLength(9)
  @IsNotEmpty()
  readonly phoneNumber: string;
}
