import { QueryParams } from "@/lib/types.ts";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  createApiKey,
  getApiKeys,
  getApiKeyStats,
  getUserApiKeys,
  IApiKey,
  ICreateApiKeyRequest,
  IUpdateApiKeyRequest,
  revokeApiKey,
  updateApiKey,
} from "@/ee/api-key";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { workspaceAtom } from "@/features/user/atoms/current-user-atom";

export function useGetApiKeysQuery(
  params?: QueryParams,
): UseQueryResult<IApiKey[], Error> {
  const workspace = useAtomValue(workspaceAtom);
  
  return useQuery({
    queryKey: ["api-key-list", workspace?.id, params],
    queryFn: () => getApiKeys(workspace?.id!, params),
    enabled: !!workspace?.id,
    staleTime: 0,
    gcTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useGetApiKeyStatsQuery(): UseQueryResult<
  { total: number; active: number; inactive: number },
  Error
> {
  const workspace = useAtomValue(workspaceAtom);
  
  return useQuery({
    queryKey: ["api-key-stats", workspace?.id],
    queryFn: () => getApiKeyStats(workspace?.id!),
    enabled: !!workspace?.id,
  });
}

export function useRevokeApiKeyMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const workspace = useAtomValue(workspaceAtom);

  return useMutation<
    void,
    Error,
    {
      apiKeyId: string;
    }
  >({
    mutationFn: (data) => revokeApiKey(workspace?.id!, data.apiKeyId),
    onSuccess: (data, variables) => {
      notifications.show({ message: t("Revoked successfully") });
      queryClient.invalidateQueries({
        predicate: (item) =>
          ["api-key-list", "user-api-key-list", "api-key-stats"].includes(item.queryKey[0] as string),
      });
    },
    onError: (error) => {
      const errorMessage = error["response"]?.data?.message;
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const workspace = useAtomValue(workspaceAtom);

  return useMutation<IApiKey, Error, ICreateApiKeyRequest>({
    mutationFn: (data) => createApiKey(workspace?.id!, data),
    onSuccess: () => {
      notifications.show({ message: t("API key created successfully") });
      queryClient.invalidateQueries({
        predicate: (item) =>
          ["api-key-list", "user-api-key-list", "api-key-stats"].includes(item.queryKey[0] as string),
      });
    },
    onError: (error) => {
      const errorMessage = error["response"]?.data?.message;
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useUpdateApiKeyMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const workspace = useAtomValue(workspaceAtom);

  return useMutation<
    IApiKey,
    Error,
    IUpdateApiKeyRequest & { apiKeyId: string }
  >({
    mutationFn: (data) => {
      const { apiKeyId, ...updateData } = data;
      return updateApiKey(workspace?.id!, apiKeyId, updateData);
    },
    onSuccess: (data, variables) => {
      notifications.show({ message: t("Updated successfully") });
      queryClient.invalidateQueries({
        predicate: (item) =>
          ["api-key-list", "user-api-key-list", "api-key-stats"].includes(item.queryKey[0] as string),
      });
    },
    onError: (error) => {
      const errorMessage = error["response"]?.data?.message;
      notifications.show({ message: errorMessage, color: "red" });
    },
  });
}

export function useGetUserApiKeysQuery(
  params?: QueryParams,
): UseQueryResult<IApiKey[], Error> {
  const workspace = useAtomValue(workspaceAtom);
  
  return useQuery({
    queryKey: ["user-api-key-list", workspace?.id, params],
    queryFn: () => getUserApiKeys(workspace?.id!, params),
    enabled: !!workspace?.id,
    staleTime: 0,
    gcTime: 0,
    placeholderData: keepPreviousData,
  });
}
