import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity.js';
export const dbOptions: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory(config: ConfigService) {
    const dbURL = config.getOrThrow<string>('DB_URL');
    return {
      type: 'postgres',
      url: dbURL,
      entities: [User],
      synchronize: true,
    };
  },
};
