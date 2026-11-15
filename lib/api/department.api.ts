import { apiClient } from './client';

export interface Department {
  id: string;
  universityId: string;
  name: string;
  code: string;
  faculty: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDepartment extends Department {
  _count: {
    users: number;
  };
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  faculty?: string | null;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  faculty?: string | null;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export async function getActiveDepartments(): Promise<Department[]> {
  const response = await apiClient<Department[]>('/departments', { tenant: true });
  return response.data ?? [];
}

export async function getAdminDepartments(): Promise<AdminDepartment[]> {
  const response = await apiClient<AdminDepartment[]>('/admin/departments');
  return response.data ?? [];
}

export async function getDepartmentDetail(id: string): Promise<AdminDepartment> {
  const response = await apiClient<AdminDepartment>(`/admin/departments/${id}`);
  if (!response.data) throw new Error('Department not found.');
  return response.data;
}

export async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
  const response = await apiClient<Department>('/admin/departments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.data) throw new Error('Failed to create department.');
  return response.data;
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentInput,
): Promise<Department> {
  const response = await apiClient<Department>(`/admin/departments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  if (!response.data) throw new Error('Failed to update department.');
  return response.data;
}

export async function toggleDepartmentStatus(id: string, isActive: boolean): Promise<Department> {
  const response = await apiClient<Department>(`/admin/departments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
  if (!response.data) throw new Error('Failed to toggle department status.');
  return response.data;
}

export async function deleteDepartment(id: string): Promise<{ message: string }> {
  const response = await apiClient<{ message: string }>(`/admin/departments/${id}`, {
    method: 'DELETE',
  });
  return response.data ?? { message: response.message ?? 'Department deleted.' };
}

export async function reorderDepartments(orderedIds: string[]): Promise<{ message: string }> {
  const response = await apiClient<{ message: string }>('/admin/departments/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
  return response.data ?? { message: response.message ?? 'Departments reordered.' };
}
