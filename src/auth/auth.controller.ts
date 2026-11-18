import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from '@nestjs/authentication';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';

@Public()
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('email/verify')
  @HttpCode(200)
  async verify(@Body() { token }: VerifyEmailDto) {
    return await this.authService.verifyEmail(token);
  }

  @Post('token/refresh')
  async refresh(@Body() { refreshToken }: RefreshTokenDto) {
    return await this.authService.refresh(refreshToken);
  }

  @Post('token/revoke')
  async revoke(@Body() { refreshToken }: RefreshTokenDto) {
    return await this.authService.revoke(refreshToken);
  }
}
