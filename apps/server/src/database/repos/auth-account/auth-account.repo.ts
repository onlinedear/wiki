import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB, KyselyTransaction } from '@docmost/db/types/kysely.types';
import { dbOrTx } from '@docmost/db/utils';
import { AuthAccounts } from '@docmost/db/types/db';
import { Insertable, Selectable } from 'kysely';

export type AuthAccount = Selectable<AuthAccounts>;
export type InsertableAuthAccount = Insertable<AuthAccounts>;

@Injectable()
export class AuthAccountRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async findByProviderAndUserId(
    authProviderId: string,
    providerUserId: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<AuthAccount> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('authAccounts')
      .selectAll()
      .where('authProviderId', '=', authProviderId)
      .where('providerUserId', '=', providerUserId)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
  }

  async findByUserId(
    userId: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<AuthAccount[]> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('authAccounts')
      .selectAll()
      .where('userId', '=', userId)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .execute();
  }

  async insert(
    insertableAuthAccount: InsertableAuthAccount,
    trx?: KyselyTransaction,
  ): Promise<AuthAccount> {
    const db = dbOrTx(this.db, trx);
    return db
      .insertInto('authAccounts')
      .values(insertableAuthAccount)
      .returningAll()
      .executeTakeFirst();
  }

  async updateLastLogin(
    authProviderId: string,
    providerUserId: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('authAccounts')
      .set({ lastLoginAt: new Date() })
      .where('authProviderId', '=', authProviderId)
      .where('providerUserId', '=', providerUserId)
      .where('workspaceId', '=', workspaceId)
      .execute();
  }

  async delete(
    authProviderId: string,
    userId: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('authAccounts')
      .set({ deletedAt: new Date() })
      .where('authProviderId', '=', authProviderId)
      .where('userId', '=', userId)
      .where('workspaceId', '=', workspaceId)
      .execute();
  }
}
