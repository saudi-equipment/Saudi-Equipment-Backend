import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @ApiProperty({ description: 'Profile pic url' })
  @IsOptional()
  @IsString()
  profilePicUrl?: string;

  @ApiProperty({ description: ' WhatsApp Link' })
  @IsOptional()
  @IsString()
  whatsAppLink?: string;

  @ApiProperty({ description: ' xLink Link' })
  @IsOptional()
  @IsString()
  xLink?: string;

  @ApiProperty({ description: ' xLink Link' })
  @IsOptional()
  @IsString()
  metaLink?: string;

  @ApiProperty({ description: ' xLink Link' })
  @IsOptional()
  @IsString()
  instaLink?: string;

  @ApiProperty({ description: 'User status', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPremiumUser: boolean;

  @IsOptional()
  @ApiProperty({ description: 'Start Date of the sub scription' })
  startDate: Date;

  @IsOptional()
  @ApiProperty({ description: 'End Date of the sub scription' })
  endDate: Date;

  @ApiProperty({ description: 'The plan of the prmium user' })
  @IsString()
  @IsOptional()
  readonly plan: string;

  @ApiProperty({ description: 'The duration of the plan' })
  @IsString()
  @IsOptional()
  readonly duration: string;

  @ApiProperty({ description: 'The price of the plan' })
  @IsString()
  @IsOptional()
  readonly price: string;

  @ApiProperty({ description: 'The payment type of the plan' })
  @IsString()
  @IsOptional()
  readonly paymentType: string;

  @ApiProperty({ description: 'The paymentCompany of the plan' })
  @IsString()
  @IsOptional()
  readonly paymentCompany: string;

  @ApiProperty({ description: 'The subscriptionId of the prmium user' })
  @IsString()
  @IsOptional()
  readonly subscriptionId: string;

  @ApiProperty({ description: 'The status of the email' })
    @IsBoolean()
    @IsOptional()
    readonly emailStatus: boolean;
  
    @ApiProperty({ description: 'The status of the phoneNumber' })
    @IsBoolean()
    @IsOptional()
    readonly phoneNumberStatus: boolean;
}
