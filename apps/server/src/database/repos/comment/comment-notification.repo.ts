import { Injectable } from '@nestjs/common';
import { KyselyDB } from '../../types/kysely.types';
import { InjectKysely } from 'nestjs-kysely';

@Injectable()
export class CommentNotificationRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async createNotification(data: {
    userId: string;
    commentId: string;
    type: 'reply' | 'mention' | 'reaction';
  }) {
    return await this.db
      .insertInto('commentNotifications')
      .values({
        userId: data.userId,
        commentId: data.commentId,
        type: data.type,
        isRead: false,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async getUserNotifications(userId: string, unreadOnly = false, limit = 50) {
    let query = this.db
      .selectFrom('commentNotifications')
      .innerJoin('comments', 'comments.id', 'commentNotifications.commentId')
      .innerJoin('users as creator', 'creator.id', 'comments.creatorId')
      .innerJoin('pages', 'pages.id', 'comments.pageId')
      .select([
        'commentNotifications.id',
        'commentNotifications.commentId',
        'commentNotifications.type',
        'commentNotifications.isRead',
        'commentNotifications.createdAt',
        'commentNotifications.readAt',
        'comments.content',
        'comments.pageId',
        'creator.id as creatorId',
        'creator.name as creatorName',
        'creator.avatarUrl as creatorAvatar',
        'pages.title as pageTitle',
        'pages.slugId as pageSlugId',
      ])
      .where('commentNotifications.userId', '=', userId);

    if (unreadOnly) {
      query = query.where('commentNotifications.isRead', '=', false);
    }

    return await query
      .orderBy('commentNotifications.createdAt', 'desc')
      .limit(limit)
      .execute();
  }

  async markAsRead(notificationId: string) {
    return await this.db
      .updateTable('commentNotifications')
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where('id', '=', notificationId)
      .execute();
  }

  async markAllAsRead(userId: string) {
    return await this.db
      .updateTable('commentNotifications')
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where('userId', '=', userId)
      .where('isRead', '=', false)
      .execute();
  }

  async getUnreadCount(userId: string) {
    const result = await this.db
      .selectFrom('commentNotifications')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('userId', '=', userId)
      .where('isRead', '=', false)
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  async deleteNotification(notificationId: string) {
    return await this.db
      .deleteFrom('commentNotifications')
      .where('id', '=', notificationId)
      .execute();
  }
}
