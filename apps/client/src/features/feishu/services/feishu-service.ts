import apiClient from '@/lib/api-client';

export interface FeishuConfig {
  appId: string;
  appSecret?: string;
  hasAppSecret?: boolean;
}

export interface SaveFeishuConfigDto {
  appId: string;
  appSecret: string;
}

export interface FeishuOnlineImportDto {
  documentUrl: string;
  spaceId: string;
  includeChildren: boolean;
}

export async function getFeishuConfig() {
  const response = await apiClient.get('/feishu/config');
  return response.data;
}

export async function saveFeishuConfig(data: SaveFeishuConfigDto) {
  const response = await apiClient.post('/feishu/config', data);
  return response.data;
}

export async function deleteFeishuConfig() {
  const response = await apiClient.delete('/feishu/config');
  return response.data;
}

export async function importFeishuOnline(data: FeishuOnlineImportDto) {
  const response = await apiClient.post('/feishu/import/online', data);
  return response.data;
}

export async function listFeishuDocuments(folderToken: string) {
  const response = await apiClient.post('/feishu/list-documents', { folderToken });
  return response.data;
}

export async function importFeishuBatch(data: {
  spaceId: string;
  documents: Array<{ token: string; parentToken?: string }>;
}) {
  const response = await apiClient.post('/feishu/import/batch', data);
  return response.data;
}
