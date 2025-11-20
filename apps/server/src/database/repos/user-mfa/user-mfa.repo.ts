import { Injectable } from '@nestjs/common';
import { KyselyDB } from '@docmost/db/types/kysely.types';
import { InjectKysely } from 'nestjs-kysely';

interface UpsertMfaData {
  userId: string;
  workspaceId: string;
  method: string;
  secret: string;
  isEnabled: boolean;
  backupCodes: string[];
}

@Injectable()
export class UserMfaRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async findByUserId(userId: string) {
    return this.db
      .selectFrom('userMfa')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();
  }

  async upsert(data: UpsertMfaData) {
    return this.db
      .insertInto('userMfa')
      .values({
        userId: data.userId,
        workspaceId: data.workspaceId,
        method: data.method,
        secret: data.secret,
        isEnabled: data.isEnabled,
        backupCodes: data.backupCodes,
      })
      .onConflict((oc) =>
        oc.column('userId').doUpdateSet({
          method: data.method,
          secret: data.secret,
          isEnabled: data.isEnabled,
          backupCodes: data.backupCodes,
          updatedAt: new Date(),
        }),
      )
      .returningAll()
      .executeTakeFirst();
  }

  async updateBackupCodes(userId: string, backupCodes: string[]) {
    return this.db
      .updateTable('userMfa')
      .set({
        backupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where('userId', '=', userId)
      .executeTakeFirst();
  }

  async deleteByUserId(userId: string) {
    return this.db
      .deleteFrom('userMfa')
      .where('userId', '=', userId)
      .executeTakeFirst();
  }
}
