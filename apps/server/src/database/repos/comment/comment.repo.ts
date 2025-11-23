import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { KyselyDB, KyselyTransaction } from '../../types/kysely.types';
import { dbOrTx } from '../../utils';
import {
  Comment,
  InsertableComment,
  UpdatableComment,
} from '@notedoc/db/types/entity.types';
import { PaginationOptions } from '@notedoc/db/pagination/pagination-options';
import { executeWithPagination } from '@notedoc/db/pagination/pagination';
import { ExpressionBuilder } from 'kysely';
import { DB } from '@notedoc/db/types/db';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

@Injectable()
export class CommentRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  // todo, add workspaceId
  async findById(
    commentId: string,
    opts?: { includeCreator: boolean; includeResolvedBy: boolean },
  ): Promise<Comment> {
    return await this.db
      .selectFrom('comments')
      .selectAll('comments')
      .$if(opts?.includeCreator, (qb) => qb.select(this.withCreator))
      .$if(opts?.includeResolvedBy, (qb) => qb.select(this.withResolvedBy))
      .where('id', '=', commentId)
      .executeTakeFirst();
  }

  async findPageComments(pageId: string, pagination: PaginationOptions) {
    const query = this.db
      .selectFrom('comments')
      .selectAll('comments')
      .select((eb) => this.withCreator(eb))
      .select((eb) => this.withResolvedBy(eb))
      .where('pageId', '=', pageId)
      .orderBy('createdAt', 'asc');

    const result = executeWithPagination(query, {
      page: pagination.page,
      perPage: pagination.limit,
    });

    return result;
  }

  async updateComment(
    updatableComment: UpdatableComment,
    commentId: string,
    trx?: KyselyTransaction,
  ) {
    const db = dbOrTx(this.db, trx);
    await db
      .updateTable('comments')
      .set(updatableComment)
      .where('id', '=', commentId)
      .execute();
  }

  async insertComment(
    insertableComment: InsertableComment,
    trx?: KyselyTransaction,
  ): Promise<Comment> {
    const db = dbOrTx(this.db, trx);
    return db
      .insertInto('comments')
      .values(insertableComment)
      .returningAll()
      .executeTakeFirst();
  }

  withCreator(eb: ExpressionBuilder<DB, 'comments'>) {
    return jsonObjectFrom(
      eb
        .selectFrom('users')
        .select(['users.id', 'users.name', 'users.avatarUrl'])
        .whereRef('users.id', '=', 'comments.creatorId'),
    ).as('creator');
  }

  withResolvedBy(eb: ExpressionBuilder<DB, 'comments'>) {
    return jsonObjectFrom(
      eb
        .selectFrom('users')
        .select(['users.id', 'users.name', 'users.avatarUrl'])
        .whereRef('users.id', '=', 'comments.resolvedById'),
    ).as('resolvedBy');
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.db.deleteFrom('comments').where('id', '=', commentId).execute();
  }

  async hasChildren(commentId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('comments')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('parentCommentId', '=', commentId)
      .executeTakeFirst();

    return Number(result?.count) > 0;
  }

  async hasChildrenFromOtherUsers(commentId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('comments')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('parentCommentId', '=', commentId)
      .where('creatorId', '!=', userId)
      .executeTakeFirst();

    return Number(result?.count) > 0;
  }

  async searchComments(opts: {
    pageId?: string;
    workspaceId?: string;
    searchText?: string;
    creatorId?: string;
    resolved?: boolean;
    pagination: PaginationOptions;
  }) {
    let query = this.db
      .selectFrom('comments')
      .selectAll('comments')
      .select((eb) => this.withCreator(eb))
      .select((eb) => this.withResolvedBy(eb));

    if (opts.pageId) {
      query = query.where('pageId', '=', opts.pageId);
    }

    if (opts.workspaceId) {
      query = query.where('workspaceId', '=', opts.workspaceId);
    }

    if (opts.searchText) {
      query = query.where((eb) =>
        eb.or([
          eb('selection', 'ilike', `%${opts.searchText}%`),
        ]),
      );
    }

    if (opts.creatorId) {
      query = query.where('creatorId', '=', opts.creatorId);
    }

    if (opts.resolved !== undefined) {
      if (opts.resolved) {
        query = query.where('resolvedAt', 'is not', null);
      } else {
        query = query.where('resolvedAt', 'is', null);
      }
    }

    query = query.orderBy('createdAt', 'desc');

    return executeWithPagination(query, {
      page: opts.pagination.page,
      perPage: opts.pagination.limit,
    });
  }

  async getWorkspaceComments(
    workspaceId: string,
    pagination: PaginationOptions,
    filters?: {
      searchText?: string;
      type?: string;
      creatorId?: string;
    },
  ) {
    let query = this.db
      .selectFrom('comments')
      .selectAll('comments')
      .select((eb) => this.withCreator(eb))
      .select((eb) => this.withPage(eb))
      .select((eb) => this.withSpace(eb))
      .where('comments.workspaceId', '=', workspaceId)
      .where('comments.deletedAt', 'is', null);

    if (filters?.searchText) {
      query = query.where((eb) =>
        eb.or([
          eb('comments.selection', 'ilike', `%${filters.searchText}%`),
        ]),
      );
    }

    if (filters?.type) {
      query = query.where('comments.type', '=', filters.type);
    }

    if (filters?.creatorId) {
      query = query.where('comments.creatorId', '=', filters.creatorId);
    }

    query = query.orderBy('comments.createdAt', 'desc');

    return executeWithPagination(query, {
      page: pagination.page,
      perPage: pagination.limit,
    });
  }

  withPage(eb: ExpressionBuilder<DB, 'comments'>) {
    return jsonObjectFrom(
      eb
        .selectFrom('pages')
        .select(['pages.id', 'pages.title', 'pages.slugId'])
        .whereRef('pages.id', '=', 'comments.pageId'),
    ).as('page');
  }

  withSpace(eb: ExpressionBuilder<DB, 'comments'>) {
    return jsonObjectFrom(
      eb
        .selectFrom('spaces')
        .select(['spaces.id', 'spaces.name', 'spaces.slug'])
        .whereRef('spaces.id', '=', 'comments.spaceId'),
    ).as('space');
  }
}
