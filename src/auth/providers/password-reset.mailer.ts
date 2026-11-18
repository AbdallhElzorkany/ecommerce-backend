import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  PasswordResetHandler,
  type PasswordResetLink,
} from '@nestjs/authentication';
import { Mailer, type Mailable } from '@nestjs/mail';
import { UserEntity } from '../../users/entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PasswordResetMail implements Mailable<PasswordResetLink> {
  render({ url }: PasswordResetLink) {
    return {
      subject: 'Reset your password',
      template: 'password-reset',
      context: { url },
    };
  }
}

@Injectable()
export class PasswordResetMailer extends PasswordResetHandler {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('passwordReset', this);
  }

  // The link goes to the address the account has stored, and works only while
  // the account keeps that address and this hash: any change invalidates it.
  async findUser(email: string) {
    const found = await this.usersRepository.findOneByOrFail({ email });
    return {
      id: found.id,
      email: found.email,
      passwordHash: found.password,
    };
  }

  async send(link: PasswordResetLink) {
    await this.mailer.send(PasswordResetMail, { to: link.email, data: link });
  }

  async updatePassword(userId: string, passwordHash: string) {
    const updateResult = await this.usersRepository.update({ id: userId }, { password: passwordHash });
    if (updateResult.affected === undefined || updateResult.affected === 0) {
      throw new Error('Failed to update password');
    }
  }
}
