import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB, KyselyTransaction } from '@notedoc/db/types/kysely.types';
import { dbOrTx } from '@notedoc/db/utils';
import {
  AuthProvider,
  InsertableAuthProvider,
  UpdatableAuthProvider,
} from '@notedoc/db/types/entity.types';

@Injectable()
export class AuthProviderRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async findById(
    providerId: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<AuthProvider> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('authProviders')
      .selectAll()
      .where('id', '=', providerId)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
  }

  async findByType(
    type: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<AuthProvider[]> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('authProviders')
      .selectAll()
      .where('type', '=', type)
      .where('workspaceId', '=', workspaceId)
      .where('isEnabled', '=', true)
      .where('deletedAt', 'is', null)
      .execute();
  }

  async findAllByWorkspace(
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<AuthProvider[]> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('authProviders')
      .selectAll()
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .orderBy('createdAt', 'desc')
      .execute();
  }

  async findEnabledProviders(
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<AuthProvider[]> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('authProviders')
      .selectAll()
      .where('workspaceId', '=', workspaceId)
      .where('isEnabled', '=', true)
      .where('deletedAt', 'is', null)
      .execute();
  }

  async insert(
    insertableAuthProvider: InsertableAuthProvider,
    trx?: KyselyTransaction,
  ): Promise<AuthProvider> {
    const db = dbOrTx(this.db, trx);
    return db
      .insertInto('authProviders')
      .values(insertableAuthProvider)
      .returningAll()
      .executeTakeFirst();
  }

  async update(
    providerId: string,
    workspaceId: string,
    updatableAuthProvider: UpdatableAuthProvider,
    trx?: KyselyTransaction,
  ): Promise<AuthProvider> {
    const db = dbOrTx(this.db, trx);
    return db
      .updateTable('authProviders')
      .set({ ...updatableAuthProvider, updatedAt: new Date() })
      .where('id', '=', providerId)
      .where('workspaceId', '=', workspaceId)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(
    providerId: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('authProviders')
      .set({ deletedAt: new Date() })
      .where('id', '=', providerId)
      .where('workspaceId', '=', workspaceId)
      .execute();
  }
}
