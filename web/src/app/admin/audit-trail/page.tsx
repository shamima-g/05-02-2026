'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';
import { queryAuditTrail, exportAuditTrail } from '@/lib/api/audit';
import type {
  AuditTrailEntry,
  AuditTrailList,
  AuditFilters,
} from '@/lib/api/audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const ENTITY_TYPES = [
  'User',
  'Role',
  'ApprovalAuthority',
  'Batch',
  'Instrument',
  'Portfolio',
  'AssetManager',
  'IndexPrice',
  'Duration',
  'Beta',
  'CreditRating',
  'CustomHolding',
];

const CHANGE_TYPES = ['Created', 'Updated', 'Deleted'];

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatDateOnly(iso: string): string {
  return iso.split('T')[0];
}

export default function AuditTrailPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [auditData, setAuditData] = useState<AuditTrailList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState('');
  const [entityIdFilter, setEntityIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdown open states
  const [presetOpen, setPresetOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [entityTypeOpen, setEntityTypeOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);

  // User search within dropdown
  const [userSearch, setUserSearch] = useState('');

  // Detail modal
  const [selectedRecord, setSelectedRecord] = useState<AuditTrailEntry | null>(
    null,
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Refs for filters (to build filter objects synchronously)
  const filtersRef = useRef({
    fromDate: '',
    toDate: '',
    userFilter: '',
    entityTypeFilter: '',
    changeTypeFilter: '',
    entityIdFilter: '',
    currentPage: 1,
  });

  const fetchAuditData = useCallback(async (filters: AuditFilters) => {
    try {
      const data = await queryAuditTrail(filters);
      setAuditData(data);
      setError(null);
    } catch {
      setError('Failed to load audit trail');
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        const hasPermission =
          user.roles.includes('Administrator') ||
          user.permissions.includes('audit.view');
        if (!hasPermission) {
          setAccessDenied(true);
          router.replace('/');
          return;
        }

        await fetchAuditData({});
      } catch {
        setError('Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, fetchAuditData]);

  const buildCurrentFilters = (
    overrides: Partial<AuditFilters> = {},
  ): AuditFilters => {
    const f = filtersRef.current;
    const filters: AuditFilters = {};
    if (f.fromDate) filters.from = f.fromDate;
    if (f.toDate) filters.to = f.toDate;
    if (f.userFilter) filters.user = f.userFilter;
    if (f.entityTypeFilter) filters.entityType = f.entityTypeFilter;
    if (f.changeTypeFilter) filters.changeType = f.changeTypeFilter;
    if (f.entityIdFilter) filters.entityId = Number(f.entityIdFilter);
    if (f.currentPage > 1) filters.page = f.currentPage;
    return { ...filters, ...overrides };
  };

  const handleApplyFilters = async () => {
    filtersRef.current = {
      fromDate,
      toDate,
      userFilter,
      entityTypeFilter,
      changeTypeFilter,
      entityIdFilter,
      currentPage: 1,
    };
    setCurrentPage(1);
    const filters = buildCurrentFilters();
    await fetchAuditData(filters);
  };

  const handleClearFilters = async () => {
    setFromDate('');
    setToDate('');
    setUserFilter('');
    setEntityTypeFilter('');
    setChangeTypeFilter('');
    setEntityIdFilter('');
    setCurrentPage(1);
    filtersRef.current = {
      fromDate: '',
      toDate: '',
      userFilter: '',
      entityTypeFilter: '',
      changeTypeFilter: '',
      entityIdFilter: '',
      currentPage: 1,
    };
    await fetchAuditData({});
  };

  const handleSelectPreset = async (days: number) => {
    const toD = new Date();
    const fromD = new Date();
    fromD.setDate(fromD.getDate() - days);

    const fromStr = fromD.toISOString().split('T')[0];
    const toStr = toD.toISOString().split('T')[0];

    setFromDate(fromStr);
    setToDate(toStr);
    setPresetOpen(false);

    filtersRef.current.fromDate = fromStr;
    filtersRef.current.toDate = toStr;
    const filters = buildCurrentFilters({ from: fromStr, to: toStr });
    await fetchAuditData(filters);
  };

  const handleSelectUser = async (username: string) => {
    setUserFilter(username);
    setUserDropdownOpen(false);
    setUserSearch('');

    filtersRef.current.userFilter = username;
    const filters = buildCurrentFilters({ user: username });
    await fetchAuditData(filters);
  };

  const handleSelectEntityType = async (type: string) => {
    setEntityTypeFilter(type);
    setEntityTypeOpen(false);

    filtersRef.current.entityTypeFilter = type;
    const filters = buildCurrentFilters({ entityType: type });
    await fetchAuditData(filters);
  };

  const handleSelectAction = async (action: string) => {
    setChangeTypeFilter(action);
    setActionOpen(false);

    filtersRef.current.changeTypeFilter = action;
    const filters = buildCurrentFilters({ changeType: action });
    await fetchAuditData(filters);
  };

  const handleRowClick = (record: AuditTrailEntry) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setOperationError(null);
    try {
      const blob = await exportAuditTrail({
        entityType: entityTypeFilter || '',
        from: fromDate,
        to: toDate,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-trail.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setOperationError('Failed to export audit trail. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    filtersRef.current.currentPage = nextPage;
    const filters = buildCurrentFilters({ page: nextPage });
    await fetchAuditData(filters);
  };

  const canExport =
    currentUser?.permissions.includes('audit.export') ||
    currentUser?.roles.includes('Administrator') ||
    false;

  // Get unique users from audit data for filter dropdown
  const uniqueUsers = auditData
    ? [...new Set(auditData.items.map((item) => item.changedBy))]
    : [];

  const filteredUsers = userSearch
    ? uniqueUsers.filter((u) =>
        u.toLowerCase().includes(userSearch.toLowerCase()),
      )
    : uniqueUsers;

  // User activity summary (show when filtered by user)
  const showUserSummary =
    !!userFilter && auditData && auditData.items.length > 0;
  const userSummary = showUserSummary
    ? (() => {
        const items = auditData.items;
        const actionCounts: Record<string, number> = {};
        for (const item of items) {
          actionCounts[item.changeType] =
            (actionCounts[item.changeType] || 0) + 1;
        }
        const mostCommon = Object.entries(actionCounts).sort(
          (a, b) => b[1] - a[1],
        )[0];
        return {
          totalActions: auditData.meta.totalItems,
          mostCommonAction: mostCommon ? mostCommon[0] : 'N/A',
        };
      })()
    : null;

  // Rendering

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div role="progressbar" aria-label="Loading audit trail">
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
          <p className="text-muted-foreground">
            Audit view permission required.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail Viewer</h1>
        </div>
        {canExport && (
          <Button onClick={handleExport} disabled={isExporting}>
            Export Audit Trail
          </Button>
        )}
      </div>

      {/* Operation Error */}
      {operationError && (
        <div role="alert" className="mb-4 p-3 bg-destructive/10 rounded">
          <p className="text-sm text-destructive">{operationError}</p>
        </div>
      )}

      {/* Load Error */}
      {error && (
        <div role="alert" className="mb-4 p-3 bg-destructive/10 rounded">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap items-end">
          {/* From Date */}
          <div>
            <Label htmlFor="from-date">From Date</Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div>
            <Label htmlFor="to-date">To Date</Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Date Range Preset */}
          <div className="relative">
            <Label id="date-preset-label" className="block">
              Date Range Preset
            </Label>
            <button
              type="button"
              role="combobox"
              aria-label="Date Range Preset"
              aria-expanded={presetOpen}
              aria-haspopup="listbox"
              aria-controls={presetOpen ? 'date-preset-listbox' : undefined}
              className="flex h-9 w-48 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              onClick={() => setPresetOpen(!presetOpen)}
            >
              Select preset
            </button>
            {presetOpen && (
              <div
                id="date-preset-listbox"
                role="listbox"
                aria-label="Date presets"
                className="absolute z-50 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md"
              >
                {DATE_PRESETS.map((preset) => (
                  <div
                    key={preset.days}
                    role="option"
                    aria-selected={false}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleSelectPreset(preset.days)}
                  >
                    {preset.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Filter */}
          <div className="relative">
            <Label id="user-filter-label" className="block">
              Filter by User
            </Label>
            <button
              type="button"
              role="combobox"
              aria-label="Filter by User"
              aria-expanded={userDropdownOpen}
              aria-haspopup="listbox"
              aria-controls={
                userDropdownOpen ? 'user-filter-listbox' : undefined
              }
              className="flex h-9 w-48 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              {userFilter || 'All Users'}
            </button>
            {userDropdownOpen && (
              <div
                id="user-filter-listbox"
                role="listbox"
                aria-label="Users"
                className="absolute z-50 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md"
              >
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full mb-1 rounded-sm border border-input px-2 py-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {filteredUsers.map((u) => (
                  <div
                    key={u}
                    role="option"
                    aria-selected={userFilter === u}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleSelectUser(u)}
                  >
                    {u}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entity Type Filter */}
          <div className="relative">
            <Label id="entity-type-label" className="block">
              Filter by Entity Type
            </Label>
            <button
              type="button"
              role="combobox"
              aria-label="Filter by Entity Type"
              aria-expanded={entityTypeOpen}
              aria-haspopup="listbox"
              aria-controls={entityTypeOpen ? 'entity-type-listbox' : undefined}
              className="flex h-9 w-48 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              onClick={() => setEntityTypeOpen(!entityTypeOpen)}
            >
              {entityTypeFilter || 'All Types'}
            </button>
            {entityTypeOpen && (
              <div
                id="entity-type-listbox"
                role="listbox"
                aria-label="Entity types"
                className="absolute z-50 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-auto"
              >
                {ENTITY_TYPES.map((type) => (
                  <div
                    key={type}
                    role="option"
                    aria-selected={entityTypeFilter === type}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleSelectEntityType(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Filter */}
          <div className="relative">
            <Label id="action-filter-label" className="block">
              Filter by Action
            </Label>
            <button
              type="button"
              role="combobox"
              aria-label="Filter by Action"
              aria-expanded={actionOpen}
              aria-haspopup="listbox"
              aria-controls={actionOpen ? 'action-filter-listbox' : undefined}
              className="flex h-9 w-48 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              onClick={() => setActionOpen(!actionOpen)}
            >
              {changeTypeFilter || 'All Actions'}
            </button>
            {actionOpen && (
              <div
                id="action-filter-listbox"
                role="listbox"
                aria-label="Actions"
                className="absolute z-50 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md"
              >
                {CHANGE_TYPES.map((type) => (
                  <div
                    key={type}
                    role="option"
                    aria-selected={changeTypeFilter === type}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleSelectAction(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entity ID */}
          <div>
            <Label htmlFor="entity-id">Entity ID</Label>
            <Input
              id="entity-id"
              value={entityIdFilter}
              onChange={(e) => setEntityIdFilter(e.target.value)}
              placeholder="Enter ID"
              className="w-32"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* User Activity Summary */}
      {userSummary && (
        <div className="mb-6 p-4 bg-muted/50 rounded border">
          <h3 className="text-sm font-semibold mb-2">User Activity Summary</h3>
          <p className="text-sm">Total Actions: {userSummary.totalActions}</p>
          <p className="text-sm">
            Most Common Action: {userSummary.mostCommonAction}
          </p>
        </div>
      )}

      {/* Data Table */}
      {auditData && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditData.items.map((record, idx) => (
                <TableRow
                  key={`${record.entityType}-${record.entityId}-${record.changedAt}-${idx}`}
                  onClick={() => handleRowClick(record)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>{formatTimestamp(record.changedAt)}</TableCell>
                  <TableCell>{record.changedBy}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.changeType}</Badge>
                  </TableCell>
                  <TableCell>{record.entityType}</TableCell>
                  <TableCell>{record.entityId}</TableCell>
                  <TableCell>
                    {record.changes
                      .map(
                        (c) =>
                          `${c.field}: ${c.oldValue ?? 'N/A'} → ${c.newValue ?? 'N/A'}`,
                      )
                      .join(', ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              variant="outline"
              disabled={auditData.meta.page <= 1}
              onClick={() => {
                const prevPage = currentPage - 1;
                setCurrentPage(prevPage);
                filtersRef.current.currentPage = prevPage;
                fetchAuditData(buildCurrentFilters({ page: prevPage }));
              }}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground px-2">
              Page {auditData.meta.page} of {auditData.meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={auditData.meta.page >= auditData.meta.totalPages}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Audit Record Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Record Details</DialogTitle>
            <DialogDescription>
              View detailed information about this audit trail entry.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">User:</span>{' '}
                  {selectedRecord.changedBy}
                </div>
                <div>
                  <span className="font-medium">Action:</span>{' '}
                  {selectedRecord.changeType}
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>{' '}
                  {formatDateOnly(selectedRecord.changedAt)}
                </div>
                <div>
                  <span className="font-medium">Entity Type:</span>{' '}
                  {selectedRecord.entityType}
                </div>
                <div>
                  <span className="font-medium">Entity ID:</span>{' '}
                  {selectedRecord.entityId}
                </div>
              </div>

              {selectedRecord.changes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Changes</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Before</TableHead>
                        <TableHead>After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRecord.changes.map((change, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{change.field}</TableCell>
                          <TableCell>{change.oldValue ?? '-'}</TableCell>
                          <TableCell>{change.newValue ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
