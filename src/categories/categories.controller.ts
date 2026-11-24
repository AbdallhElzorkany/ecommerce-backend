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
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Authenticate } from '@nestjs/authentication';
import { CategoriesPolicy } from './categories.policy.js';
import { Can } from '@nestjs/authorization';
import { ApiSecurity } from '@nestjs/swagger';
import { CategoriesQueryDto } from './dto/categories-query.dto.js';

@Authenticate({ optional: true })
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiSecurity('bearer')
  @Can(CategoriesPolicy, 'create')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Can(CategoriesPolicy, 'viewAll')
  @Get()
  findAll(@Query() query: CategoriesQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Can(CategoriesPolicy, 'viewBySlug')
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Can(CategoriesPolicy, 'view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @ApiSecurity('bearer')
  @Can(CategoriesPolicy, 'update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiSecurity('bearer')
  @Can(CategoriesPolicy, 'delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
