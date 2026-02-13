/**
 * Workflow Client Component
 *
 * Client-side component that fetches and displays batch workflow status.
 * Includes polling for real-time updates.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { WorkflowProgressBar } from '@/components/workflow/WorkflowProgressBar';
import { CurrentStagePanel } from '@/components/workflow/CurrentStagePanel';
import {
  getReportBatch,
  getBatchWorkflowStatus,
  type ReportBatch,
  type BatchWorkflowStatus,
} from '@/lib/api/batches';
import { formatReportDate } from '@/lib/utils/date-formatting';
import { usePolling } from '@/hooks/usePolling';

interface WorkflowClientProps {
  batchId: number;
}

export default function WorkflowClient({ batchId }: WorkflowClientProps) {
  const [batch, setBatch] = useState<ReportBatch | null>(null);
  const [workflowStatus, setWorkflowStatus] =
    useState<BatchWorkflowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBatchAndStatus = useCallback(async () => {
    try {
      const [batchData, statusData] = await Promise.all([
        getReportBatch(batchId),
        getBatchWorkflowStatus(batchId),
      ]);
      setBatch(batchData);
      setWorkflowStatus(statusData);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      // Check if error message contains "not found" to show specific message
      const errorMessage =
        err instanceof Error && err.message.toLowerCase().includes('not found')
          ? err.message
          : 'Failed to load workflow status';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [batchId]);

  // Initial fetch on mount
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [batchData, statusData] = await Promise.all([
          getReportBatch(batchId),
          getBatchWorkflowStatus(batchId),
        ]);
        if (!cancelled) {
          setBatch(batchData);
          setWorkflowStatus(statusData);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error &&
            err.message.toLowerCase().includes('not found')
              ? err.message
              : 'Failed to load workflow status';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  // Poll for updates every 30 seconds
  usePolling(fetchBatchAndStatus, 30000, !isLoading && !error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" role="progressbar" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/batches">Return to Batch Management</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!batch || !workflowStatus) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">
        Workflow State - Batch: {formatReportDate(batch.reportDate)}
      </h1>

      <WorkflowProgressBar
        currentStage={workflowStatus.currentStage}
        lastRejection={batch.lastRejection}
      />

      <CurrentStagePanel
        batchId={batchId}
        currentStage={workflowStatus.currentStage}
        lastUpdated={workflowStatus.lastUpdated}
        canConfirm={workflowStatus.canConfirm}
        lastRejection={batch.lastRejection}
        reportDate={batch.reportDate}
      />
    </div>
  );
}
