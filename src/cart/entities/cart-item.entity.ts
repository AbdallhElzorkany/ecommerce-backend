import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  type Relation,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { CartEntity } from './cart.entity.js';
import { ProductEntity } from '../../products/entities/product.entity.js';

@Unique(['cart', 'product'])
@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Relation<CartEntity>;

  @ManyToOne(() => ProductEntity, { eager: true, onDelete: 'CASCADE' })
  product: Relation<ProductEntity>;

  @Check('quantity > 0')
  @Column({ type: 'integer' })
  quantity: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
