import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';
import { ProductEntity } from '../../products/entities/product.entity.js';

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Check('rating >= 1 AND rating <= 5')
  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'varchar', length: 1000 })
  comment: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.reviews, { eager: true })
  user: Relation<UserEntity>;

  @ManyToOne(() => ProductEntity, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product: Relation<ProductEntity>;
}
