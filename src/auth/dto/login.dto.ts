import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email or password is invalid' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: 'email or password is invalid',
    },
  )
  @IsNotEmpty()
  @IsString()
  password: string;
}
