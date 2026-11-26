import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductEntity } from './entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, FindManyOptions, ILike } from 'typeorm';
import { ProductsQueryDto } from './dto/products-query.dto.js';
import { CategoriesService } from '../categories/categories.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    private readonly categoriesService: CategoriesService,
  ) {}
  /**
   * Creates a new product
   * @param createProductDto The data for the new product
   * @returns The created product
   */
  public async create(createProductDto: CreateProductDto) {
    const { categoryId, ...productData } = createProductDto;
    try {
      const category = await this.categoriesService.findOne(categoryId);
      const product = this.productsRepository.create({
        ...productData,
        category,
      });
      return await this.productsRepository.save(product);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505' // unique_violation
      ) {
        throw new ConflictException('product already exists');
      }
      throw error;
    }
  }

  /**
   * Finds all products with optional filtering and pagination
   * @param query The query parameters for filtering and pagination
   * @returns The paginated products
   */
  public async findAll(query: ProductsQueryDto) {
    const {
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 10,
      categoryId,
    } = query;
    const options: FindManyOptions<ProductEntity> = {
      order: {
        [sortBy]: sortOrder,
      },
      where: {
        ...(search
          ? {
              name: ILike(`%${search}%`),
            }
          : {}),
        ...(categoryId ? { category: { id: categoryId } } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
    };
    const products = await this.productsRepository.find(options);
    const total = await this.productsRepository.count({
      where: options.where,
    });
    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      products,
    };
  }

  /**
   * Finds a product by ID
   * @param id The ID of the product to find
   * @returns The product
   * @throws NotFoundException if the product is not found
   */
  public async findOne(id: string) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('product not found');
    }
    return product;
  }

  /**
   * Updates a product
   * @param id The ID of the product to update
   * @param updateProductDto The data for the updated product
   * @returns The updated product
   * @throws NotFoundException if the product is not found
   * @throws InternalServerErrorException if the product could not be updated
   */
  public async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, description, name, price, slug, stock } =
      updateProductDto;
    const product = await this.findOne(id);
    const category = categoryId
      ? await this.categoriesService.findOne(categoryId)
      : undefined;
    try {
      const updatedProduct = await this.productsRepository.save({
        ...product,
        name: name ?? product.name,
        description: description ?? product.description,
        slug: slug ?? product.slug,
        price: price ?? product.price,
        stock: stock ?? product.stock,
        category: category ?? product.category,
      });
      return updatedProduct;
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
   * Removes a product
   * @param id The ID of the product to remove
   * @returns The result of the removal
   * @throws NotFoundException if the product is not found
   * @throws InternalServerErrorException if the product could not be removed
   */
  public async remove(id: string) {
    const product = await this.findOne(id);
    const result = await this.productsRepository.remove(product);

    return result;
  }

  public async findBySlug(slug: string) {
    const product = await this.productsRepository.findOneBy({ slug });
    if (!product) {
      throw new NotFoundException('product not found');
    }
    return product;
  }
}
