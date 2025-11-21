import api from '@/lib/api-client';

export interface ConfluenceConfig {
  confluenceUrl: string;
  accessToken: string;
}

export interface ConfluenceOnlineImport {
  confluenceUrl?: string;
  accessToken?: string;
  pageId: string;
  spaceId: string;
  includeChildren?: boolean;
}

export async function saveConfluenceConfig(config: ConfluenceConfig): Promise<any> {
  return api.post('/confluence/config', config);
}

export async function getConfluenceConfig(): Promise<any> {
  return api.get('/confluence/config');
}

export async function deleteConfluenceConfig(): Promise<any> {
  return api.delete('/confluence/config');
}

export async function testConfluenceConnection(config: ConfluenceConfig): Promise<any> {
  return api.post('/confluence/test-connection', config);
}

export async function importConfluenceOnline(data: ConfluenceOnlineImport): Promise<any> {
  return api.post('/confluence/import-online', data);
}
