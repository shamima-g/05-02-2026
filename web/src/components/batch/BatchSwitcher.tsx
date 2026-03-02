'use client';

/**
 * BatchSwitcher - Global batch selection dropdown for header
 *
 * Shows active batch name, status, and lock indicator icon.
 * Provides quick-switch dropdown with recent batches.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Lock } from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { listReportBatches, type ReportBatch } from '@/lib/api/batches';
import { formatReportDate } from '@/lib/utils/date-formatting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Map status codes to display names
 */
function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    DataPreparation: 'Data Preparation',
    Level2Pending: 'Level 2 Pending',
    Level3Pending: 'Level 3 Pending',
    Approved: 'Approved',
  };
  return statusMap[status] || status;
}

/**
 * Get badge variant based on status
 */
function getStatusBadgeVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Approved':
      return 'default';
    case 'Level3Pending':
    case 'Level2Pending':
      return 'secondary';
    case 'DataPreparation':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function BatchSwitcher() {
  const { currentBatch, isReadOnly, isLoading, switchBatch } = useBatch();
  const [recentBatches, setRecentBatches] = useState<ReportBatch[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load recent batches when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      const loadRecentBatches = async () => {
        try {
          const result = await listReportBatches({ pageSize: 5 });
          setRecentBatches(result.items);
        } catch {
          console.error('Failed to load recent batches');
        }
      };
      loadRecentBatches();
    }
  }, [dropdownOpen]);

  const handleBatchSwitch = async (batchId: number) => {
    try {
      await switchBatch(batchId);
      setDropdownOpen(false);
    } catch {
      // Error already handled by context (shows toast)
    }
  };

  // Show loading spinner during batch switch
  if (isLoading) {
    return (
      <div className="flex items-center gap-2" role="status">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading batch...</span>
      </div>
    );
  }

  // No active batch state
  if (!currentBatch) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">No Active Batch</span>
        <Link
          href="/batches"
          className="text-sm text-primary hover:underline font-medium"
        >
          Select Batch
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 h-9"
          aria-haspopup="menu"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Active Batch:</span>
            <span className="text-sm">
              {formatReportDate(currentBatch.reportDate)}
            </span>
            <Badge variant={getStatusBadgeVariant(currentBatch.status)}>
              {getStatusDisplayName(currentBatch.status)}
            </Badge>
            {isReadOnly && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center" aria-label="Locked">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data locked for approval</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" role="menu">
        {recentBatches.map((batch) => (
          <DropdownMenuItem
            key={batch.id}
            onClick={() => handleBatchSwitch(batch.id)}
            className="flex items-center justify-between cursor-pointer"
            role="menuitem"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {formatReportDate(batch.reportDate)}
              </span>
              <span className="text-xs text-muted-foreground">
                {getStatusDisplayName(batch.status)}
              </span>
            </div>
            {batch.id === currentBatch.id && (
              <Badge variant="outline" className="text-xs">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        <Link
          href="/batches"
          role="link"
          className="flex items-center justify-center w-full text-sm font-medium text-primary cursor-pointer"
        >
          <DropdownMenuItem role="menuitem" className="w-full justify-center">
            View All Batches
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
