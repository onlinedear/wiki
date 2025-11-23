import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { sql } from 'kysely';
import { KyselyDB, KyselyTransaction } from '../../types/kysely.types';
import { dbOrTx } from '../../utils';
import {
  ApiKey,
  InsertableApiKey,
  UpdatableApiKey,
} from '@notedoc/db/types/entity.types';

@Injectable()
export class ApiKeyRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async findById(
    id: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<ApiKey> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('apiKeys')
      .selectAll()
      .where('id', '=', id)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
  }

  async findByToken(
    token: string,
    trx?: KyselyTransaction,
  ): Promise<ApiKey> {
    const db = dbOrTx(this.db, trx);
    return db
      .selectFrom('apiKeys')
      .selectAll()
      .where('token', '=', token)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
  }

  async findByWorkspaceId(
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<ApiKey[]> {
    const db = dbOrTx(this.db, trx);
    
    const results = await db
      .selectFrom('apiKeys')
      .leftJoin('users', 'users.id', 'apiKeys.creatorId')
      .select([
        'apiKeys.id',
        'apiKeys.name',
        'apiKeys.description',
        'apiKeys.token',
        'apiKeys.creatorId',
        'apiKeys.workspaceId',
        'apiKeys.scopes',
        'apiKeys.status',
        'apiKeys.expiresAt',
        'apiKeys.lastUsedAt',
        'apiKeys.lastUsedIp',
        'apiKeys.usageCount',
        'apiKeys.createdAt',
        'apiKeys.updatedAt',
        'apiKeys.deletedAt',
        'users.id as creator_id',
        'users.name as creator_name',
        'users.email as creator_email',
        'users.avatarUrl as creator_avatarUrl',
      ])
      .where('apiKeys.workspaceId', '=', workspaceId)
      .where('apiKeys.deletedAt', 'is', null)
      .orderBy('apiKeys.createdAt', 'desc')
      .execute();

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      token: row.token,
      creatorId: row.creatorId,
      workspaceId: row.workspaceId,
      scopes: row.scopes,
      status: row.status,
      expiresAt: row.expiresAt,
      lastUsedAt: row.lastUsedAt,
      lastUsedIp: row.lastUsedIp,
      usageCount: row.usageCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      creator: row.creator_id ? {
        id: row.creator_id,
        name: row.creator_name,
        email: row.creator_email,
        avatarUrl: row.creator_avatarUrl,
      } : null,
    })) as any;
  }

  async insert(
    insertableApiKey: InsertableApiKey,
    trx?: KyselyTransaction,
  ): Promise<ApiKey> {
    const db = dbOrTx(this.db, trx);
    return db
      .insertInto('apiKeys')
      .values(insertableApiKey)
      .returningAll()
      .executeTakeFirst();
  }

  async update(
    id: string,
    workspaceId: string,
    updatableApiKey: UpdatableApiKey,
    trx?: KyselyTransaction,
  ): Promise<ApiKey> {
    const db = dbOrTx(this.db, trx);
    return db
      .updateTable('apiKeys')
      .set({ ...updatableApiKey, updatedAt: new Date() })
      .where('id', '=', id)
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();
  }

  async softDelete(
    id: string,
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('apiKeys')
      .set({ deletedAt: new Date() })
      .where('id', '=', id)
      .where('workspaceId', '=', workspaceId)
      .execute();
  }

  async updateUsage(
    id: string,
    ip: string,
    trx?: KyselyTransaction,
  ): Promise<void> {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('apiKeys')
      .set({
        lastUsedAt: new Date(),
        lastUsedIp: ip,
        usageCount: sql`usage_count + 1`,
      })
      .where('id', '=', id)
      .execute();
  }

  async countByWorkspaceId(
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<number> {
    const db = dbOrTx(this.db, trx);
    const { count } = await db
      .selectFrom('apiKeys')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('workspaceId', '=', workspaceId)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
    return count as number;
  }

  async countActiveByWorkspaceId(
    workspaceId: string,
    trx?: KyselyTransaction,
  ): Promise<number> {
    const db = dbOrTx(this.db, trx);
    const { count } = await db
      .selectFrom('apiKeys')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('workspaceId', '=', workspaceId)
      .where('status', '=', 'active')
      .where('deletedAt', 'is', null)
      .executeTakeFirst();
    return count as number;
  }

  async findByCreatorId(
    workspaceId: string,
    creatorId: string,
    trx?: KyselyTransaction,
  ): Promise<ApiKey[]> {
    const db = dbOrTx(this.db, trx);
    
    const results = await db
      .selectFrom('apiKeys')
      .leftJoin('users', 'users.id', 'apiKeys.creatorId')
      .select([
        'apiKeys.id',
        'apiKeys.name',
        'apiKeys.description',
        'apiKeys.token',
        'apiKeys.creatorId',
        'apiKeys.workspaceId',
        'apiKeys.scopes',
        'apiKeys.status',
        'apiKeys.expiresAt',
        'apiKeys.lastUsedAt',
        'apiKeys.lastUsedIp',
        'apiKeys.usageCount',
        'apiKeys.createdAt',
        'apiKeys.updatedAt',
        'apiKeys.deletedAt',
        'users.id as creator_id',
        'users.name as creator_name',
        'users.email as creator_email',
        'users.avatarUrl as creator_avatarUrl',
      ])
      .where('apiKeys.workspaceId', '=', workspaceId)
      .where('apiKeys.creatorId', '=', creatorId)
      .where('apiKeys.deletedAt', 'is', null)
      .orderBy('apiKeys.createdAt', 'desc')
      .execute();

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      token: row.token,
      creatorId: row.creatorId,
      workspaceId: row.workspaceId,
      scopes: row.scopes,
      status: row.status,
      expiresAt: row.expiresAt,
      lastUsedAt: row.lastUsedAt,
      lastUsedIp: row.lastUsedIp,
      usageCount: row.usageCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      creator: row.creator_id ? {
        id: row.creator_id,
        name: row.creator_name,
        email: row.creator_email,
        avatarUrl: row.creator_avatarUrl,
      } : null,
    })) as any;
  }
}
