import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UserRole } from '../entities/user.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UsersQueryDto {
  @ApiProperty({ required: false, description: 'Search by fullname' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by role',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isActive?: boolean;

  @ApiProperty({
    required: false,
    enum: ['fullname', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    description: 'Sort by field',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['fullname', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'])
  sortBy?:
    'fullname' | 'email' | 'role' | 'isActive' | 'createdAt' | 'updatedAt';

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
