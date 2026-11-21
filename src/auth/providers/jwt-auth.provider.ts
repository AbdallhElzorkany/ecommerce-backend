import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';
import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import { UserEntity } from '../../users/entities/user.entity.js';

@Injectable()
export class JwtAuth extends JwtBearerProvider<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    registry: AuthenticationRegistry,
  ) {
    // The key, issuer and audience come from the `accessToken` options.
    super({ realm: 'store' });
    registry.registerProvider(this);
  }

  // Called after the signature and claims checked out.
  // Returning null (the user was deleted) rejects the token.
  async validate({ sub }: JwtClaims) {
    if (!sub) {
      return null;
    }
    const user = await this.usersRepository.findOneBy({ id: sub });
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}
