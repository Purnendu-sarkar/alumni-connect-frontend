export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PageMeta;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  error?: { code?: string; details?: unknown };
}
