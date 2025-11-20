import api from "@/lib/api-client";
import {
  ICreateApiKeyRequest,
  IApiKey,
  IUpdateApiKeyRequest,
} from "@/ee/api-key/types/api-key.types";
import { IPagination, QueryParams } from "@/lib/types.ts";

export async function getApiKeys(
  workspaceId: string,
  params?: QueryParams,
): Promise<IApiKey[]> {
  const req = await api.get<IApiKey[]>(`/workspaces/${workspaceId}/api-keys`, {
    params,
  });
  return req.data;
}

export async function createApiKey(
  workspaceId: string,
  data: ICreateApiKeyRequest,
): Promise<IApiKey> {
  const req = await api.post<IApiKey>(
    `/workspaces/${workspaceId}/api-keys`,
    data,
  );
  return req.data;
}

export async function updateApiKey(
  workspaceId: string,
  apiKeyId: string,
  data: IUpdateApiKeyRequest,
): Promise<IApiKey> {
  const req = await api.put<IApiKey>(
    `/workspaces/${workspaceId}/api-keys/${apiKeyId}`,
    data,
  );
  return req.data;
}

export async function revokeApiKey(
  workspaceId: string,
  apiKeyId: string,
): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/api-keys/${apiKeyId}`);
}

export async function getApiKeyStats(
  workspaceId: string,
): Promise<{ total: number; active: number; inactive: number }> {
  const req = await api.get(
    `/workspaces/${workspaceId}/api-keys/stats`,
  );
  return req.data;
}

export async function getUserApiKeys(
  workspaceId: string,
  params?: QueryParams,
): Promise<IApiKey[]> {
  const req = await api.get<IApiKey[]>(`/workspaces/${workspaceId}/api-keys/user`, {
    params,
  });
  return req.data;
}
