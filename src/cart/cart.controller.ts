import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartDto } from './dto/update-cart.dto.js';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { UserEntity } from '../users/entities/user.entity.js';
import { Can } from '@nestjs/authorization';
import { ApiSecurity } from '@nestjs/swagger';

@Authenticate()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Post()
  addToCart(@CurrentUser() user: UserEntity, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user, dto);
  }

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Get()
  getMyCart(@CurrentUser() user: UserEntity) {
    return this.cartService.findOrCreateCart(user);
  }

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Delete(':itemId')
  removeFromCart(@CurrentUser() user: UserEntity, @Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.cartService.removeFromCart(user, itemId);
  }

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Patch()
  updateCart(@CurrentUser() user: UserEntity, @Body() dto: UpdateCartDto) {
    return this.cartService.updateCart(user, dto);
  }

  @ApiSecurity('bearer')
  @Can.Anyone()
  @Delete()
  clearCart(@CurrentUser() user: UserEntity) {
    return this.cartService.clearCart(user);
  }
}
