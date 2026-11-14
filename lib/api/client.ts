import type { ApiErrorPayload, ApiResponse } from '@/types/api';
import { useAuthStore } from '@/store/auth-store';
import { refreshSession } from './auth.api';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api/v1';
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
  _retry?: boolean;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { accessToken, tenant = false, _retry = false, headers, ...init } = options;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const currentToken =
    accessToken !== undefined ? accessToken : useAuthStore.getState().accessToken;

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(!isFormData && init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(tenant ? { 'x-tenant-domain': tenantDomain } : {}),
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      ...headers,
    },
  });

  const isAuthEndpoint =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/demo-login') ||
    path.startsWith('/auth/logout');

  // Automatic token refresh on 401 Unauthorized for authenticated endpoints
  if (response.status === 401 && !_retry && !isAuthEndpoint) {
    try {
      const refreshed = await refreshSession();
      if (refreshed.data?.accessToken && refreshed.data?.user) {
        useAuthStore.getState().setSession(refreshed.data);
        return apiClient<T>(path, {
          ...options,
          accessToken: refreshed.data.accessToken,
          _retry: true,
        });
      }
    } catch {
      useAuthStore.getState().clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | ApiErrorPayload | null;
  if (!response.ok || !payload?.success) {
    const error = payload as ApiErrorPayload | null;
    throw new ApiClientError(response.status, error?.message ?? 'The server returned an unexpected response.', error?.error?.details);
  }
  return payload as ApiResponse<T>;
}
