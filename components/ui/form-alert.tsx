import type { ReactNode } from 'react';

export function FormAlert({ children }: Readonly<{ children: ReactNode }>) {
  return <p className="form-alert" role="alert" aria-live="assertive">{children}</p>;
}
