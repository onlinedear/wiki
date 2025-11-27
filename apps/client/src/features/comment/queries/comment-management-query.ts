import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceComments,
  deleteComments,
} from "@/features/comment/services/comment-management-service";
import { IPagination } from "@/lib/types";

export interface WorkspaceCommentsParams {
  page?: number;
  limit?: number;
  searchText?: string;
  type?: string;
  creatorId?: string;
}

export function useWorkspaceCommentsQuery(params: WorkspaceCommentsParams) {
  return useQuery<IPagination<any>>({
    queryKey: ["workspace-comments", params],
    queryFn: () => getWorkspaceComments(params),
  });
}

export function useDeleteCommentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { commentIds: string[] }) => deleteComments(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-comments"] });
    },
  });
}
