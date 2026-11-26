import { Expose, Type } from 'class-transformer';

export class ReviewUserDto {
  @Expose()
  id: string;

  @Expose()
  fullname: string;
}

export class ReviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  comment: string;

  @Expose()
  rating: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ReviewUserDto)
  user: ReviewUserDto;
}
