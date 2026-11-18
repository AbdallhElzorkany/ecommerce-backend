import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Register a new user
   * @param registerDto The registration data
   * @returns The created user and access token
   */
  public async register(registerDto: RegisterDto) {
    const hashedPassword = await this.passwordHasher.hash(registerDto.password);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    const token = await this.tokenService.issue(user.id);
    return { user, token };
  }

  /**
   * Login a user
   * @param loginDto The login data
   * @returns The user and access token
   */
  public async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Email or password is invalid');
    }
    const isPasswordValid = await this.passwordHasher.verify(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Email or password is invalid');
    }

    const token = await this.tokenService.issue(user.id);
    return { user, token };
  }

  /**
   * Refresh the access token
   * @param refreshDto The refresh token
   * @returns The new access token
   */
  public async refresh(refreshDto: { refreshToken: string }) {
    const token = await this.tokenService.refresh(refreshDto.refreshToken);
    return token;
  }

  /**
   * Revoke the refresh token
   * @param revokeDto The refresh token
   * @returns A success message
   */
  public async revoke(revokeDto: { refreshToken: string }) {
    await this.tokenService.revoke(revokeDto.refreshToken);
    return { message: 'Refresh token revoked successfully' };
  }
}