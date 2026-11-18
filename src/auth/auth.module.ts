import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtAuth } from './providers/jwt-auth.provider.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity.js';
import { UsersModule } from '../users/users.module.js';
import { RefreshTokenEntity } from './entities/refresh-token.entity.js';
import { EmailTokenEntity } from './entities/email-token.entity.js';
import { AuthenticationStore } from './providers/authentication.store.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, EmailTokenEntity]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuth,AuthenticationStore],
})
export class AuthModule {}
