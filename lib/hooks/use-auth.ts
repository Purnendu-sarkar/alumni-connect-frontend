'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export type UserRole = 'STUDENT' | 'ALUMNI' | 'MODERATOR' | 'SUPER_ADMIN';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  verificationStatus: string;
  department?: string;
  profile?: {
    fullName?: string;
    department?: string;
    currentJob?: string;
    company?: string;
    skills?: string[];
  };
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await apiClient<{ user: CurrentUser }>('/auth/me');
      return res.data?.user ?? null;
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient('/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user: query.data ?? null,
    role: query.data?.role ?? null,
    isAuthenticated: Boolean(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch: query.refetch,
  };
}

