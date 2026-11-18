import { UserRole } from '../entities/user.entity.js';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsPhoneNumber('EG', {
    message: 'phoneNumber must be a valid Egyptian phone number',
  })
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsEnum(UserRole)
  @IsString()
  role?: UserRole;
}
