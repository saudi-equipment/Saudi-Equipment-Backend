import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsNotEmpty, IsBoolean} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUserListQueryDto {
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
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === 'yes') return true;
    if (value === 'false' || value === '0' || value === 'no' || value === '') return false;
    return value;
  })
  @IsBoolean()
  premiumUsers?: boolean;

  @IsOptional()
  @IsString()
  city?: string;
}
