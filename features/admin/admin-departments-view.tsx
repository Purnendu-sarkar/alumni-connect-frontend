'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  CheckCircle,
  Archive,
  RefreshCw,
  AlertCircle,
  Info,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/empty-state';
import { TableSkeleton } from '@/components/dashboard/loading-skeleton';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  getAdminDepartments,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  deleteDepartment,
  type AdminDepartment,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
} from '@/lib/api/department.api';

export function AdminDepartmentsView() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartment | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<AdminDepartment | null>(null);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formFaculty, setFormFaculty] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');

  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: getAdminDepartments,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
    queryClient.invalidateQueries({ queryKey: ['departments', 'active'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartment(input),
    onSuccess: (dept) => {
      invalidateAll();
      setIsAddModalOpen(false);
      resetForm();
      setFeedbackNotice(`Department "${dept.name}" (${dept.code}) created successfully.`);
      setFeedbackError(null);
    },
    onError: (err: unknown) => {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to create department.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartmentInput }) =>
      updateDepartment(id, input),
    onSuccess: (dept) => {
      invalidateAll();
      setEditingDepartment(null);
      resetForm();
      setFeedbackNotice(`Department "${dept.name}" updated successfully.`);
      setFeedbackError(null);
    },
    onError: (err: unknown) => {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to update department.');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleDepartmentStatus(id, isActive),
    onSuccess: (dept) => {
      invalidateAll();
      setFeedbackNotice(
        `Department "${dept.name}" is now ${dept.isActive ? 'active' : 'archived'}.`,
      );
      setFeedbackError(null);
    },
    onError: (err: unknown) => {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to update department status.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: (res) => {
      invalidateAll();
      setDeletingDepartment(null);
      setFeedbackNotice(res.message || 'Department deleted successfully.');
      setFeedbackError(null);
    },
    onError: (err: unknown) => {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to delete department.');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormFaculty('');
    setFormDescription('');
    setFormDisplayOrder('0');
  };

  const handleOpenEdit = (dept: AdminDepartment) => {
    setEditingDepartment(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormFaculty(dept.faculty || '');
    setFormDescription(dept.description || '');
    setFormDisplayOrder(String(dept.displayOrder));
    setFeedbackError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setFeedbackError('Department name and code are required.');
      return;
    }
    createMutation.mutate({
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      faculty: formFaculty.trim() || null,
      description: formDescription.trim() || null,
      displayOrder: parseInt(formDisplayOrder, 10) || 0,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    if (!formName.trim() || !formCode.trim()) {
      setFeedbackError('Department name and code are required.');
      return;
    }
    updateMutation.mutate({
      id: editingDepartment.id,
      input: {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        faculty: formFaculty.trim() || null,
        description: formDescription.trim() || null,
        displayOrder: parseInt(formDisplayOrder, 10) || 0,
      },
    });
  };

  const departments = departmentsQuery.data || [];

  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.faculty && d.faculty.toLowerCase().includes(q)),
    );
  }, [departments, search]);

  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => d.isActive).length;
    const faculties = new Set(departments.map((d) => d.faculty).filter(Boolean)).size;
    const totalMembers = departments.reduce((acc, d) => acc + (d._count?.users || 0), 0);
    return { total, active, faculties, totalMembers };
  }, [departments]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACADEMIC GOVERNANCE"
        title="Centralized Department Management"
        description="Configure university faculties, department codes, offerings, and track student/alumni enrollments."
        actions={
          <Button
            onClick={() => {
              resetForm();
              setFeedbackError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={16} />
            <span>Add Department</span>
          </Button>
        }
      />

      {feedbackNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}
      {feedbackError && (
        <FormAlert>
          <div className="flex items-center justify-between w-full">
            <span>{feedbackError}</span>
            <button
              type="button"
              onClick={() => setFeedbackError(null)}
              className="text-rose-600 hover:text-rose-800 text-sm font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </FormAlert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">
              Total Departments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 m-0">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 size={24} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">
              Active Offerings
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 m-0">{stats.active}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">
              Faculties / Divisions
            </p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1 m-0">{stats.faculties}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Layers size={24} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider m-0">
              Enrolled Members
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1 m-0">{stats.totalMembers}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <GraduationCap size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, faculty..."
            className="pl-9 text-sm"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredDepartments.length} of {departments.length} departments
        </div>
      </div>

      {/* Main Table */}
      {departmentsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Departments Found"
          description={
            search
              ? 'No department matched your search criteria.'
              : 'No academic departments have been configured yet.'
          }
          action={
            <Button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              variant="outline"
              className="text-xs"
            >
              Add First Department
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20 text-center">Order</th>
                  <th className="py-3 px-4 w-28">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4 text-center">Enrolled Members</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => {
                  const hasMembers = (dept._count?.users || 0) > 0;
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-xs font-semibold text-slate-400">
                        {dept.displayOrder}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          {dept.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 m-0">{dept.name}</p>
                        {dept.description && (
                          <p className="text-xs text-slate-400 mt-0.5 m-0 line-clamp-1">
                            {dept.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {dept.faculty || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            hasMembers
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Users size={12} />
                          {dept._count?.users || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {dept.isActive ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-xs">
                            Archived
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(dept)}
                          title="Edit Department"
                          className="h-8 px-2 text-slate-600 hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleMutation.mutate({ id: dept.id, isActive: !dept.isActive })
                          }
                          title={dept.isActive ? 'Archive Department' : 'Activate Department'}
                          className={`h-8 px-2 ${
                            dept.isActive
                              ? 'text-amber-600 hover:text-amber-700'
                              : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {dept.isActive ? <Archive size={14} /> : <CheckCircle size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingDepartment(dept)}
                          title="Delete Department"
                          className="h-8 px-2 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 m-0">Add Academic Department</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department Code *
                  </label>
                  <Input
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CSE"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty / School
                </label>
                <Input
                  value={formFaculty}
                  onChange={(e) => setFormFaculty(e.target.value)}
                  placeholder="e.g. Faculty of Science & Engineering"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief summary of department"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Department'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 m-0">Edit Academic Department</h3>
              <button
                type="button"
                onClick={() => setEditingDepartment(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department Code *
                  </label>
                  <Input
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty / School
                </label>
                <Input
                  value={formFaculty}
                  onChange={(e) => setFormFaculty(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDepartment(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Safe Archive Confirmation Modal */}
      {deletingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-full">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 m-0">Delete Department</h3>
                <p className="text-xs text-slate-500 m-0">{deletingDepartment.name} ({deletingDepartment.code})</p>
              </div>
            </div>

            {(deletingDepartment._count?.users || 0) > 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
                  <Info size={18} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">Permanent deletion is protected:</span> This department currently has{' '}
                    <span className="font-bold">{deletingDepartment._count.users} enrolled members</span>. To protect historical graduation transcripts and student records, deleting an active department with enrolled members is prohibited.
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  You can safely <strong>archive</strong> this department instead. Archiving will hide it from new registrations and profile edits while preserving all existing member records.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeletingDepartment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toggleMutation.mutate({ id: deletingDepartment.id, isActive: false });
                      setDeletingDepartment(null);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    Archive Department
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete <strong>{deletingDepartment.name}</strong>? This department has 0 enrolled members and this action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeletingDepartment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(deletingDepartment.id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
