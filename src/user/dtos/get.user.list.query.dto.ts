import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsNotEmpty} from 'class-validator';

export class GetUserListQueryDto {
  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  page?: number;

  @IsString()
  @IsOptional()
  q: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

}
