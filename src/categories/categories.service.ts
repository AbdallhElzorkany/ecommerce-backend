import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity.js';
import { FindManyOptions, ILike, QueryFailedError, Repository } from 'typeorm';
import { CategoriesQueryDto } from './dto/categories-query.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}
  /**
   * Creates a new category
   * @param createCategoryDto The data for the new category
   * @returns The created category
   */
  public async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505' // unique_violation
      ) {
        throw new ConflictException('Category with this slug already exists');
      }
      throw error;
    }
  }

  /**
   * Finds all categories with optional filtering and pagination
   * @param query The query parameters for filtering and pagination
   * @returns The paginated categories
   */
  public async findAll(query: CategoriesQueryDto) {
    const {
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 10,
    } = query;
    const options: FindManyOptions<CategoryEntity> = {
      order: {
        [sortBy]: sortOrder,
      },
      where: search
        ? {
            name: ILike(`%${search}%`),
          }
        : {},
      skip: (page - 1) * limit,
      take: limit,
    };
    const categories = await this.categoriesRepository.find(options);
    const total = await this.categoriesRepository.count({
      where: options.where,
    });
    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    };
  }

  /**
   * Finds a category by ID
   * @param id The ID of the category to find
   * @returns The category
   * @throws NotFoundException if the category is not found
   */
  public async findOne(id: string) {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  /**
   * Updates a category
   * @param id The ID of the category to update
   * @param updateCategoryDto The data for the updated category
   * @returns The updated category
   * @throws NotFoundException if the category is not found
   * @throws InternalServerErrorException if the category could not be updated
   */
  public async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    try {
      const updatedCategory = await this.categoriesRepository.save({
        ...category,
        name: updateCategoryDto.name ?? category.name,
        description: updateCategoryDto.description ?? category.description,
        slug: updateCategoryDto.slug ?? category.slug,
      });
      return updatedCategory;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505' // unique_violation
      ) {
        throw new ConflictException('Slug already exists');
      }
      throw error;
    }
  }

  /**
   * Removes a category
   * @param id The ID of the category to remove
   * @returns The result of the removal
   * @throws NotFoundException if the category is not found
   * @throws InternalServerErrorException if the category could not be removed
   */
  public async remove(id: string) {
    const category = await this.findOne(id);
    try {
      const result = await this.categoriesRepository.remove(category);
      return result;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23503' // foreign_key_violation
      ) {
        throw new BadRequestException('Cannot delete category with products');
      }
      throw error;
    }
  }

  public async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findOneBy({ slug });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
