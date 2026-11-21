import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { FindManyOptions, ILike, QueryFailedError, Repository } from 'typeorm';
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

  /**
   * Creates a new user
   * @param createUserDto The user data to create
   * @returns The created user
   * @throws ConflictException if the user already exists
   */
  public async create(createUserDto: RegisterDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505' // unique_violation
      ) {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  /**
   * Finds all users with pagination and filtering
   * @param usersQueryDto The query parameters for filtering and pagination
   * @returns The paginated list of users
   */
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

  /**
   * Finds a user by ID
   * @param id The ID of the user to find
   * @returns The user with the given ID
   * @throws NotFoundException if the user is not found
   */
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

  /**
   * Updates a user
   * @param user The user performing the update
   * @param id The ID of the user to update
   * @param updateUserDto The updated user data
   * @returns The updated user
   * @throws ForbiddenException if the user is not allowed to update the user
   */
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

  /**
   * Removes a user (deactivates them)
   * @param user The user performing the removal
   * @param id The ID of the user to remove
   * @returns A message indicating the user has been removed
   * @throws ForbiddenException if the user is not allowed to remove the user
   */
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

  /**
   * Activates a user
   * @param id The ID of the user to activate
   * @returns A message indicating the user has been activated
   * @throws InternalServerErrorException if the user could not be activated
   */
  public async activate(id: string) {
    await this.find(id);
    const activatedUser = await this.userRepository.update(id, {
      isActive: true,
    });
    if (!activatedUser.affected) {
      throw new InternalServerErrorException('User could not be activated');
    }
    return { message: 'User has been activated successfully' };
  }

  /**
   * Changes the role of a user
   * @param id The ID of the user to change the role for
   * @param role The new role for the user
   * @returns A message indicating the user role has been changed
   * @throws InternalServerErrorException if the user role could not be changed
   */
  public async changeRole(id: string, role: UserRole) {
    await this.find(id);
    const changedRole = await this.userRepository.update(id, {
      role,
    });
    if (!changedRole.affected) {
      throw new InternalServerErrorException('User role could not be changed');
    }
    return { message: 'User role has been changed successfully' };
  }

  /**
   * Finds a user by email
   * @param email The email of the user to find
   * @returns The user with the given email
   */
  public async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  /**
   * Finds a user by ID
   * @param id The ID of the user to find
   * @returns The user with the given ID
   * @throws NotFoundException if the user is not found
   */
  public async find(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
