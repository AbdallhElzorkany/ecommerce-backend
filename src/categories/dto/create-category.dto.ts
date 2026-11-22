import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @Length(3, 100)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category description' })
  @Length(10, 500)
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Category slug' })
  @Length(3, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;
}
