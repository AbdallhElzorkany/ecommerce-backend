import { Policy, PolicyBefore } from '@nestjs/authorization';
import { UserEntity, UserRole } from './entities/user.entity.js';
@Policy()
export class UsersPolicy implements PolicyBefore<UserEntity> {
  before(user: UserEntity | null) {
    return user?.role === UserRole.ADMIN;
  }

  view(CurrentUser: UserEntity | null, user: UserEntity) {
    return CurrentUser?.id === user.id || CurrentUser?.role !== UserRole.USER;
  }

  viewAll(user: UserEntity | null) {
    return user?.role !== UserRole.USER;
  }

  update(CurrentUser: UserEntity | null, user: UserEntity) {
    return CurrentUser?.id === user.id || CurrentUser?.role === UserRole.ADMIN;
  }

  deactivate(CurrentUser: UserEntity | null, user: UserEntity) {
    return CurrentUser?.id === user.id || CurrentUser?.role === UserRole.ADMIN;
  }

  activate(_user: UserEntity | null) {
    return false;
  }

  changeRole(_user: UserEntity | null) {
    return false;
  }
}
