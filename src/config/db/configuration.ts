import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
export const dbConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory(config: ConfigService) {
    const dbURL = config.get<string>('DB_URL');
    return {
      type: 'postgres',
      url: dbURL,
      entities: [],
      synchronize: true,
    };
  },
};
