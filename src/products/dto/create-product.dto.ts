import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Length,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Product Name' })
  @Length(3, 255)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product slug', example: 'product-slug' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @Length(3, 255)
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Product description',
  })
  @Length(3, 1000)
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price', example: 100 })
  @Min(0)
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty({ description: 'Product stock', example: 10 })
  @Min(0)
  @IsNotEmpty()
  @IsInt()
  stock: number;

  @ApiProperty({ description: 'Product category ID' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
