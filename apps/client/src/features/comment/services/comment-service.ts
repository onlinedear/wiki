import api from "@/lib/api-client";
import {
  ICommentParams,
  IComment,
  IResolveComment,
} from "@/features/comment/types/comment.types";
import { IPagination } from "@/lib/types.ts";

export async function createComment(
  data: Partial<IComment>,
): Promise<IComment> {
  const req = await api.post<IComment>("/comments/create", data);
  return req.data;
}

export async function resolveComment(data: IResolveComment): Promise<IComment> {
  const req = await api.post<IComment>(`/comments/resolve`, data);
  return req.data;
}

export async function updateComment(
  data: Partial<IComment>,
): Promise<IComment> {
  const req = await api.post<IComment>(`/comments/update`, data);
  return req.data;
}

export async function getCommentById(commentId: string): Promise<IComment> {
  const req = await api.post<IComment>("/comments/info", { commentId });
  return req.data;
}

export async function getPageComments(
  data: ICommentParams,
): Promise<IPagination<IComment>> {
  const req = await api.post("/comments", data);
  return req.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await api.post("/comments/delete", { commentId });
}

export async function searchComments(
  data: any,
): Promise<IPagination<IComment>> {
  const req = await api.post("/comments/search", data);
  return req.data;
}

export async function addReaction(data: {
  commentId: string;
  reactionType: string;
}): Promise<any> {
  const req = await api.post("/comments/reactions/add", data);
  return req.data;
}

export async function removeReaction(data: {
  commentId: string;
  reactionType: string;
}): Promise<void> {
  await api.post("/comments/reactions/remove", data);
}

export async function getCommentReactions(commentId: string): Promise<any[]> {
  const req = await api.post("/comments/reactions", { commentId });
  return req.data;
}

export async function getNotifications(
  unreadOnly = false,
): Promise<any[]> {
  const req = await api.get("/comments/notifications", {
    params: { unreadOnly },
  });
  return req.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const req = await api.get("/comments/notifications/unread-count");
  return req.data.count;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  await api.post("/comments/notifications/mark-read", { notificationId });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.post("/comments/notifications/mark-all-read");
}
