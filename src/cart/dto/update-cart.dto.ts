import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ description: 'Cart item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
