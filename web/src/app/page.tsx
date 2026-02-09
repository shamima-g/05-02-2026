'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  BarChart3,
  Clock,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/auth';
import {
  getPendingActions,
  getActiveBatches,
  getDashboardActivity,
  getDataQualitySummary,
} from '@/lib/api/dashboard';
import type {
  PendingAction,
  ActiveBatchesResponse,
  DashboardActivity,
  DataQualitySummary,
} from '@/lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/AppHeader';
import { WorkflowProgress } from '@/components/dashboard/WorkflowProgress';

const MONTHS = [
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

function formatReportDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatToday(): string {
  const date = new Date();
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return `${weekdays[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getActionLinkText(type: string): string {
  switch (type) {
    case 'approval':
      return 'Review';
    case 'master_data':
      return 'Fix';
    default:
      return 'View';
  }
}

function getPriorityVariant(
  priority: string,
): 'destructive' | 'default' | 'secondary' {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    default:
      return 'secondary';
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status.includes('Pending')) return 'default';
  if (status === 'DataPreparation') return 'secondary';
  return 'outline';
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [activeBatches, setActiveBatches] =
    useState<ActiveBatchesResponse | null>(null);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualitySummary | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const results = await Promise.allSettled([
          getPendingActions(),
          getActiveBatches(),
          getDashboardActivity(),
          getDataQualitySummary(),
        ]);

        if (results[0].status === 'fulfilled') {
          setPendingActions(results[0].value);
        } else {
          setErrors((prev) => ({
            ...prev,
            pendingActions: 'Error loading pending actions',
          }));
        }

        if (results[1].status === 'fulfilled') {
          setActiveBatches(results[1].value);
        } else {
          setErrors((prev) => ({
            ...prev,
            activeBatches: 'Error loading batches',
          }));
        }

        if (results[2].status === 'fulfilled') {
          setActivity(results[2].value);
        }

        if (results[3].status === 'fulfilled') {
          setDataQuality(results[3].value);
        }
      } catch {
        // User fetch failed
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(async () => {
      const results = await Promise.allSettled([
        getPendingActions(),
        getDashboardActivity(),
      ]);

      if (results[0].status === 'fulfilled') {
        setPendingActions(results[0].value);
      }
      if (results[1].status === 'fulfilled') {
        setActivity(results[1].value);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div role="progressbar" aria-label="Loading dashboard">
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="grid gap-6 md:grid-cols-2 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {user && <AppHeader displayName={user.displayName} roles={user.roles} />}
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          {user && (
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {user.displayName} - {user.roles.join(', ')}
            </h1>
          )}
          <p className="text-muted-foreground">{formatToday()}</p>
        </header>

        {Object.entries(errors).map(([key, message]) => (
          <div
            key={key}
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive"
          >
            {message}
          </div>
        ))}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Pending Actions
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingActions.length > 0 ? (
                <ul className="space-y-3">
                  {pendingActions.map((action) => (
                    <li
                      key={action.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Badge variant={getPriorityVariant(action.priority)}>
                          {action.priority}
                        </Badge>
                        <a
                          href={action.link}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(action.link);
                          }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {getActionLinkText(action.type)}
                          <ChevronRight className="h-3 w-3" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No pending actions</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Active Batches
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeBatches && activeBatches.items.length > 0 ? (
                <ul className="space-y-3">
                  {activeBatches.items.map((batch) => (
                    <li
                      key={batch.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {batch.reportBatchType} -{' '}
                          {formatReportDate(batch.reportDate)}
                        </p>
                        <Badge
                          variant={getStatusVariant(batch.status)}
                          className="mt-1"
                        >
                          {batch.status}
                        </Badge>
                        <WorkflowProgress status={batch.status} />
                      </div>
                      <a
                        href={`/batches/${batch.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/batches/${batch.id}`);
                        }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline ml-3"
                      >
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No active batches</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-info" />
                  Recent Activity
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <ul className="space-y-3">
                  {activity.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.user}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No recent activity</p>
              )}
              <a
                href="/audit"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/audit');
                }}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View Full Log
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          {dataQuality && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Data Quality Alerts
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <dt className="text-sm text-muted-foreground">
                      Missing Ratings
                    </dt>
                    <dd className="text-lg font-semibold">
                      {dataQuality.missingRatings}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <dt className="text-sm text-muted-foreground">
                      Missing Durations
                    </dt>
                    <dd className="text-lg font-semibold">
                      {dataQuality.missingDurations}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <dt className="text-sm text-muted-foreground">
                      Missing Betas
                    </dt>
                    <dd className="text-lg font-semibold">
                      {dataQuality.missingBetas}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <dt className="text-sm text-muted-foreground">
                      Missing Index Prices
                    </dt>
                    <dd className="text-lg font-semibold">
                      {dataQuality.missingIndexPrices}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
