import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../users/entities/user.entity.js';
import { RefreshTokenEntity } from '../../auth/entities/refresh-token.entity.js';
import { EmailTokenEntity } from '../../auth/entities/email-token.entity.js';
import { CategoryEntity } from '../../categories/entities/category.entity.js';
import { ProductEntity } from '../../products/entities/product.entity.js';

export const dbOptions: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory(config: ConfigService) {
    const dbURL = config.getOrThrow<string>('DB_URL');
    return {
      type: 'postgres',
      url: dbURL,
      entities: [UserEntity, RefreshTokenEntity, EmailTokenEntity, CategoryEntity, ProductEntity],
      synchronize: true,
    };
  },
};
