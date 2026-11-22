import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Category name', required: false })
  @Length(3, 100)
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Category description', required: false })
  @Length(10, 500)
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category slug', required: false })
  @Length(3, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @IsOptional()
  @IsString()
  slug?: string;
}
