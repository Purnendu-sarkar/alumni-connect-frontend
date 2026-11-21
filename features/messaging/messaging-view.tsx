'use client';

import { MessagingWorkspace } from './messaging-workspace';
import type { UserRole } from '@/types/domain';

interface MessagingViewProps {
  currentRole: UserRole;
  basePath: string;
  initialUserId?: string;
}

export function MessagingView({ currentRole, basePath, initialUserId }: MessagingViewProps) {
  return (
    <div className="w-full h-full p-2 sm:p-4">
      <MessagingWorkspace
        currentRole={currentRole}
        basePath={basePath}
        initialUserId={initialUserId}
      />
    </div>
  );
}
