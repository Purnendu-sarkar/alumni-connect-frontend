/**
 * Utility helper to safely extract human-readable error messages from unknown error instances.
 */
export function getApiErrorMessage(err: unknown, fallback = 'An unexpected error occurred.'): string {
  if (!err) return fallback;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err !== null) {
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message;
    }
  }
  if (typeof err === 'string') return err;
  return fallback;
}
