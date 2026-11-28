import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
  type Relation,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity.js';
import { ReviewEntity } from '../../reviews/entities/review.entity.js';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @Check('price >= 0')
  @Column({ type: 'double precision' })
  price: number;

  @Column({ type: 'double precision', default: 0 })
  rating: number;

  @Column({ type: 'integer', default: 0 })
  reviewCount: number;

  @Check('stock >= 0')
  @Column({ type: 'integer', default: 0 })
  stock: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => CategoryEntity, {
    eager: true,
  })
  category: Relation<CategoryEntity>;
}
