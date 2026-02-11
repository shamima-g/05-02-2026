'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/api/auth';
import {
  getLoginActivity,
  getLoginAlerts,
  exportLoginActivity,
  type LoginAttempt,
  type LoginActivitySummary,
  type SecurityAlert,
  type LoginActivityFilters,
} from '@/lib/api/audit';
import { listUsers, type UserDetail } from '@/lib/api/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LoginActivityPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [summary, setSummary] = useState<LoginActivitySummary>({
    successfulLogins: 0,
    failedAttempts: 0,
    lockedAccounts: 0,
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'success' | 'failed'
  >('all');
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined,
  );
  const [userSearch, setUserSearch] = useState('');

  // Load login activity data
  const loadData = useCallback(
    async (filters?: LoginActivityFilters) => {
      try {
        const defaultFilters: LoginActivityFilters = {
          status: statusFilter,
          ...filters,
        };
        const [activityData, alertsData] = await Promise.all([
          getLoginActivity(defaultFilters),
          getLoginAlerts(),
        ]);
        setLoginAttempts(activityData.data);
        setSummary(activityData.summary);
        setAlerts(alertsData.data);
      } catch (error) {
        console.error('Failed to load login activity:', error);
      }
    },
    [statusFilter],
  );

  // Load users for filter
  const loadUsers = useCallback(async (search?: string) => {
    try {
      const params = search ? { search } : {};
      const usersList = await listUsers(params);
      if (usersList && usersList.items) {
        setUsers(usersList.items);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  }, []);

  // Check authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        const hasAdminRole = user.roles.includes('Administrator');
        setIsAuthorized(hasAdminRole);
        if (hasAdminRole) {
          await loadData();
          await loadUsers();
        }
      } catch {
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [loadData, loadUsers]);

  // Apply date range filter
  const handleApplyDateFilter = () => {
    const filters: LoginActivityFilters = {
      status: statusFilter,
    };
    if (fromDate) {
      filters.from = new Date(fromDate).toISOString();
    }
    if (toDate) {
      filters.to = new Date(toDate).toISOString();
    }
    if (selectedUserId) {
      filters.userId = selectedUserId;
    }
    loadData(filters);
  };

  // Apply preset filters
  const handlePresetFilter = (preset: 'last7days' | 'today') => {
    const now = new Date();
    const filters: LoginActivityFilters = {
      status: statusFilter,
    };

    if (preset === 'last7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      filters.from = sevenDaysAgo.toISOString();
      filters.to = now.toISOString();
    } else if (preset === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      filters.from = startOfDay.toISOString();
      filters.to = now.toISOString();
    }

    if (selectedUserId) {
      filters.userId = selectedUserId;
    }

    loadData(filters);
  };

  // Toggle failed logins filter
  const handleToggleFailedLogins = () => {
    const newStatus = statusFilter === 'all' ? 'failed' : 'all';
    setStatusFilter(newStatus);
    const filters: LoginActivityFilters = {
      status: newStatus,
    };
    if (selectedUserId) {
      filters.userId = selectedUserId;
    }
    loadData(filters);
  };

  // Handle user filter change
  const handleUserFilterChange = (value: string) => {
    const userId = value === 'all' ? undefined : parseInt(value);
    setSelectedUserId(userId);
    const filters: LoginActivityFilters = {
      status: statusFilter,
    };
    if (userId) {
      filters.userId = userId;
    }
    loadData(filters);
  };

  // Handle user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch) {
        loadUsers(userSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, loadUsers]);

  // Toggle row expansion
  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Export report
  const handleExport = async () => {
    try {
      const filters = {
        from: fromDate
          ? new Date(fromDate).toISOString()
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: toDate ? new Date(toDate).toISOString() : new Date().toISOString(),
        status: statusFilter,
      };
      if (selectedUserId) {
        Object.assign(filters, { userId: selectedUserId });
      }
      const blob = await exportLoginActivity(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `login-activity-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  // Format failure reason
  const formatFailureReason = (
    reason: LoginAttempt['failureReason'],
  ): string => {
    if (!reason) return '';
    const map: Record<string, string> = {
      invalid_password: 'Invalid Password',
      user_not_found: 'User Not Found',
      account_deactivated: 'Account Deactivated',
      account_locked: 'Account Locked',
    };
    return map[reason] || reason;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div
          role="progressbar"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
        ></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Access denied. Administrator role required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Login Activity Report</h1>

      {/* Security Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const borderClass =
              alert.severity === 'critical'
                ? 'border-red-500'
                : alert.severity === 'warning'
                  ? 'border-yellow-500'
                  : 'border-blue-500';
            const textClass =
              alert.severity === 'critical'
                ? 'text-red-700'
                : alert.severity === 'warning'
                  ? 'text-yellow-700'
                  : 'text-blue-700';
            return (
              <Card key={alert.id} className={borderClass}>
                <CardContent className="pt-4">
                  <p className={textClass}>{alert.message}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Successful Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.successfulLogins} successful logins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Failed Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.failedAttempts} failed attempts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Locked Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {summary.lockedAccounts} locked accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button onClick={handleApplyDateFilter}>Apply</Button>
          </div>

          {/* Preset Filters */}
          <div className="flex gap-2">
            <Button
              onClick={() => handlePresetFilter('last7days')}
              variant="outline"
            >
              Last 7 days
            </Button>
            <Button
              onClick={() => handlePresetFilter('today')}
              variant="outline"
            >
              Today
            </Button>
          </div>

          {/* Status Filter */}
          <div>
            <Button onClick={handleToggleFailedLogins} variant="outline">
              View Failed Logins Only
            </Button>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <div>
              <Label htmlFor="user-search">Search Users</Label>
              <Input
                id="user-search"
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="user-filter">Filter by User</Label>
              <Select
                value={selectedUserId?.toString() || 'all'}
                onValueChange={handleUserFilterChange}
              >
                <SelectTrigger id="user-filter">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.displayName} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export */}
          <div>
            <Button onClick={handleExport}>Export Login Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div role="region" aria-label="Login attempts table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginAttempts.map((attempt) => {
                  const isExpanded = expandedRows.has(attempt.id);
                  return (
                    <TableRow key={`attempt-${attempt.id}`}>
                      <TableCell>
                        {formatTimestamp(attempt.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          {attempt.username}
                          {attempt.displayName && (
                            <div className="text-sm text-gray-500">
                              {attempt.displayName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>
                            <Badge
                              variant={
                                attempt.status === 'success'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {attempt.status === 'success'
                                ? 'Success'
                                : 'Failed'}
                            </Badge>
                          </div>
                          {attempt.failureReason && (
                            <div className="text-sm text-red-600">
                              {formatFailureReason(attempt.failureReason)}
                            </div>
                          )}
                          {attempt.consecutiveFailureCount &&
                            attempt.consecutiveFailureCount > 0 && (
                              <div className="text-sm text-orange-600">
                                Attempt {attempt.consecutiveFailureCount}
                              </div>
                            )}
                          {attempt.accountLocked && attempt.lockExpiresAt && (
                            <div className="text-sm text-red-600">
                              Locked until{' '}
                              {formatTimestamp(attempt.lockExpiresAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{attempt.ipAddress}</div>
                          {attempt.flags.includes('ip_blocked') && (
                            <div>
                              <Badge variant="destructive">Blocked</Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{attempt.location || 'Unknown'}</div>
                          {attempt.flags.includes('new_location') && (
                            <div>
                              <Badge variant="outline">New Location</Badge>
                            </div>
                          )}
                          {attempt.flags.includes('impossible_travel') && (
                            <div>
                              <Badge variant="destructive">
                                Impossible Travel
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {attempt.userAgent && !isExpanded && (
                          <div className="max-w-xs truncate">
                            {attempt.userAgent}
                          </div>
                        )}
                        {attempt.userAgent && isExpanded && (
                          <div className="font-mono text-sm break-all">
                            {attempt.userAgent}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {attempt.userAgent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRowExpansion(attempt.id)}
                          >
                            {isExpanded ? 'Collapse Details' : 'Expand Details'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
