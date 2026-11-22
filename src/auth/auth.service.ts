import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  EmailVerificationService,
  PasswordHasher,
  PasswordResetService,
  TokenService,
  JwtVerifier,
} from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { EmailDto } from './dto/email.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly jwtVerifier: JwtVerifier,
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
  public async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email or password is invalid');
    }
    const isPasswordValid = await this.passwordHasher.verify(
      password,
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
    if (!user.isActive) {
      throw new ForbiddenException(
        'Account is not active. Please contact support for assistance.',
      );
    }

    const token = await this.tokenService.issue(user.id, {
      method: 'password',
      claims: { amr: ['pwd'] },
    });
    return { user, tokens: token };
  }

  /**
   * Verify email using token
   * @param verifyEmailDto The verification data
   * @returns Verification result
   */
  async verifyEmail({ token }: VerifyEmailDto) {
    const verified = await this.emailVerificationService.verify(token);
    if (!verified) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { email: verified.email, emailVerified: true };
  }

  /**
   * Refresh the access token
   * @param refreshTokenDto The refresh token
   * @returns The new access token
   */
  public async refresh({ refreshToken }: RefreshTokenDto) {
    const token = await this.tokenService.refresh(refreshToken);
    const payload = await this.jwtVerifier.verify(token.accessToken);
    const user = await this.usersService.find(payload.sub as string);
    if (!user.isActive) {
      await this.tokenService.revokeAll(user.id);
      throw new UnauthorizedException(
        'Account is not active. Please contact support for assistance.',
      );
    }
    return token;
  }

  /**
   * Revoke the refresh token
   * @param refreshTokenDto The refresh token
   * @returns A success message
   */
  public async revoke({ refreshToken }: RefreshTokenDto) {
    await this.tokenService.revoke(refreshToken);
    return { message: 'Refresh token has been revoked successfully' };
  }

  /**
   * Request password reset
   * @param email The email
   */
  forgotPassword({ email }: EmailDto) {
    this.passwordResetService.request(email);
    return { message: 'Password reset link has been sent to your email' };
  }

  /**
   * Reset password using token
   * @param resetPasswordDto The reset password data
   * @returns Reset password result
   */
  async resetPassword({ token, password }: ResetPasswordDto) {
    const updated = await this.passwordResetService.reset(token, password);
    if (!updated) {
      throw new BadRequestException('Invalid or expired link');
    }
    return { message: 'Password has been reset successfully' };
  }
}
