import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Product Name' })
  @Length(3, 255)
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Product slug', example: 'product-slug' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @Length(3, 255)
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Product description',
  })
  @Length(3, 1000)
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product price', example: 100 })
  @Min(0)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  price?: number;

  @ApiProperty({ description: 'Product stock', example: 10 })
  @Min(0)
  @IsOptional()
  @IsInt()
  stock?: number;

  @ApiProperty({ description: 'Product category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
