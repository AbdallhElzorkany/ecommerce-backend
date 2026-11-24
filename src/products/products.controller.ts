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
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsQueryDto } from './dto/products-query.dto.js';
import { Authenticate } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { ApiSecurity } from '@nestjs/swagger';
import { ProductsPolicy } from './products.policy.js';

@Authenticate({ optional: true })
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiSecurity('bearer')
  @Can(ProductsPolicy, 'create')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Can(ProductsPolicy, 'viewAll')
  @Get()
  findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Can(ProductsPolicy, 'viewBySlug')
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Can(ProductsPolicy, 'view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @ApiSecurity('bearer')
  @Can(ProductsPolicy, 'update')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @ApiSecurity('bearer')
  @Can(ProductsPolicy, 'delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
