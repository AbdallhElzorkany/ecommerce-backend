import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, description: 'User fullname' })
  @IsString()
  @IsOptional()
  fullname?: string;

  @ApiProperty({
    required: false,
    description: 'User Egyptian phone number',
  })
  @IsPhoneNumber('EG', {
    message: 'phoneNumber must be a valid Egyptian phone number',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
