import { Policy, PolicyBefore } from '@nestjs/authorization';
import { UserEntity, UserRole } from './entities/user.entity.js';
@Policy()
export class UsersPolicy implements PolicyBefore<UserEntity> {
  before(user: UserEntity | null) {
    if (user?.role === UserRole.ADMIN) {
      return true;
    }
  }

  view(currentUser: UserEntity | null, user: UserEntity) {
    return currentUser?.id === user.id || currentUser?.role === UserRole.STAFF;
  }

  viewAll(user: UserEntity | null) {
    return user?.role === UserRole.STAFF;
  }

  update(currentUser: UserEntity | null, user: UserEntity) {
    return currentUser?.id === user.id;
  }

  deactivate(currentUser: UserEntity | null, user: UserEntity) {
    return currentUser?.id === user.id;
  }

  activate(_user: UserEntity | null) {
    return false;
  }

  changeRole(_user: UserEntity | null) {
    return false;
  }
}
