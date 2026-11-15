import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db/configuration.js';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { CartsModule } from './carts/carts.module.js';
import { RefundsModule } from './refunds/refunds.module.js';
import { CheckoutModule } from './checkout/checkout.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(dbConfig),
    UsersModule,
    ProductsModule,
    AuthModule,
    CategoriesModule,
    AddressesModule,
    OrdersModule,
    CartsModule,
    RefundsModule,
    CheckoutModule,
    PaymentsModule,
    InventoryModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
