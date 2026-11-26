import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
  FindManyOptions,
  DataSource,
} from 'typeorm';
import { ProductsService } from '../products/products.service.js';
import { ReviewEntity } from './entities/review.entity.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { AuthorizationService } from '@nestjs/authorization';
import { ReviewsPolicy } from './reviews.policy.js';
import { ProductEntity } from '../products/entities/product.entity.js';
import { ReviewResponseDto } from './dto/review-response.dto.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
    private readonly productsService: ProductsService,
    private readonly authorizationService: AuthorizationService,
    private readonly dataSource: DataSource,
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
      const saved = await this.reviewsRepository.save(review);
      const { rating, reviewCount } = await this.recalculateRating(productId);
      return {
        review: this.toResponse(saved),
        rating,
        reviewCount,
      };
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
      reviews: this.toResponse(reviews),
    };
  }

  /**
   * Finds a review by ID
   * @param id The ID of the review to find
   * @returns The review
   * @throws NotFoundException if the review is not found
   */
  public async findOne(id: string) {
    return this.toResponse(await this.findEntity(id));
  }

  private async findEntity(id: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: { user: true, product: true },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  private toResponse(payload: ReviewEntity | ReviewEntity[]) {
    return plainToInstance(ReviewResponseDto, payload, {
      excludeExtraneousValues: true,
    });
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
    const review = await this.findEntity(id);
    await this.authorizationService.authorize(
      ReviewsPolicy,
      'update',
      user,
      review,
    );
    const updatedReview = await this.reviewsRepository.save({
      ...review,
      comment: updateReviewDto.comment ?? review.comment,
      rating: updateReviewDto.rating ?? review.rating,
    });

    if (updateReviewDto.rating !== undefined) {
      const { rating, reviewCount } = await this.recalculateRating(
        review.product.id,
      );
      return {
        review: this.toResponse(updatedReview),
        rating,
        reviewCount,
      };
    }
    return {
      review: this.toResponse(updatedReview),
      rating: updatedReview.product.rating,
      reviewCount: updatedReview.product.reviewCount,
    };
  }

  /**
   * Removes a review
   * @param id The ID of the review to remove
   * @returns The result of the removal
   * @throws NotFoundException if the review is not found
   * @throws InternalServerErrorException if the review could not be removed
   */
  public async remove(user: UserEntity, id: string) {
    const review = await this.findEntity(id);
    await this.authorizationService.authorize(
      ReviewsPolicy,
      'delete',
      user,
      review,
    );
    await this.reviewsRepository.remove(review);
    const { rating, reviewCount } = await this.recalculateRating(
      review.product.id,
    );
    return {
      message: 'Review has been removed successfully',
      rating,
      reviewCount,
    };
  }

  /**
   * Recalculates the average rating for a product
   * @param productId The ID of the product to recalculate the rating for
   */
  private async recalculateRating(productId: string) {
    return await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .select('p.id')
        .from(ProductEntity, 'p')
        .setLock('pessimistic_write')
        .where('p.id = :id', { id: productId })
        .getOne();
      const { avg, count } = await manager
        .createQueryBuilder(ReviewEntity, 'r')
        .select('AVG(r.rating)', 'avg')
        .addSelect('COUNT(*)', 'count')
        .where('r.productId = :productId', { productId })
        .getRawOne();

      const rating = Number(avg) || 0;
      const reviewCount = Number(count);

      await manager.update(ProductEntity, productId, {
        rating,
        reviewCount,
      });
      return { rating, reviewCount };
    });
  }
}
