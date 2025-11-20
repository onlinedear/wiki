import { Injectable } from '@nestjs/common';
import { KyselyDB } from '../../types/kysely.types';
import { InjectKysely } from 'nestjs-kysely';

@Injectable()
export class CommentReactionRepo {
  constructor(@InjectKysely() private readonly db: KyselyDB) {}

  async addReaction(data: {
    commentId: string;
    userId: string;
    reactionType: string;
  }) {
    // Check if reaction already exists
    const existing = await this.db
      .selectFrom('commentReactions')
      .selectAll()
      .where('commentId', '=', data.commentId)
      .where('userId', '=', data.userId)
      .where('reactionType', '=', data.reactionType)
      .executeTakeFirst();

    if (existing) {
      return existing;
    }

    return await this.db
      .insertInto('commentReactions')
      .values({
        commentId: data.commentId,
        userId: data.userId,
        reactionType: data.reactionType,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async removeReaction(data: {
    commentId: string;
    userId: string;
    reactionType: string;
  }) {
    return await this.db
      .deleteFrom('commentReactions')
      .where('commentId', '=', data.commentId)
      .where('userId', '=', data.userId)
      .where('reactionType', '=', data.reactionType)
      .execute();
  }

  async getCommentReactions(commentId: string) {
    return await this.db
      .selectFrom('commentReactions')
      .selectAll()
      .where('commentId', '=', commentId)
      .execute();
  }

  async getCommentReactionCounts(commentId: string) {
    const reactions = await this.db
      .selectFrom('commentReactions')
      .select(['reactionType', (eb) => eb.fn.count('id').as('count')])
      .where('commentId', '=', commentId)
      .groupBy('reactionType')
      .execute();

    return reactions.reduce(
      (acc, r) => {
        acc[r.reactionType] = Number(r.count);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async getUserReaction(commentId: string, userId: string) {
    return await this.db
      .selectFrom('commentReactions')
      .selectAll()
      .where('commentId', '=', commentId)
      .where('userId', '=', userId)
      .executeTakeFirst();
  }
}
