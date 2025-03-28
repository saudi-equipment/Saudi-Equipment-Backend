import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
} from 'class-validator';
export class UpdateBannerAdDto {
  @IsOptional()
  @IsString()
  bannerAdName?: string;

  @IsOptional()
  @IsUrl()
  bannerAdLink?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  imageUrls?: string[];
}
