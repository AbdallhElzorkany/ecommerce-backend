import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import {
  EmailVerificationService,
  PasswordHasher,
  TokenService,
} from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
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
    await this.emailVerificationService.send(user);
    return {
      message:
        'User registered successfully. Please check your email for verification link.',
      user,
    };
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
    if (!user.emailVerified) {
      await this.emailVerificationService.send(user);
      throw new UnauthorizedException(
        'Email is not verified yet. Please check your email for verification link.',
      );
    }

    const token = await this.tokenService.issue(user.id);
    return { user, token };
  }

  /**
   * Verify email using token
   * @param token The verification token
   * @returns Verification result
   */
  async verifyEmail(token: string) {
    const verified = await this.emailVerificationService.verify(token);
    if (!verified) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { email: verified.email, emailVerified: true };
  }

  /**
   * Refresh the access token
   * @param refreshToken The refresh token
   * @returns The new access token
   */
  public async refresh(refreshToken: string) {
    const token = await this.tokenService.refresh(refreshToken);
    return token;
  }

  /**
   * Revoke the refresh token
   * @param revokeDto The refresh token
   * @returns A success message
   */
  public async revoke(refreshToken: string) {
    await this.tokenService.revoke(refreshToken);
    return { message: 'Refresh token revoked successfully' };
  }
}
