import {
  AuthenticationModuleAsyncOptions,
  type Duration,
} from '@nestjs/authentication';
import { AuthorizationModuleAsyncOptions } from '@nestjs/authorization';
import { ConfigService } from '@nestjs/config';
import { UsersPolicy } from '../users/users.policy.js';
import { CategoriesPolicy } from '../categories/categories.policy.js';
import { ProductsPolicy } from '../products/products.policy.js';

export const AuthenticationModuleOptions: AuthenticationModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (cfg: ConfigService) => {
    return {
      accessToken: {
        key: cfg.getOrThrow<string>('JWT_SECRET'),
        ttl: cfg.getOrThrow<Duration>('JWT_EXPIRATION'),
      },
      emailVerification: {
        url: `${cfg.getOrThrow<string>('APP_URL')}/verify-email`,
      },
      passwordReset: {
        url: `${cfg.getOrThrow<string>('APP_URL')}/reset-password`,
        ttl: cfg.getOrThrow<Duration>('PASSWORD_TOKEN_EXPIRATION'),
      },
    };
  },
};

export const authorizationModuleOptions: AuthorizationModuleAsyncOptions = {
  policies: [UsersPolicy, CategoriesPolicy,ProductsPolicy],
};
