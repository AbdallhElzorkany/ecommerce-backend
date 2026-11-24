import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, FindManyOptions } from 'typeorm';
import { ProductsService } from '../products/products.service.js';
import { ReviewEntity } from './entities/review.entity.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { AuthorizationService } from '@nestjs/authorization';
import { ReviewsPolicy } from './reviews.policy.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    private readonly productsService: ProductsService,
    private readonly authorizationService: AuthorizationService,
  ) {}
  /**
   * Creates a new review
   * @param user The user who is creating the review
   * @param createReviewDto The data for the new review
   * @returns The created review
   */
  public async create(user: UserEntity, createReviewDto: CreateReviewDto) {
    const { productId, ...reviewDto } = createReviewDto;
    const product = await this.productsService.findOne(productId);
    try {
      const review = this.reviewsRepository.create({
        ...reviewDto,
        product,
        user,
      });
      const { product: _, ...savedReview } =
        await this.reviewsRepository.save(review);
      await this.recalculateRating(productId);
      return savedReview;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505' // unique_violation
      ) {
        throw new ConflictException('You have already reviewed this product');
      }
      throw error;
    }
  }

  /**
   * Finds all reviews with optional filtering and pagination
   * @param query The query parameters for filtering and pagination
   * @returns The paginated reviews
   */
  public async findAll(query: ReviewsQueryDto) {
    const {
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
      productId,
      userId,
    } = query;
    const options: FindManyOptions<ReviewEntity> = {
      order: {
        [sortBy]: sortOrder,
      },
      where: {
        ...(productId ? { product: { id: productId } } : {}),
        ...(userId ? { user: { id: userId } } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
    };
    const reviews = await this.reviewsRepository.find(options);
    const total = await this.reviewsRepository.count({
      where: options.where,
    });
    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      reviews,
    };
  }

  /**
   * Finds a review by ID
   * @param id The ID of the review to find
   * @returns The review
   * @throws NotFoundException if the review is not found
   */
  public async findOne(id: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  /**
   * Updates a review
   * @param user The user who is updating the review
   * @param id The ID of the review to update
   * @param updateReviewDto The data for the updated review
   * @returns The updated review
   * @throws NotFoundException if the review is not found
   * @throws InternalServerErrorException if the review could not be updated
   */
  public async update(
    user: UserEntity,
    id: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const { comment, rating } = updateReviewDto;
    const review = await this.findOne(id);
    await this.authorizationService.authorize(
      ReviewsPolicy,
      'update',
      user,
      review,
    );
    const { product, ...updatedReview } = await this.reviewsRepository.save({
      ...review,
      comment: comment ?? review.comment,
      rating: rating ?? review.rating,
    });
    if (rating !== undefined) await this.recalculateRating(product.id);
    return updatedReview;
  }

  /**
   * Removes a review
   * @param id The ID of the review to remove
   * @returns The result of the removal
   * @throws NotFoundException if the review is not found
   * @throws InternalServerErrorException if the review could not be removed
   */
  public async remove(user: UserEntity, id: string) {
    const review = await this.findOne(id);
    await this.authorizationService.authorize(
      ReviewsPolicy,
      'delete',
      user,
      review,
    );
    const { product, ...result } = await this.reviewsRepository.remove(review);
    await this.recalculateRating(product.id);
    return result;
  }

  /**
   * Recalculates the average rating for a product
   * @param productId The ID of the product to recalculate the rating for
   */
  private async recalculateRating(productId: string) {
    const { avg, count } = await this.reviewsRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne();

    await this.productsService.updateRating(productId, {
      rating: Number(avg) || 0,
      reviewCount: Number(count),
    });
  }
}
