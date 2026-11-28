import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { dbOptions } from './config/db/db.config.js';
import {
  AuthenticationModuleOptions,
  authorizationModuleOptions,
} from './config/auth.config.js';
import { MailModule } from '@nestjs/mail';
import { MailOptions } from './config/mail.config.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { CartModule } from './cart/cart.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.forRootAsync(AuthenticationModuleOptions),
    AuthorizationModule.forRoot(authorizationModuleOptions),
    TypeOrmModule.forRootAsync(dbOptions),
    MailModule.forRootAsync(MailOptions),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    CartModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
