import { IsNotEmpty, IsString, IsUUID, Min, Max, Length, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty({
    description: 'The rating of the review',
    example: 5,
  })
  @Min(1)
  @Max(5)
  @IsInt()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'The comment of the review',
    example: 'This is a great product!',
  })
  @Length(1, 1000)
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'The product ID of the review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
