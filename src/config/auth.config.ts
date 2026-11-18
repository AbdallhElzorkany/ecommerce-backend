import { AuthenticationModuleAsyncOptions,type Duration } from '@nestjs/authentication';
import { ConfigService } from '@nestjs/config';

export const AuthOptions: AuthenticationModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (cfg: ConfigService) => {
    return {
      accessToken: {
        key: cfg.getOrThrow<string>('JWT_SECRET'),
        ttl: cfg.getOrThrow<Duration>('JWT_EXPIRATION'),
      },
    };
  },
};
