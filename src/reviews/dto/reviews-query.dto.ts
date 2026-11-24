import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewsQueryDto {
  @ApiProperty({ required: false, description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ required: false, description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    required: false,
    enum: ['rating', 'createdAt', 'updatedAt'],
    description: 'Sort by field',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['rating', 'createdAt', 'updatedAt'])
  sortBy?: 'rating' | 'createdAt' | 'updatedAt';

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
