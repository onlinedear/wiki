import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 添加缺失的字段
  await db.schema
    .alterTable('api_keys')
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('scopes', 'jsonb', (col) => col.notNull().defaultTo(sql`'[]'::jsonb`))
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('active'))
    .addColumn('description', 'text')
    .addColumn('last_used_ip', 'text')
    .addColumn('usage_count', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  // 创建索引
  await db.schema
    .createIndex('api_keys_token_idx')
    .on('api_keys')
    .column('token')
    .execute();

  await db.schema
    .createIndex('api_keys_workspace_id_idx')
    .on('api_keys')
    .column('workspace_id')
    .execute();

  await db.schema
    .createIndex('api_keys_status_idx')
    .on('api_keys')
    .column('status')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('api_keys_status_idx').execute();
  await db.schema.dropIndex('api_keys_workspace_id_idx').execute();
  await db.schema.dropIndex('api_keys_token_idx').execute();

  await db.schema
    .alterTable('api_keys')
    .dropColumn('usage_count')
    .dropColumn('last_used_ip')
    .dropColumn('description')
    .dropColumn('status')
    .dropColumn('scopes')
    .dropColumn('token')
    .execute();
}
