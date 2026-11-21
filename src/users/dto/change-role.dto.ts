import { UserRole } from '../entities/user.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'The role to assign to the user',
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
