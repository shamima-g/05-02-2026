/**
 * Current Stage Panel Component
 *
 * Displays current workflow stage details, status, and available actions.
 */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getStageConfig, getNextStage } from '@/lib/constants/workflow-stages';
import {
  formatDateTime,
  formatRelativeTime,
  formatReportDate,
} from '@/lib/utils/date-formatting';
import { ConfirmDataButton } from '@/components/batches/ConfirmDataButton';

interface CurrentStagePanelProps {
  batchId: number;
  currentStage: string;
  lastUpdated: string;
  isLocked?: boolean;
  canConfirm: boolean;
  lastRejection?: { level: string; reason: string; date: string } | null;
  reportDate: string;
}

export function CurrentStagePanel({
  batchId,
  currentStage,
  lastUpdated,
  canConfirm,
  lastRejection,
  reportDate,
}: CurrentStagePanelProps) {
  const stageConfig = getStageConfig(currentStage);
  const nextStage = getNextStage(currentStage);

  const getStatusMessage = () => {
    if (currentStage === 'DataPreparation') {
      return `In preparation for ${formatRelativeTime(lastUpdated)} (since ${formatDateTime(lastUpdated)})`;
    }

    const approverMap: Record<string, string> = {
      Level1Pending: 'Operations',
      Level2Pending: 'PM',
      Level3Pending: 'Executive',
    };

    const approver = approverMap[currentStage] || 'approval';
    return `Awaiting ${approver} approval since ${formatDateTime(lastUpdated)}`;
  };

  const getNextStageMessage = () => {
    if (!nextStage) {
      return null;
    }

    const nextConfig = getStageConfig(nextStage);
    const roleMap: Record<string, string> = {
      Level1Pending: '(Operations)',
      Level2Pending: '(Portfolio Manager)',
      Level3Pending: '(Executive)',
      Approved: '(Published)',
    };

    const role = roleMap[nextStage] || '';
    return `Next: ${nextConfig.label} ${role}`.trim();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Workflow Stage</CardTitle>
        <CardDescription>{stageConfig.label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {stageConfig.description}
        </p>

        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-semibold">Status:</span> {getStatusMessage()}
          </p>
          {nextStage && <p className="text-sm">{getNextStageMessage()}</p>}
        </div>

        {lastRejection && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Returned to Data Preparation</AlertTitle>
            <AlertDescription>{lastRejection.reason}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {canConfirm && (
            <ConfirmDataButton
              batchId={batchId}
              batchName={formatReportDate(reportDate)}
            />
          )}
          <Button variant="outline" asChild>
            <Link href={`/batches/${batchId}`}>View Batch Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
