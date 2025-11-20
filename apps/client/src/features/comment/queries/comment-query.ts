import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  getPageComments,
  updateComment,
  searchComments,
  addReaction,
  removeReaction,
  getCommentReactions,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/features/comment/services/comment-service";
import {
  ICommentParams,
  IComment,
} from "@/features/comment/types/comment.types";
import { notifications } from "@mantine/notifications";
import { IPagination } from "@/lib/types.ts";
import { useTranslation } from "react-i18next";

export const RQ_KEY = (pageId: string) => ["comments", pageId];

export function useCommentsQuery(
  params: ICommentParams,
): UseQueryResult<IPagination<IComment>, Error> {
  return useQuery({
    queryKey: RQ_KEY(params.pageId),
    queryFn: () => getPageComments(params),
    enabled: !!params.pageId,
  });
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<IComment, Error, Partial<IComment>>({
    mutationFn: (data) => createComment(data),
    onSuccess: (data) => {
      //const newComment = data;
      // let comments = queryClient.getQueryData(RQ_KEY(data.pageId));
      // if (comments) {
      //comments = prevComments => [...prevComments, newComment];
      //queryClient.setQueryData(RQ_KEY(data.pageId), comments);
      //}

      queryClient.refetchQueries({ queryKey: RQ_KEY(data.pageId) });
      notifications.show({ message: t("Comment created successfully") });
    },
    onError: (error) => {
      notifications.show({
        message: t("Error creating comment"),
        color: "red",
      });
    },
  });
}

export function useUpdateCommentMutation() {
  const { t } = useTranslation();

  return useMutation<IComment, Error, Partial<IComment>>({
    mutationFn: (data) => updateComment(data),
    onSuccess: (data) => {
      notifications.show({ message: t("Comment updated successfully") });
    },
    onError: (error) => {
      notifications.show({
        message: t("Failed to update comment"),
        color: "red",
      });
    },
  });
}

export function useDeleteCommentMutation(pageId?: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: (data, variables) => {
      const comments = queryClient.getQueryData(
        RQ_KEY(pageId),
      ) as IPagination<IComment>;

      if (comments && comments.items) {
        const commentId = variables;
        const newComments = comments.items.filter(
          (comment) => comment.id !== commentId,
        );
        queryClient.setQueryData(RQ_KEY(pageId), {
          ...comments,
          items: newComments,
        });
      }

      notifications.show({ message: t("Comment deleted successfully") });
    },
    onError: (error) => {
      notifications.show({
        message: t("Failed to delete comment"),
        color: "red",
      });
    },
  });
}

// EE: useResolveCommentMutation has been moved to @/ee/comment/queries/comment-query

export function useSearchCommentsQuery(params: any) {
  return useQuery({
    queryKey: ["comments", "search", params],
    queryFn: () => searchComments(params),
    enabled: !!params.searchText || !!params.creatorId || params.resolved !== undefined,
  });
}

export function useAddReactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentId: string; reactionType: string }) =>
      addReaction(data),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ["comment-reactions", variables.commentId] 
      });

      // Snapshot the previous value
      const previousReactions = queryClient.getQueryData([
        "comment-reactions",
        variables.commentId,
      ]);

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousReactions) {
        queryClient.setQueryData(
          ["comment-reactions", variables.commentId],
          context.previousReactions,
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ["comment-reactions", variables.commentId] 
      });
    },
  });
}

export function useRemoveReactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentId: string; reactionType: string }) =>
      removeReaction(data),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ["comment-reactions", variables.commentId] 
      });

      // Snapshot the previous value
      const previousReactions = queryClient.getQueryData([
        "comment-reactions",
        variables.commentId,
      ]);

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousReactions) {
        queryClient.setQueryData(
          ["comment-reactions", variables.commentId],
          context.previousReactions,
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ["comment-reactions", variables.commentId] 
      });
    },
  });
}

export function useCommentReactionsQuery(commentId: string) {
  return useQuery({
    queryKey: ["comment-reactions", commentId],
    queryFn: () => getCommentReactions(commentId),
    enabled: !!commentId,
  });
}

export function useNotificationsQuery(unreadOnly = false) {
  return useQuery({
    queryKey: ["comment-notifications", unreadOnly],
    queryFn: () => getNotifications(unreadOnly),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: ["comment-notifications", "unread-count"],
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-notifications"] });
    },
  });
}
