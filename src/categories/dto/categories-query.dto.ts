import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoriesQueryDto {
  @ApiProperty({ required: false, description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ['name', 'createdAt', 'updatedAt'],
    description: 'Sort by field',
    default: 'name',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'createdAt' | 'updatedAt';

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    default: 'DESC',
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
