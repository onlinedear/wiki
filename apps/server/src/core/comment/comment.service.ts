import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { SearchCommentDto } from './dto/search-comment.dto';
import { CommentRepo } from '@notedoc/db/repos/comment/comment.repo';
import { CommentReactionRepo } from '@notedoc/db/repos/comment/comment-reaction.repo';
import { CommentMentionRepo } from '@notedoc/db/repos/comment/comment-mention.repo';
import { CommentNotificationRepo } from '@notedoc/db/repos/comment/comment-notification.repo';
import { Comment, Page, User } from '@notedoc/db/types/entity.types';
import { PaginationOptions } from '@notedoc/db/pagination/pagination-options';
import { PaginationResult } from '@notedoc/db/pagination/pagination';
import { PageRepo } from '@notedoc/db/repos/page/page.repo';
import { SpaceMemberRepo } from '@notedoc/db/repos/space/space-member.repo';

@Injectable()
export class CommentService {
  constructor(
    private commentRepo: CommentRepo,
    private commentReactionRepo: CommentReactionRepo,
    private commentMentionRepo: CommentMentionRepo,
    private commentNotificationRepo: CommentNotificationRepo,
    private pageRepo: PageRepo,
    private spaceMemberRepo: SpaceMemberRepo,
  ) {}

  async findById(commentId: string) {
    const comment = await this.commentRepo.findById(commentId, {
      includeCreator: true,
      includeResolvedBy: true,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async create(
    opts: { userId: string; page: Page; workspaceId: string },
    createCommentDto: CreateCommentDto,
  ) {
    const { userId, page, workspaceId } = opts;
    const commentContent = JSON.parse(createCommentDto.content);

    let parentComment = null;
    if (createCommentDto.parentCommentId) {
      parentComment = await this.commentRepo.findById(
        createCommentDto.parentCommentId,
      );

      if (!parentComment || parentComment.pageId !== page.id) {
        throw new BadRequestException('Parent comment not found');
      }

      if (parentComment.parentCommentId !== null) {
        throw new BadRequestException('You cannot reply to a reply');
      }
    }

    const comment = await this.commentRepo.insertComment({
      pageId: page.id,
      content: commentContent,
      selection: createCommentDto?.selection?.substring(0, 250),
      type: 'inline',
      parentCommentId: createCommentDto?.parentCommentId,
      creatorId: userId,
      workspaceId: workspaceId,
      spaceId: page.spaceId,
    });

    // Process mentions
    await this.processMentions(comment.id, createCommentDto.content);

    // Create notification for parent comment owner (if replying)
    if (parentComment && parentComment.creatorId !== userId) {
      await this.commentNotificationRepo.createNotification({
        userId: parentComment.creatorId,
        commentId: comment.id,
        type: 'reply',
      });
    }

    return comment;
  }

  async findByPageId(
    pageId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Comment>> {
    const page = await this.pageRepo.findById(pageId);

    if (!page) {
      throw new BadRequestException('Page not found');
    }

    return await this.commentRepo.findPageComments(pageId, pagination);
  }

  async update(
    comment: Comment,
    updateCommentDto: UpdateCommentDto,
    authUser: User,
  ): Promise<Comment> {
    const commentContent = JSON.parse(updateCommentDto.content);

    if (comment.creatorId !== authUser.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const editedAt = new Date();

    await this.commentRepo.updateComment(
      {
        content: commentContent,
        editedAt: editedAt,
        updatedAt: editedAt,
      },
      comment.id,
    );
    comment.content = commentContent;
    comment.editedAt = editedAt;
    comment.updatedAt = editedAt;

    return comment;
  }

  async searchComments(
    searchDto: SearchCommentDto,
    workspaceId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Comment>> {
    return await this.commentRepo.searchComments({
      ...searchDto,
      workspaceId,
      pagination,
    });
  }

  async addReaction(
    commentId: string,
    userId: string,
    reactionType: string,
  ) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Create notification for comment owner (if not reacting to own comment)
    if (comment.creatorId !== userId) {
      await this.commentNotificationRepo.createNotification({
        userId: comment.creatorId,
        commentId: comment.id,
        type: 'reaction',
      });
    }

    return await this.commentReactionRepo.addReaction({
      commentId,
      userId,
      reactionType,
    });
  }

  async removeReaction(
    commentId: string,
    userId: string,
    reactionType: string,
  ) {
    return await this.commentReactionRepo.removeReaction({
      commentId,
      userId,
      reactionType,
    });
  }

  async getCommentReactions(commentId: string) {
    return await this.commentReactionRepo.getCommentReactions(commentId);
  }

  async extractMentions(content: string): Promise<string[]> {
    // Extract @mentions from comment content
    // Format: @[userId](userName)
    const mentionRegex = /@\[([a-f0-9-]+)\]\([^)]+\)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]); // userId
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  async processMentions(commentId: string, content: string) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      return;
    }

    const mentionedUserIds = await this.extractMentions(content);

    for (const userId of mentionedUserIds) {
      // Don't notify if mentioning yourself
      if (userId === comment.creatorId) {
        continue;
      }

      // Add mention record
      await this.commentMentionRepo.addMention({
        commentId,
        mentionedUserId: userId,
      });

      // Create notification
      await this.commentNotificationRepo.createNotification({
        userId,
        commentId,
        type: 'mention',
      });
    }
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return await this.commentNotificationRepo.getUserNotifications(
      userId,
      unreadOnly,
    );
  }

  async markNotificationAsRead(notificationId: string) {
    return await this.commentNotificationRepo.markAsRead(notificationId);
  }

  async markAllNotificationsAsRead(userId: string) {
    return await this.commentNotificationRepo.markAllAsRead(userId);
  }

  async getUnreadNotificationCount(userId: string) {
    return await this.commentNotificationRepo.getUnreadCount(userId);
  }

  async getWorkspaceComments(workspaceId: string, params: any) {
    const { page = 1, limit = 20, searchText, type, creatorId } = params;
    const pagination: PaginationOptions = { 
      page, 
      limit,
      query: null,
      adminView: false,
    };

    return await this.commentRepo.getWorkspaceComments(
      workspaceId,
      pagination,
      { searchText, type, creatorId },
    );
  }

  async deleteBatchComments(commentIds: string[], workspaceId: string) {
    // Verify all comments belong to this workspace
    for (const commentId of commentIds) {
      const comment = await this.commentRepo.findById(commentId);
      if (!comment || comment.workspaceId !== workspaceId) {
        throw new NotFoundException(`Comment ${commentId} not found`);
      }
    }

    // Delete all comments
    for (const commentId of commentIds) {
      await this.commentRepo.deleteComment(commentId);
    }

    return { deleted: commentIds.length };
  }
}
