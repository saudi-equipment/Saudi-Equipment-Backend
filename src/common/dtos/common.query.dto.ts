import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsNotEmpty} from 'class-validator';

export class CommonQueryDto {
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
}
