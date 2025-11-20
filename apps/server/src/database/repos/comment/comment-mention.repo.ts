import { Injectable } from '@nestjs/common';
import { KyselyDB } from '../../types/kysely.types';
import { InjectKysely } from 'nestjs-kysely';

@Injectable()
export class CommentMentionRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async addMention(data: { commentId: string; mentionedUserId: string }) {
    return await this.db
      .insertInto('commentMentions')
      .values({
        commentId: data.commentId,
        mentionedUserId: data.mentionedUserId,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async getCommentMentions(commentId: string) {
    return await this.db
      .selectFrom('commentMentions')
      .innerJoin('users', 'users.id', 'commentMentions.mentionedUserId')
      .select([
        'commentMentions.id',
        'commentMentions.commentId',
        'commentMentions.mentionedUserId',
        'commentMentions.createdAt',
        'users.name as userName',
        'users.email as userEmail',
      ])
      .where('commentMentions.commentId', '=', commentId)
      .execute();
  }

  async getUserMentions(userId: string, limit = 50) {
    return await this.db
      .selectFrom('commentMentions')
      .innerJoin('comments', 'comments.id', 'commentMentions.commentId')
      .innerJoin('users as creator', 'creator.id', 'comments.creatorId')
      .innerJoin('pages', 'pages.id', 'comments.pageId')
      .select([
        'commentMentions.id',
        'commentMentions.commentId',
        'commentMentions.createdAt',
        'comments.content',
        'comments.pageId',
        'creator.name as creatorName',
        'pages.title as pageTitle',
      ])
      .where('commentMentions.mentionedUserId', '=', userId)
      .orderBy('commentMentions.createdAt', 'desc')
      .limit(limit)
      .execute();
  }
}
