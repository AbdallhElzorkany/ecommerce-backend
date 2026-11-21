import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersQueryDto } from './dto/users-query.dto.js';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { ApiSecurity } from '@nestjs/swagger';
import { Can } from '@nestjs/authorization';
import { UsersPolicy } from './users.policy.js';
import { UserEntity } from './entities/user.entity.js';
import { ChangeRoleDto } from './dto/change-role.dto.js';

@ApiSecurity('bearer')
@Authenticate()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Can(UsersPolicy, 'viewAll')
  @Get()
  findAll(@Query() query: UsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Can.Anyone()
  @Get(':id')
  findOne(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    return this.usersService.findOne(user, id);
  }

  @Can.Anyone()
  @Patch(':id')
  update(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user, id, updateUserDto);
  }

  @Can.Anyone()
  @Delete(':id')
  deactivate(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    return this.usersService.remove(user, id);
  }

  @Can(UsersPolicy, 'activate')
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Can(UsersPolicy, 'changeRole')
  @Patch(':id/change-role')
  changeRole(@Param('id') id: string, @Body() { role }: ChangeRoleDto) {
    return this.usersService.changeRole(id, role);
  }
}
