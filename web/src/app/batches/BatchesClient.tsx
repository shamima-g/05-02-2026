/**
 * Batches Client Component
 *
 * Displays all report batches with filtering, sorting, and creation functionality.
 * This is the client-side component rendered by the server-side page wrapper.
 */
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowProgress } from '@/components/dashboard/WorkflowProgress';
import { getCurrentUser, AuthUser } from '@/lib/api/auth';
import {
  listReportBatches,
  createReportBatch,
  ReportBatch,
  PaginationMeta,
} from '@/lib/api/batches';
import { AlertCircle } from 'lucide-react';

type FilterOption = 'All' | 'Active' | 'Closed';
type SortOption = 'Latest First' | 'Oldest First';

function formatReportDate(dateString: string): string {
  const date = new Date(dateString);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function getNextMonthLastDay(currentBatches: ReportBatch[]): string {
  let year: number;
  let month: number;

  if (currentBatches.length === 0) {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  } else {
    const sortedByDate = [...currentBatches].sort(
      (a, b) =>
        new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime(),
    );
    const latestDate = new Date(sortedByDate[0].reportDate);
    year = latestDate.getFullYear();
    month = latestDate.getMonth() + 2;
  }

  if (month > 12) {
    month = 1;
    year += 1;
  }

  const lastDay = new Date(year, month, 0).getDate();

  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function getStatusBadgeColor(status: string): string {
  if (status === 'DataPreparation') return 'bg-blue-500';
  if (status.includes('Pending')) return 'bg-yellow-500';
  if (status === 'Approved') return 'bg-green-500';
  return 'bg-gray-500';
}

function formatStatusText(status: string, hasRejection: boolean): string {
  const formatted = status.replace(/([A-Z])/g, ' $1').trim();
  if (hasRejection && status === 'DataPreparation') {
    return `${formatted} (Correcting after rejection)`;
  }
  return formatted;
}

interface BatchCardProps {
  batch: ReportBatch;
}

function BatchCard({ batch }: BatchCardProps) {
  const hasRejection = batch.lastRejection !== null;
  const statusText = formatStatusText(batch.status, hasRejection);

  return (
    <article>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {formatReportDate(batch.reportDate)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Created by {batch.createdBy}
              </p>
            </div>
            <Badge className={getStatusBadgeColor(batch.status)}>
              {statusText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasRejection && batch.lastRejection && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-sm"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    Rejected at {batch.lastRejection.level}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {batch.lastRejection.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          <WorkflowProgress status={batch.status} />

          <div className="flex items-center justify-between text-sm pt-2">
            <span className="text-muted-foreground">
              {batch.fileSummary.received} of {batch.fileSummary.total} files
              received
            </span>
            {batch.validationSummary.warnings > 0 && (
              <span className="text-yellow-600">
                {batch.validationSummary.warnings} warnings
              </span>
            )}
            {batch.validationSummary.errors > 0 && (
              <span className="text-destructive">
                {batch.validationSummary.errors} errors
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}

export default function BatchesClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [batches, setBatches] = useState<ReportBatch[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [filter, setFilter] = useState<FilterOption>('All');
  const [sort, setSort] = useState<SortOption>('Latest First');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const result = await listReportBatches();
        setBatches(result.items);
        setMeta(result.meta);
      } catch {
        setError('Error loading batches');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredAndSortedBatches = (): ReportBatch[] => {
    let result = [...batches];

    if (filter === 'Active') {
      result = result.filter((b) => b.status !== 'Approved');
    } else if (filter === 'Closed') {
      result = result.filter((b) => b.status === 'Approved');
    }

    if (sort === 'Latest First') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return result;
  };

  const canCreateBatch = user?.permissions.includes('batch.create') ?? false;

  const isCreateButtonDisabled = (): boolean => {
    if (batches.length === 0) return false;
    const sortedByCreated = [...batches].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sortedByCreated[0]?.status !== 'Approved';
  };

  const handleCreateBatch = async () => {
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const nextMonthDate = getNextMonthLastDay(batches);
      const newBatch = await createReportBatch({
        reportBatchType: 'Monthly',
        reportDate: nextMonthDate,
      });

      setBatches([newBatch, ...batches]);

      setSuccessMessage(
        `Batch ${formatReportDate(newBatch.reportDate)} created successfully`,
      );
    } catch {
      setError('Failed to create batch');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadMore = async () => {
    if (!meta) return;

    try {
      const result = await listReportBatches({ page: meta.page + 1 });
      setBatches([...batches, ...result.items]);
      setMeta(result.meta);
    } catch {
      setError('Error loading more batches');
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div role="progressbar">Loading...</div>
      </main>
    );
  }

  const displayedBatches = filteredAndSortedBatches();
  const showLoadMore = meta && meta.totalPages > meta.page;
  const buttonDisabled = isCreateButtonDisabled();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Batch Management</h1>
          {canCreateBatch && (
            <div
              className="relative inline-block"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Button
                onClick={handleCreateBatch}
                disabled={buttonDisabled || isCreating}
              >
                Create New Batch
              </Button>
              {buttonDisabled && showTooltip && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md whitespace-nowrap">
                  Previous batch must reach Approved status first
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md bg-destructive/10 p-4 text-destructive"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 text-green-800">
            {successMessage}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="filter-select" className="sr-only">
              Filter
            </label>
            <select
              id="filter-select"
              aria-label="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterOption)}
              className="rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-select" className="sr-only">
              Sort
            </label>
            <select
              id="sort-select"
              aria-label="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="Latest First">Latest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {displayedBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>

        {showLoadMore && (
          <div className="flex justify-center pt-4">
            <Button onClick={handleLoadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
