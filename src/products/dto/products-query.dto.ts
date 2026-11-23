import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductsQueryDto {
  @ApiProperty({ required: false, description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    required: false,
    enum: ['name', 'price', 'stock', 'createdAt', 'updatedAt'],
    description: 'Sort by field',
    default: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'stock', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt';

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    default: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @Min(1)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, description: 'Items per page', default: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  @IsNumber()
  limit?: number;
}
