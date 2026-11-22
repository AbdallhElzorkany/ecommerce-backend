import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
