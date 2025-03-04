import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAdDto {
  @ApiProperty({ description: 'Category of the ad' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: 'Type of fuel' })
  @IsNotEmpty()
  @IsString()
  fuelType: string;

  @ApiProperty({ description: 'Condition of the item'})
  @IsNotEmpty()
  @IsString()
  condition: string;

  @ApiProperty({ description: 'Title in Arabic'})
  @IsNotEmpty()
  @IsString()
  titleAr: string;

  @ApiProperty({ description: 'Title in English' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiProperty({ description: 'Description of the ad' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price of the item' })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty({ description: 'Currency of the price' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Year of manufacture or release'})
  @IsNotEmpty()
  @IsString()
  year: string;

  @ApiProperty({ description: 'City where the ad is relevant'})
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'YouTube link for the ad'})
  @IsOptional()
  @IsUrl()
  youTubeLink?: string;

  @ApiProperty({ description: 'Ad feature status', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured: boolean;
}
