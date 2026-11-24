import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    description: 'The rating of the review',
    example: 5,
  })
  @Min(1)
  @Max(5)
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'The comment of the review',
    example: 'This is a great product!',
  })
  @Length(1, 1000)
  @IsString()
  @IsOptional()
  comment?: string;
}
