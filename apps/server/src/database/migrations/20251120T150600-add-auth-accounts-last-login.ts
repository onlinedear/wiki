import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('auth_accounts')
    .addColumn('last_login_at', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('auth_accounts')
    .dropColumn('last_login_at')
    .execute();
}
