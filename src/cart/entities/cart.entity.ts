import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';
import { CartItemEntity } from './cart-item.entity.js';

@Unique(['user'])
@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => CartItemEntity, (item) => item.cart, {
    nullable: true,
    eager: true,
  })
  items: CartItemEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}