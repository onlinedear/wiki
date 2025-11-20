import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add reactions table for comment reactions (likes, etc.)
  await db.schema
    .createTable('comment_reactions')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`),
    )
    .addColumn('comment_id', 'uuid', (col) =>
      col.references('comments.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('reaction_type', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint('unique_user_comment_reaction', [
      'comment_id',
      'user_id',
      'reaction_type',
    ])
    .execute();

  // Add mentions table for @mentions in comments
  await db.schema
    .createTable('comment_mentions')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`),
    )
    .addColumn('comment_id', 'uuid', (col) =>
      col.references('comments.id').onDelete('cascade').notNull(),
    )
    .addColumn('mentioned_user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Add notifications table for comment notifications
  await db.schema
    .createTable('comment_notifications')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`),
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('comment_id', 'uuid', (col) =>
      col.references('comments.id').onDelete('cascade').notNull(),
    )
    .addColumn('type', 'varchar(50)', (col) => col.notNull()) // 'reply', 'mention', 'reaction'
    .addColumn('is_read', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('read_at', 'timestamptz', (col) => col)
    .execute();

  // Add indexes for better query performance
  await db.schema
    .createIndex('idx_comment_reactions_comment_id')
    .on('comment_reactions')
    .column('comment_id')
    .execute();

  await db.schema
    .createIndex('idx_comment_mentions_comment_id')
    .on('comment_mentions')
    .column('comment_id')
    .execute();

  await db.schema
    .createIndex('idx_comment_mentions_user_id')
    .on('comment_mentions')
    .column('mentioned_user_id')
    .execute();

  await db.schema
    .createIndex('idx_comment_notifications_user_id')
    .on('comment_notifications')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_comment_notifications_is_read')
    .on('comment_notifications')
    .columns(['user_id', 'is_read'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('comment_notifications').execute();
  await db.schema.dropTable('comment_mentions').execute();
  await db.schema.dropTable('comment_reactions').execute();
}
