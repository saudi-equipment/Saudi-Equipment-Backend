import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAdDto {
  @ApiProperty({ description: 'Category of the ad' })
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty({ description: 'Type of fuel' })
  @IsOptional()
  @IsString()
  fuelType: string;

  @ApiProperty({ description: 'Condition of the item' })
  @IsOptional()
  @IsString()
  condition: string;

  @ApiProperty({ description: 'Title in Arabic' })
  @IsOptional()
  @IsString()
  titleAr: string;

  @ApiProperty({ description: 'Title in English' })
  @IsOptional()
  @IsString()
  titleEn: string;

  @ApiProperty({ description: 'Description of the ad' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price of the item' })
  @IsOptional()
  @IsString()
  price: string;

  @ApiProperty({ description: 'Currency of the price' })
  @IsOptional()
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Year of manufacture or release' })
  @IsOptional()
  @IsString()
  year: string;

  @ApiProperty({ description: 'City where the ad is relevant' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ description: 'YouTube link for the ad' })
  @IsOptional()
  @IsString()
  youTubeLink?: string;

  @ApiProperty({ description: 'Urls of the files', type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  imageUrls?: string[];

  @ApiProperty({ description: 'Ad feature status', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured: boolean;

  @IsOptional()
  @ApiProperty({ description: 'Start Date of the promoted Ad' })
  startDate: Date;

  @IsOptional()
  @ApiProperty({ description: 'End Date of the promoted Ad' })
  endDate: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Promotion Price' })
  promotionPrice: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Promotion plan' })
  promotionPlan: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Promotion plan' })
  paymentCompany: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Promotion plan' })
  paymentType: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Duration of  plan' })
  duration: string;
}
