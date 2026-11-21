import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity.js';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsString()
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    required: false,
    enum: ['name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    description: 'Sort by field',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'email' | 'role' | 'isActive' | 'createdAt' | 'updatedAt';

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
