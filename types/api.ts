export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  error?: { code?: string; details?: unknown };
}
