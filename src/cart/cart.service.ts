import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartDto } from './dto/update-cart.dto.js';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity.js';
import { ProductsService } from '../products/products.service.js';
import { CartItemEntity } from './entities/cart-item.entity.js';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartsRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemsRepository: Repository<CartItemEntity>,
    private readonly productsService: ProductsService,
  ) {}

  public async findOrCreateCart(user: UserEntity) {
    const cart = await this.cartsRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!cart) {
      const newCart = this.cartsRepository.create({ user, items: [] });
      const { user: _, ...savedCart } =
        await this.cartsRepository.save(newCart);
      return savedCart;
    }
    return cart;
  }

  public async addToCart(User: UserEntity, { productId }: AddToCartDto) {
    const product = await this.productsService.findOne(productId);
    const cart = await this.findOrCreateCart(User);
    const item = await this.cartItemsRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });
    if (product.stock === 0) {
      throw new BadRequestException('Product is out of stock');
    }

    if (item) {
      if (item.quantity + 1 > product.stock) {
        throw new BadRequestException('Not enough stock available');
      }
      const updatedItem = await this.cartItemsRepository.increment(
        { id: item.id },
        'quantity',
        1,
      );
      if (!updatedItem.affected || updatedItem.affected === 0) {
        throw new InternalServerErrorException('Failed to update cart item');
      }
      const updatedCartItem = await this.findCart(User);
      return updatedCartItem;
    }

    const newItem = await this.cartItemsRepository.insert({
      cart: { id: cart.id },
      product: { id: productId },
      quantity: 1,
    });
    if (!newItem.raw || newItem.raw.length === 0) {
      throw new InternalServerErrorException('Failed to add item to cart');
    }
    const updatedCartItem = await this.findCart(User);
    return updatedCartItem;
  }

  public async removeFromCart(User: UserEntity, itemId: string) {
    const cart = await this.findCart(User);
    const item = await this.cartItemsRepository.findOne({
      where: { cart: { id: cart.id }, id: itemId },
    });
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }
    const deletedItem = await this.cartItemsRepository.delete({ id: item.id });
    if (!deletedItem.affected || deletedItem.affected === 0) {
      throw new InternalServerErrorException('Failed to remove item from cart');
    }
    const updatedCartItem = await this.findCart(User);
    return updatedCartItem;
  }

  public async updateCart(
    User: UserEntity,
    { itemId, quantity }: UpdateCartDto,
  ) {
    const cart = await this.findCart(User);
    const item = await this.cartItemsRepository.findOne({
      where: { cart: { id: cart.id }, id: itemId },
    });
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }
    if (quantity > item.product.stock) {
      throw new BadRequestException('Not enough stock available');
    }
    const updatedItem = await this.cartItemsRepository.update(
      { id: item.id },
      { quantity },
    );
    if (!updatedItem.affected || updatedItem.affected === 0) {
      throw new InternalServerErrorException('Failed to update cart item');
    }
    const updatedCartItem = await this.findCart(User);
    return updatedCartItem;
  }

  public async clearCart(User: UserEntity) {
    const cart = await this.findCart(User);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is already empty');
    }
    const clearedCart = await this.cartItemsRepository.delete({
      cart: { id: cart.id },
    });
    if (!clearedCart.affected || clearedCart.affected === 0) {
      throw new InternalServerErrorException('Failed to clear cart');
    }
    const updatedCartItem = await this.findCart(User);
    return updatedCartItem;
  }

  public async findCart(user: UserEntity) {
    const cart = await this.cartsRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
}
