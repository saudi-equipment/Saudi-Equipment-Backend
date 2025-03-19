import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class CreateAdPackageDto {
  @ApiProperty({
    description: 'Package name in Arabic',
    example: 'الباقة الذهبية',
  })
  @IsString()
  packageNameAr: string;

  @ApiProperty({
    description: 'Package name in English',
    example: 'Gold Package',
  })
  @IsString()
  packageNameEn: string;

  @ApiProperty({
    description: 'Description of the package',
    example: 'Premium advertisement package',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price of the package', example: 100 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Currency of the price', example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Duration of the package', example: '30 days' })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ description: 'Discount on the package', example: 10 })
  @IsOptional()
  @IsNumber()
  discount?: number;
}
