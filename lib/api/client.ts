export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: ApiErrorDetail[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'INTERNAL_ERROR',
    public readonly errors: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const { headers, ...init } = options;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${apiUrl}${normalizedPath}`, {
    ...init,
    credentials: 'include', // Automatically passes HttpOnly session cookies
    headers: {
      Accept: 'application/json',
      ...(!isFormData && init.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as (ApiResponse<T> & ApiErrorResponse) | null;

  if (!response.ok || !payload?.success) {
    throw new ApiClientError(
      response.status,
      payload?.message ?? 'An unexpected server error occurred.',
      payload?.code ?? 'INTERNAL_ERROR',
      payload?.errors ?? [],
    );
  }

  return payload;
}
