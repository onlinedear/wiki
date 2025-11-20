import api from "@/lib/api-client";
import { IPagination } from "@/lib/types";

export interface WorkspaceCommentsParams {
  page?: number;
  limit?: number;
  searchText?: string;
  type?: string;
  creatorId?: string;
}

export async function getWorkspaceComments(
  params: WorkspaceCommentsParams
): Promise<IPagination<any>> {
  const req = await api.post("/comments/workspace/list", params);
  return req.data;
}

export async function deleteComments(data: {
  commentIds: string[];
}): Promise<void> {
  await api.post("/comments/workspace/delete-batch", data);
}
