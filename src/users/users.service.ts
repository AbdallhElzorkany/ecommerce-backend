import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from './entities/user.entity.js';
import { UsersQueryDto } from './dto/users-query.dto.js';
import { AuthorizationService } from '@nestjs/authorization';
import { UsersPolicy } from './users.policy.js';
import { RegisterDto } from '../auth/dto/register.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  public async create(createUserDto: RegisterDto) {
    if (await this.findByEmail(createUserDto.email)) {
      throw new ConflictException('User already exists');
    }
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  public async findAll(usersQueryDto: UsersQueryDto) {
    const {
      limit = 10,
      page = 1,
      role,
      search = '',
      sortBy = 'createdAt',
      isActive,
      sortOrder = 'DESC',
    } = usersQueryDto;
    const options: FindManyOptions<UserEntity> = {
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sortBy]: sortOrder,
      },
      where: {
        fullname: search ? ILike(`%${search}%`) : undefined,
        role: role ? role : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    };
    const users = await this.userRepository.find(options);
    const total = await this.userRepository.count({
      where: options.where,
    });
    return { total, page, totalPages: Math.ceil(total / limit), users };
  }

  public async findOne(user: UserEntity, id: string) {
    const foundUser = await this.find(id);
    const isAllowed = await this.authorizationService.can(
      UsersPolicy,
      'view',
      user,
      foundUser,
    );
    if (!isAllowed) {
      throw new ForbiddenException();
    }
    return foundUser;
  }

  public async update(
    user: UserEntity,
    id: string,
    updateUserDto: UpdateUserDto,
  ) {
    const foundUser = await this.find(id);
    const isAllowed = await this.authorizationService.can(
      UsersPolicy,
      'update',
      user,
      foundUser,
    );
    if (!isAllowed) {
      throw new ForbiddenException();
    }
    const updatedUser = await this.userRepository.save({
      ...foundUser,
      fullname: updateUserDto.fullname ?? foundUser.fullname,
      phoneNumber: updateUserDto.phoneNumber ?? foundUser.phoneNumber,
    });
    return updatedUser;
  }

  public async remove(user: UserEntity, id: string) {
    const foundUser = await this.find(id);
    const isAllowed = await this.authorizationService.can(
      UsersPolicy,
      'deactivate',
      user,
      foundUser,
    );
    if (!isAllowed) {
      throw new ForbiddenException();
    }
    const deletedUser = await this.userRepository.update(id, {
      isActive: false,
    });
    if (!deletedUser.affected) {
      throw new InternalServerErrorException('User could not be deleted');
    }
    return { message: 'User has been deleted successfully' };
  }

  public async activate(user: UserEntity, id: string) {
    await this.find(id);
    const activatedUser = await this.userRepository.update(id, {
      isActive: true,
    });
    if (!activatedUser.affected) {
      throw new InternalServerErrorException('User could not be activated');
    }
    return { message: 'User has been activated successfully' };
  }

  public async changeRole(user: UserEntity, id: string, role: UserRole) {
    await this.find(id);
    const changedRole = await this.userRepository.update(id, {
      role,
    });
    if (!changedRole.affected) {
      throw new InternalServerErrorException('User role could not be changed');
    }
    return { message: 'User role has been changed successfully' };
  }

  public async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  private async find(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
