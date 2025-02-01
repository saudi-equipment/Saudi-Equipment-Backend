import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SortingType } from 'src/enums';

export class GetAllAdQueryDto {
  
  @ApiProperty({ description: ' Category of the ads' })
  @IsOptional()
  @Type(() => String)
  category?: string[];

  @ApiProperty({ description: ' Condition of the ads' })
  @IsOptional()
  @Type(() => String)
  condition?: string[];

  @ApiProperty({ description: ' Search the ads' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: ' Location of the city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: ' Location of the city' })
  @IsOptional()
  @IsString()
  isPromoted?: boolean;
  
  @ApiProperty({ description: ' Flag for the home Screen' })
  @IsOptional()
  @IsString()
  isHome?: boolean;

  @ApiProperty({ description: ' Flag for the home Screen' })
  @IsOptional()
  @IsString()
  sortType?: SortingType;

  @ApiProperty({ description: ' Filter by post date ' })
  @IsOptional()
  @Type(() => String)
  postedDate?: string

  @ApiProperty({ description: ' Filter by fuel type ' })
  @IsOptional()
  @Type(() => String)
  fuelType?: string[];

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
  
  @ApiProperty({ description: ' Sorting of the ad ' })
  @IsOptional()
  @Type(() => String)
  sortByPrice?: string;

  @ApiProperty({ description: ' Sorting of the ad ' })
  @IsOptional()
  @Type(() => String)
  sortByDate?: string;
}
