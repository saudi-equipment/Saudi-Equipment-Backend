import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({ description: 'The English name of the user' })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  readonly email: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @IsString()
  @MaxLength(12)
  @MinLength(9)
  @IsOptional()
  readonly phoneNumber: string;

  @ApiProperty({ description: 'The city of the user' })
  @IsString()
  @IsOptional()
  readonly city: string;

  @ApiProperty({ description: 'Profile pic url'})
  @IsOptional()
  @IsString()
  profilePicUrl?: string;

  @ApiProperty({ description: ' WhatsApp Link'})
  @IsOptional()
  @IsString()
  whatsAppLink?: string;

  @ApiProperty({ description: ' xLink Link'})
  @IsOptional()
  @IsString()
  xLink?: string;

  @ApiProperty({ description: ' xLink Link'})
  @IsOptional()
  @IsString()
  metaLink?: string;

  @ApiProperty({ description: ' xLink Link'})
  @IsOptional()
  @IsString()
  instaLink?: string;
}
