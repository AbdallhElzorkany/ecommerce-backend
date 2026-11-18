import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token' })
  @IsString()
  token: string;

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
}
