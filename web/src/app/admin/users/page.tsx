'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';
import {
  listUsers,
  listRoles,
  createUser,
  getUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  getUserActivity,
  updateUserRoles,
  exportUsers,
} from '@/lib/api/users';
import type {
  Role,
  UserDetail,
  UserList,
  UserActivityList,
  CreateUserRequest,
} from '@/lib/api/users';
import { validateRequest, createUserSchema } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const DEPARTMENTS = ['Operations', 'Finance', 'IT', 'Compliance', 'Risk'];

function formatRoleName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function groupByDepartment(items: UserDetail[]): Record<string, UserDetail[]> {
  const groups: Record<string, UserDetail[]> = {};
  for (const user of items) {
    const dept = user.department || 'Unassigned';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(user);
  }
  return groups;
}

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<UserList | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivityList | null>(
    null,
  );

  const [createTab, setCreateTab] = useState('basic');
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    department: '',
    jobTitle: '',
    employeeId: '',
    roleIds: [] as number[],
    forcePasswordChange: false,
    sendWelcomeEmail: false,
  });
  const [createErrors, setCreateErrors] = useState<string[]>([]);

  const [editTab, setEditTab] = useState('basic');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    employeeId: '',
    roleIds: [] as number[],
  });
  const [editSuccess, setEditSuccess] = useState('');
  const [editErrors, setEditErrors] = useState<string[]>([]);

  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateErrors, setDeactivateErrors] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterParams, setFilterParams] = useState<Record<string, unknown>>({});

  const anyDialogOpen =
    createModalOpen || editModalOpen || viewModalOpen || deactivateModalOpen;

  const fetchUsers = useCallback(async (params?: Record<string, unknown>) => {
    try {
      const result = await listUsers(params as Parameters<typeof listUsers>[0]);
      setUsers(result);
      setOperationError(null);
    } catch {
      setOperationError('Failed to load users. Please try again.');
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (!user.roles.includes('Administrator')) {
          setAccessDenied(true);
          router.replace('/');
          return;
        }

        const [, rolesResult] = await Promise.allSettled([
          fetchUsers(),
          listRoles(),
        ]);

        if (rolesResult.status === 'fulfilled') {
          setAvailableRoles(rolesResult.value);
        }
      } catch {
        setOperationError('Failed to initialize. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, fetchUsers]);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newParams = { ...filterParams, search: searchQuery };
      setFilterParams(newParams);
      await fetchUsers(newParams);
    }
  };

  const handleStatusFilter = async (isActive: boolean) => {
    const newParams = { ...filterParams, isActive };
    setFilterParams(newParams);
    await fetchUsers(newParams);
  };

  const handleRoleFilter = async (roleId: string) => {
    const newParams = { ...filterParams, roleId: Number(roleId) };
    setFilterParams(newParams);
    await fetchUsers(newParams);
  };

  const handleDepartmentFilter = async (department: string) => {
    const newParams = { ...filterParams, department };
    setFilterParams(newParams);
    await fetchUsers(newParams);
  };

  const handleCreateUser = async () => {
    const result = validateRequest(createUserSchema, createForm);
    if (!result.success) {
      setCreateErrors(result.errors);
      return;
    }

    if (!currentUser) return;

    setIsSaving(true);
    setCreateErrors([]);

    try {
      const data: CreateUserRequest = {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        username: createForm.username,
        displayName: `${createForm.firstName} ${createForm.lastName}`,
        department: createForm.department || undefined,
        jobTitle: createForm.jobTitle || undefined,
        employeeId: createForm.employeeId || undefined,
        roleIds: createForm.roleIds,
        forcePasswordChange: createForm.forcePasswordChange || undefined,
        sendWelcomeEmail: createForm.sendWelcomeEmail || undefined,
      };
      await createUser(data, currentUser.username);
      setCreateModalOpen(false);
      resetCreateForm();
      await fetchUsers(filterParams);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setCreateErrors([
        error.message || 'Failed to create user. Please try again.',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !currentUser) return;

    setIsSaving(true);
    setEditErrors([]);

    try {
      await updateUser(
        selectedUser.id,
        {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          department: editForm.department || undefined,
          jobTitle: editForm.jobTitle || undefined,
          employeeId: editForm.employeeId || undefined,
        },
        currentUser.username,
      );

      const originalRoleIds = selectedUser.roles.map((r) => r.id).sort();
      const newRoleIds = [...editForm.roleIds].sort();
      if (JSON.stringify(originalRoleIds) !== JSON.stringify(newRoleIds)) {
        await updateUserRoles(
          selectedUser.id,
          { roleIds: editForm.roleIds },
          currentUser.username,
        );
      }

      setEditSuccess('User updated successfully');
      await fetchUsers(filterParams);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setEditErrors([
        error.message || 'Failed to update user. Please try again.',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser || !currentUser) return;

    if (!deactivateReason.trim()) {
      setDeactivateErrors(['Deactivation reason is required for audit trail']);
      return;
    }

    setIsSaving(true);
    setDeactivateErrors([]);

    try {
      await deactivateUser(
        selectedUser.id,
        { reason: deactivateReason },
        currentUser.username,
      );
      setDeactivateModalOpen(false);
      setDeactivateReason('');
      setDeactivateErrors([]);
      await fetchUsers(filterParams);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setDeactivateErrors([
        error.message || 'Failed to deactivate user. Please try again.',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReactivateUser = async (user: UserDetail) => {
    if (!currentUser) return;

    setOperationError(null);

    try {
      await reactivateUser(user.id, currentUser.username);
      await fetchUsers(filterParams);
    } catch {
      setOperationError('Failed to reactivate user. Please try again.');
    }
  };

  const handleExport = async () => {
    setIsSaving(true);
    setOperationError(null);

    try {
      const blob = await exportUsers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setOperationError('Failed to export users. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = async (user: UserDetail) => {
    try {
      const details = await getUser(user.id);
      setSelectedUser(details);
      setEditForm({
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email || '',
        department: details.department || '',
        jobTitle: details.jobTitle || '',
        employeeId: details.employeeId || '',
        roleIds: details.roles.map((r) => r.id),
      });
      setEditSuccess('');
      setEditErrors([]);
      setEditTab('basic');
      setEditModalOpen(true);
    } catch {
      setOperationError('Failed to load user details. Please try again.');
    }
  };

  const openViewModal = async (user: UserDetail) => {
    try {
      const details = await getUser(user.id);
      setSelectedUser(details);
      try {
        const activities = await getUserActivity(user.id);
        setUserActivities(activities);
      } catch {
        // Activities may not load - non-critical
      }
      setViewModalOpen(true);
    } catch {
      setOperationError('Failed to load user details. Please try again.');
    }
  };

  const openDeactivateModal = (user: UserDetail) => {
    setSelectedUser(user);
    setDeactivateReason('');
    setDeactivateErrors([]);
    setDeactivateModalOpen(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      department: '',
      jobTitle: '',
      employeeId: '',
      roleIds: [],
      forcePasswordChange: false,
      sendWelcomeEmail: false,
    });
    setCreateErrors([]);
    setCreateTab('basic');
  };

  const toggleCreateRole = (roleId: number) => {
    setCreateForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const toggleEditRole = (roleId: number) => {
    setEditForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div role="progressbar" aria-label="Loading users">
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div role="alert" className="text-center py-12">
          <p className="text-lg font-semibold text-destructive">
            Access denied.
          </p>
          <p className="text-muted-foreground">Administrator role required.</p>
        </div>
      </main>
    );
  }

  const activeCount = users?.items.filter((u) => u.isActive).length ?? 0;
  const grouped = users ? groupByDepartment(users.items) : {};

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Administration</h1>
          {users && (
            <p className="text-muted-foreground">
              Showing {activeCount} active users
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            aria-label="Export User List"
            disabled={isSaving}
          >
            Export User List
          </Button>
          <Button
            onClick={() => {
              resetCreateForm();
              setCreateModalOpen(true);
            }}
            aria-label="Add New User"
          >
            + Add New User
          </Button>
        </div>
      </div>

      {operationError && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {operationError}
        </div>
      )}

      {!anyDialogOpen && (
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search-users" className="sr-only">
              Search
            </Label>
            <Input
              id="search-users"
              aria-label="Search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => handleStatusFilter(false)}
            aria-label="Inactive Users"
          >
            Show Deactivated
          </Button>
          <div>
            <Select onValueChange={handleRoleFilter}>
              <SelectTrigger aria-label="Filter by Role">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {formatRoleName(role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select onValueChange={handleDepartmentFilter}>
              <SelectTrigger aria-label="Filter by Department">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(grouped).map(([dept, deptUsers]) => (
            <React.Fragment key={`dept-${dept}`}>
              <TableRow>
                <TableCell colSpan={6} className="bg-muted/50 font-medium">
                  {dept}
                </TableCell>
              </TableRow>
              {deptUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.roles.map((r) => r.name).join(', ')}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <div>
                        <Badge variant="destructive">Inactive</Badge>
                        {user.deactivationReason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.deactivationReason}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openViewModal(user)}
                        aria-label="View"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(user)}
                        aria-label="Edit"
                      >
                        Edit
                      </Button>
                      {user.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeactivateModal(user)}
                          aria-label="Deactivate"
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReactivateUser(user)}
                          aria-label="Reactivate"
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {/* Create User Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>

          {createErrors.length > 0 && (
            <div role="alert" className="text-sm text-destructive space-y-1">
              {createErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          <Tabs value={createTab} onValueChange={setCreateTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            style={{ display: createTab === 'basic' ? undefined : 'none' }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="create-firstName">First Name</Label>
              <Input
                id="create-firstName"
                value={createForm.firstName}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-lastName">Last Name</Label>
              <Input
                id="create-lastName"
                value={createForm.lastName}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-username">Username</Label>
              <Input
                id="create-username"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, username: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-department">Department</Label>
              <Input
                id="create-department"
                value={createForm.department}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, department: e.target.value }))
                }
              />
            </div>
          </div>

          <div
            style={{ display: createTab === 'roles' ? undefined : 'none' }}
            className="space-y-4"
          >
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-center gap-2">
                <Checkbox
                  id={`create-role-${role.id}`}
                  checked={createForm.roleIds.includes(role.id)}
                  onCheckedChange={() => toggleCreateRole(role.id)}
                  aria-label={formatRoleName(role.name)}
                />
                <Label htmlFor={`create-role-${role.id}`}>
                  {formatRoleName(role.name)}
                </Label>
              </div>
            ))}
          </div>

          <div
            style={{ display: createTab === 'contact' ? undefined : 'none' }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="create-jobTitle">Job Title</Label>
              <Input
                id="create-jobTitle"
                value={createForm.jobTitle}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, jobTitle: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-employeeId">Employee ID</Label>
              <Input
                id="create-employeeId"
                value={createForm.employeeId}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, employeeId: e.target.value }))
                }
              />
            </div>
          </div>

          <div
            style={{ display: createTab === 'security' ? undefined : 'none' }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                id="create-forcePassword"
                checked={createForm.forcePasswordChange}
                onCheckedChange={(checked) =>
                  setCreateForm((p) => ({
                    ...p,
                    forcePasswordChange: checked === true,
                  }))
                }
              >
                <span className="sr-only">
                  Force password change on first login
                </span>
              </Checkbox>
              <span className="text-sm font-medium leading-none">
                Force password change on first login
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="create-welcomeEmail"
                checked={createForm.sendWelcomeEmail}
                onCheckedChange={(checked) =>
                  setCreateForm((p) => ({
                    ...p,
                    sendWelcomeEmail: checked === true,
                  }))
                }
              >
                <span className="sr-only">
                  Send welcome email with login instructions
                </span>
              </Checkbox>
              <span className="text-sm font-medium leading-none">
                Send welcome email with login instructions
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          {editSuccess && (
            <div role="status" className="text-sm text-green-600">
              {editSuccess}
            </div>
          )}

          {editErrors.length > 0 && (
            <div role="alert" className="text-sm text-destructive space-y-1">
              {editErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          <Tabs value={editTab} onValueChange={setEditTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            style={{ display: editTab === 'basic' ? undefined : 'none' }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input
                id="edit-firstName"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input
                id="edit-lastName"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
          </div>

          <div
            style={{ display: editTab === 'roles' ? undefined : 'none' }}
            className="space-y-4"
          >
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-center gap-2">
                <Checkbox
                  id={`edit-role-${role.id}`}
                  checked={editForm.roleIds.includes(role.id)}
                  onCheckedChange={() => toggleEditRole(role.id)}
                  aria-label={formatRoleName(role.name)}
                />
                <Label htmlFor={`edit-role-${role.id}`}>
                  {formatRoleName(role.name)}
                </Label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3 mt-4">
                <p className="font-semibold text-lg">
                  {selectedUser.displayName}
                </p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Username</dt>
                  <dd>{selectedUser.username}</dd>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{selectedUser.email}</dd>
                  <dt className="text-muted-foreground">Employee ID</dt>
                  <dd>{selectedUser.employeeId}</dd>
                  <dt className="text-muted-foreground">Department</dt>
                  <dd>{selectedUser.department}</dd>
                  <dt className="text-muted-foreground">Job Title</dt>
                  <dd>{selectedUser.jobTitle}</dd>
                  <dt className="text-muted-foreground">Roles</dt>
                  <dd>{selectedUser.roles.map((r) => r.name).join(', ')}</dd>
                </dl>
              </TabsContent>

              <TabsContent value="activity" className="space-y-3 mt-4">
                {userActivities?.items.map((activity) => (
                  <div key={activity.id} className="border rounded p-3">
                    <p className="text-sm">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="permissions" className="space-y-3 mt-4">
                {selectedUser.roles.map((role) => (
                  <div key={role.id} className="border rounded p-3">
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                <p className="text-muted-foreground">
                  Audit trail data is available via temporal tables.
                </p>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Modal */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              This will prevent the user from logging in.
            </DialogDescription>
          </DialogHeader>

          {deactivateErrors.length > 0 && (
            <div role="alert" className="text-sm text-destructive space-y-1">
              {deactivateErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="deactivate-reason">Reason for Deactivation</Label>
            <Input
              id="deactivate-reason"
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              placeholder="Enter reason for deactivation..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateUser}
              disabled={isSaving}
            >
              {isSaving ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
