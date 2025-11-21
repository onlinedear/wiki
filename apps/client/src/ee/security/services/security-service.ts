import api from "@/lib/api-client.ts";
import { IAuthProvider } from "@/ee/security/types/security.types.ts";

export async function getSsoProviderById(data: {
  providerId: string;
}): Promise<any> {
  const req = await api.get<IAuthProvider>(`/sso/providers/${data.providerId}`);
  return req.data;
}

export async function getSsoProviders(): Promise<IAuthProvider[]> {
  const req = await api.get<IAuthProvider[]>("/sso/providers");
  return req.data;
}

export async function createSsoProvider(data: any): Promise<IAuthProvider> {
  const req = await api.post<IAuthProvider>("/sso/providers", data);
  return req.data;
}

export async function deleteSsoProvider(data: {
  providerId: string;
}): Promise<void> {
  await api.delete<any>(`/sso/providers/${data.providerId}`);
}

export async function updateSsoProvider(
  data: Partial<IAuthProvider>,
): Promise<IAuthProvider> {
  const req = await api.put<IAuthProvider>("/sso/providers", data);
  return req.data;
}
