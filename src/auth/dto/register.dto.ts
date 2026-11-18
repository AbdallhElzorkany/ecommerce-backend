import { UserRole } from '../../users/entities/user.entity.js';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
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
      message:
        'password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols',
    },
  )
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Egyptian phone number' })
  @IsNotEmpty()
  @IsPhoneNumber('EG', {
    message: 'phoneNumber must be a valid Egyptian phone number',
  })
  @IsString()
  phoneNumber: string;

}