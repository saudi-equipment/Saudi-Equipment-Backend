import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class UpdateAdPackageDto {
  @ApiProperty({
    description: 'Package name in Arabic',
    example: 'الباقة الذهبية',
  })
  @IsString()
  @IsOptional()
  packageNameAr: string;

  @ApiProperty({
    description: 'Package name in English',
    example: 'Gold Package',
  })
  @IsString()
  @IsOptional()
  packageNameEn: string;

  @ApiProperty({
    description: 'Description of the package',
    example: 'Premium advertisement package',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'Price of the package', example: 100 })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({ description: 'Currency of the price', example: 'USD' })
  @IsString()
  @IsOptional()
  currency: string;

  @ApiProperty({ description: 'Duration of the package', example: '30 days' })
  @IsString()
  @IsOptional()
  duration: string;

  @ApiPropertyOptional({ description: 'Discount on the package', example: 10 })
  @IsOptional()
  @IsNumber()
  @IsOptional()
  discount?: number;
}
