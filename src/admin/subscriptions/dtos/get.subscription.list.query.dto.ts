import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class GetSubscriptionListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortType?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsString()
  active?: 'true' | 'false';

  @IsOptional()
  @IsString()
  inactive?: 'true' | 'false';
}
