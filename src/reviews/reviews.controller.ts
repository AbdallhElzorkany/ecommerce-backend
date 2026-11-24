import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { UserEntity } from '../users/entities/user.entity.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';
import { Can } from '@nestjs/authorization';
import { ReviewsPolicy } from './reviews.policy.js';
import { ApiSecurity } from '@nestjs/swagger';

@Authenticate({ optional: true })
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiSecurity('bearer')
  @Can(ReviewsPolicy, 'create')
  @Post()
  create(
    @CurrentUser() user: UserEntity,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user, createReviewDto);
  }

  @Can(ReviewsPolicy, 'viewAll')
  @Get()
  findAll(@Query() query: ReviewsQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Can(ReviewsPolicy, 'view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Patch(':id')
  update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(user, id, updateReviewDto);
  }

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Delete(':id')
  remove(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviewsService.remove(user, id);
  }
}
