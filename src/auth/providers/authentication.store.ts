import { Injectable } from '@nestjs/common';
import {
  AuthenticationStorage,
  type EmailTokenPurpose,
  type EmailTokenRecord,
  type EmailTokenStore,
  type RefreshTokenRecord,
  type RefreshTokenStore,
} from '@nestjs/authentication';
import {
  DataSource,
  IsNull,
  LessThanOrEqual,
  type EntityTarget,
  type FindOptionsWhere,
  type ObjectLiteral,
} from 'typeorm';
import {
  RefreshTokenEntity,
  type Json,
} from '../entities/refresh-token.entity.js';
import { EmailTokenEntity } from '../entities/email-token.entity.js';
/**
 * Keeps refresh tokens, email tokens in
 * PostgreSQL, through TypeORM.
 * Every method that decides whether something works once is a
 * single conditional statement, so the guarantees hold with any number of
 * API instances.
 */
@Injectable()
export class AuthenticationStore
  implements RefreshTokenStore, EmailTokenStore
{
  protected readonly maxPending: number = 100_000;

  constructor(
    private readonly dataSource: DataSource,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({
      refreshTokens: this,
      emailTokens: this,
    });
  }

  private get manager() {
    return this.dataSource.manager;
  }
  // Refresh tokens

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const row = await this.manager.findOneBy(RefreshTokenEntity, { id });
    if (!row) {
      return undefined;
    }
    const { revoked: _, ...token } = row;
    return withoutNulls(token);
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    const claims = (record.claims ?? null) as Record<string, Json> | null;
    await this.manager.insert(RefreshTokenEntity, {
      ...record,
      usedAt: record.usedAt ?? null,
      claims,
    });
    await this.manager.delete(RefreshTokenEntity, {
      familyExpiresAt: LessThanOrEqual(record.createdAt),
    });
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    // Conditional: of two refreshes with the same token, one updates the row.
    const { affected } = await this.manager.update(
      RefreshTokenEntity,
      { id, usedAt: IsNull() },
      { usedAt: at },
    );
    return affected === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.manager.update(
      RefreshTokenEntity,
      { familyId },
      { revoked: true },
    );
  }

  isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    return this.manager.existsBy(RefreshTokenEntity, {
      familyId,
      revoked: true,
    });
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.manager.update(
      RefreshTokenEntity,
      { userId },
      { revoked: true },
    );
  }

  // Password reset and email verification links
  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.manager.insert(EmailTokenEntity, {
      ...record,
      fingerprint: record.fingerprint ?? null,
    });
    await this.trim(EmailTokenEntity, record.createdAt);
  }

  async consumeEmailToken(
    id: string,
    purpose: EmailTokenPurpose,
  ): Promise<EmailTokenRecord | undefined> {
    const [row] = await this.deleteReturning(EmailTokenEntity, { id, purpose });
    return row && withoutNulls(row);
  }

  async deleteUserEmailTokens(
    userId: string,
    purpose: EmailTokenPurpose,
  ): Promise<void> {
    await this.manager.delete(EmailTokenEntity, { userId, purpose });
  }

  /** `DELETE … RETURNING *`, as rows of the entity: the query builder returns raw column names. */
  private async deleteReturning<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    where: FindOptionsWhere<T>,
  ): Promise<T[]> {
    const { raw } = await this.manager
      .createQueryBuilder()
      .delete()
      .from(entity)
      .where(where)
      .returning('*')
      .execute();
    const columns = this.dataSource.getMetadata(entity).columns;
    return (raw as Record<string, unknown>[]).map(
      (row) =>
        Object.fromEntries(
          columns.map((column) => [
            column.propertyName,
            row[column.databaseName],
          ]),
        ) as T,
    );
  }

  /** Deletes what expired, and past `maxPending`, what expires first. */
  private async trim<T extends { expiresAt: Date }>(
    entity: EntityTarget<T>,
    now: Date,
  ) {
    await this.manager.delete(entity, {
      expiresAt: LessThanOrEqual(now),
    } as FindOptionsWhere<T>);
    const [cutoff] = await this.manager.find(entity, {
      select: { expiresAt: true } as never,
      order: { expiresAt: 'DESC' } as never,
      skip: this.maxPending,
      take: 1,
    });
    if (cutoff) {
      await this.manager.delete(entity, {
        expiresAt: LessThanOrEqual(cutoff.expiresAt),
      } as FindOptionsWhere<T>);
    }
  }
}

/** A row without its NULL columns: the package's records leave optional fields out. */
type WithoutNulls<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

function withoutNulls<T extends object>(row: T): WithoutNulls<T> {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== null),
  ) as WithoutNulls<T>;
}
