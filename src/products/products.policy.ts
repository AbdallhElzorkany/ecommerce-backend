import { Policy, PolicyBefore } from '@nestjs/authorization';
import { UserEntity, UserRole } from '../users/entities/user.entity.js';

@Policy()
export class ProductsPolicy implements PolicyBefore<UserEntity> {
  before(user: UserEntity | null) {
    if (user?.role === UserRole.ADMIN) {
      return true;
    }
  }

  create(user: UserEntity | null) {
    return user?.role === UserRole.STAFF;
  }

  view(_user: UserEntity | null) {
    return true;
  }

viewBySlug(_user: UserEntity | null) {
    return true;
  }

  viewAll(_user: UserEntity | null) {
    return true;
  }

  update(user: UserEntity | null) {
    return user?.role === UserRole.STAFF;
  }

  delete(_user: UserEntity | null) {
    return false;
  }
}
