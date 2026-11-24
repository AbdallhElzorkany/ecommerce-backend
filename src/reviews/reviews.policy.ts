import { Policy, PolicyBefore } from '@nestjs/authorization';
import { UserEntity, UserRole } from '../users/entities/user.entity.js';
import { ReviewEntity } from './entities/review.entity.js';

@Policy()
export class ReviewsPolicy implements PolicyBefore<UserEntity> {
  before(user: UserEntity | null) {
    if (user?.role === UserRole.ADMIN) {
      return true;
    }
  }

  create(user: UserEntity | null) {
    return user !== null;
  }

  view(_user: UserEntity | null) {
    return true;
  }

  viewAll(_user: UserEntity | null) {
    return true;
  }

  update(user: UserEntity | null, review: ReviewEntity) {
    return user?.role === UserRole.STAFF || review.user.id === user?.id;
  }

  delete(user: UserEntity | null, review: ReviewEntity) {
    return user?.role === UserRole.STAFF || review.user.id === user?.id;
  }
}
