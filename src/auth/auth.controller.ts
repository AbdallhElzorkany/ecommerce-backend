import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from '@nestjs/authentication';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

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

  @Post('token/refresh')
  async refresh(@Body() refreshDto: { refreshToken: string }) {
    return await this.authService.refresh(refreshDto);
  }

  @Post('token/revoke')
  async revoke(@Body() revokeDto: { refreshToken: string }) {
    return await this.authService.revoke(revokeDto);
  }
}
