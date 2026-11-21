import { Controller, Post, Body, HttpCode, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  CurrentUser,
  Public,
  Authenticate,
} from '@nestjs/authentication';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { EmailDto } from './dto/email.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { ApiSecurity } from '@nestjs/swagger';
import { Can } from '@nestjs/authorization';

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
  async verify(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('token/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refresh(refreshTokenDto);
  }

  @Post('token/revoke')
  async revoke(@Body() revokeRefreshTokenDto: RefreshTokenDto) {
    return await this.authService.revoke(revokeRefreshTokenDto);
  }

  @Post('password/forgot')
  @HttpCode(202)
  forgot(@Body() emailDto: EmailDto) {
    this.authService.forgotPassword(emailDto);
  }

  @Post('password/reset')
  @HttpCode(200)
  async reset(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Can.Anyone()
  @Authenticate()
  @ApiSecurity('bearer')
  @Get('me')
  me(@CurrentUser() user: UserEntity) {
    console.log(user);
    return user;
  }
}
