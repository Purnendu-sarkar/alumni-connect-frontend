'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveDepartments, type Department } from '@/lib/api/department.api';

export function useDepartments() {
  const query = useQuery<Department[]>({
    queryKey: ['departments', 'active'],
    queryFn: getActiveDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    departments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
