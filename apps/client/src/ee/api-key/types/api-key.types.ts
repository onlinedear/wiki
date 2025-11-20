import { IUser } from "@/features/user/types/user.types.ts";

export type ApiKeyScope = 'pages:read' | 'pages:write' | 'pages:delete' | 
  'spaces:read' | 'spaces:write' | 'spaces:delete' |
  'users:read' | 'comments:read' | 'comments:write' | 'comments:delete';

export type ApiKeyStatus = 'active' | 'expired' | 'expiring_soon' | 'revoked';

export interface IApiKey {
  id: string;
  name: string;
  description?: string;
  token?: string;
  creatorId: string;
  workspaceId: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  creator: Partial<IUser>;
  scopes?: ApiKeyScope[];
  ipWhitelist?: string[];
  rateLimit?: number;
  requestCount?: number;
  status?: ApiKeyStatus;
}

export interface IApiKeyStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  lastUsedEndpoint?: string;
  mostUsedEndpoint?: string;
}

export interface ICreateApiKeyRequest {
  name: string;
  description?: string;
  expiresAt?: string;
  scopes?: ApiKeyScope[];
  ipWhitelist?: string[];
  rateLimit?: number;
}

export interface IUpdateApiKeyRequest {
  name?: string;
  description?: string;
  scopes?: ApiKeyScope[];
  status?: 'active' | 'inactive';
  expiresAt?: string;
}
