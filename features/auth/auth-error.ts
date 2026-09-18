import { ApiClientError } from '@/lib/api/client';

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 429) return 'Too many attempts. Please wait a few minutes before trying again.';
    if (error.status >= 500) return 'The service is temporarily unavailable. Please try again shortly.';
    return error.message;
  }
  return 'We could not complete your request. Check your connection and try again.';
}
