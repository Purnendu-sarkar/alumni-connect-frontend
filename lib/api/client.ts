import type { ApiErrorPayload, ApiResponse } from '@/types/api';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
const tenantDomain = process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? 'example.edu';

export class ApiClientError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
  tenant?: boolean;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { accessToken, tenant = false, headers, ...init } = options;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(!isFormData && init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(tenant ? { 'x-tenant-domain': tenantDomain } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | ApiErrorPayload | null;
  if (!response.ok || !payload?.success) {
    const error = payload as ApiErrorPayload | null;
    throw new ApiClientError(response.status, error?.message ?? 'The server returned an unexpected response.', error?.error?.details);
  }
  return payload as ApiResponse<T>;
}
