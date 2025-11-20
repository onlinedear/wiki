import { IUser } from "@/features/user/types/user.types";
import { QueryParams } from "@/lib/types.ts";

export interface IComment {
  id: string;
  content: string;
  selection?: string;
  type?: string;
  creatorId: string;
  pageId: string;
  parentCommentId?: string;
  resolvedById?: string;
  resolvedAt?: Date;
  workspaceId: string;
  createdAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  creator: IUser;
  resolvedBy?: IUser;
}

export interface ICommentData {
  id: string;
  pageId: string;
  parentCommentId?: string;
  content: any;
  selection?: string;
}

export interface IResolveComment {
  commentId: string;
  pageId: string;
  resolved: boolean;
}

export interface ICommentParams extends QueryParams {
  pageId: string;
}

export interface ICommentReaction {
  id: string;
  commentId: string;
  userId: string;
  reactionType: 'like' | 'love' | 'laugh' | 'surprised' | 'sad' | 'angry';
  createdAt: Date;
}

export interface ICommentNotification {
  id: string;
  userId: string;
  commentId: string;
  type: 'reply' | 'mention' | 'reaction';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  comment?: IComment;
  creatorName?: string;
  creatorAvatar?: string;
  pageTitle?: string;
  pageSlugId?: string;
}

export interface ISearchCommentParams extends QueryParams {
  pageId?: string;
  searchText?: string;
  creatorId?: string;
  resolved?: boolean;
}
