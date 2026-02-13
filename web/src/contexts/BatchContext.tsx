'use client';

/**
 * BatchContext - Global batch state management
 *
 * Provides application-wide batch context with:
 * - Active batch ID persistence (localStorage)
 * - Current batch details
 * - Read-only status detection
 * - Batch switching capabilities
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  listReportBatches,
  getReportBatch,
  type ReportBatch,
} from '@/lib/api/batches';
import {
  getActiveBatchId,
  setActiveBatchId,
  clearActiveBatchId,
} from '@/lib/utils/storage';
import { useToast } from '@/contexts/ToastContext';

interface BatchContextValue {
  activeBatchId: number | null;
  currentBatch: ReportBatch | null;
  isReadOnly: boolean;
  isLoading: boolean;
  switchBatch: (id: number) => Promise<void>;
  clearBatch: () => void;
}

const BatchContext = createContext<BatchContextValue | undefined>(undefined);

interface BatchProviderProps {
  children: ReactNode;
}

/**
 * Determine if a batch is read-only based on its status.
 * - DataPreparation: editable (not locked)
 * - All other statuses: read-only (locked)
 */
function isReadOnlyStatus(status: string): boolean {
  return status !== 'DataPreparation';
}

export function BatchProvider({ children }: BatchProviderProps) {
  const [activeBatchId, setActiveBatchIdState] = useState<number | null>(null);
  const [currentBatch, setCurrentBatch] = useState<ReportBatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const isReadOnly = currentBatch
    ? isReadOnlyStatus(currentBatch.status)
    : false;

  // Initialize batch context on mount
  useEffect(() => {
    const initializeBatch = async () => {
      const storedId = getActiveBatchId();

      if (storedId !== null) {
        // Load batch from localStorage
        try {
          const batch = await getReportBatch(storedId);
          setActiveBatchIdState(storedId);
          setCurrentBatch(batch);
        } catch {
          // Handle error: clear invalid state
          setActiveBatchIdState(null);
          setCurrentBatch(null);
          clearActiveBatchId();
        }
      } else {
        // No localStorage value: auto-select most recent batch if available
        try {
          const batchList = await listReportBatches({ pageSize: 1 });
          if (batchList.items.length > 0) {
            const mostRecentBatch = batchList.items[0];
            setActiveBatchIdState(mostRecentBatch.id);
            setCurrentBatch(mostRecentBatch);
            setActiveBatchId(mostRecentBatch.id);
          }
        } catch {
          // No batches available or API error - remain in null state
          setActiveBatchIdState(null);
          setCurrentBatch(null);
        }
      }
    };

    initializeBatch();
  }, []);

  const switchBatch = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const batch = await getReportBatch(id);
      setActiveBatchIdState(id);
      setCurrentBatch(batch);
      setActiveBatchId(id);
      showToast({
        title: 'Batch switched successfully',
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Failed to switch batch',
        message: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearBatch = (): void => {
    setActiveBatchIdState(null);
    setCurrentBatch(null);
    clearActiveBatchId();
  };

  return (
    <BatchContext.Provider
      value={{
        activeBatchId,
        currentBatch,
        isReadOnly,
        isLoading,
        switchBatch,
        clearBatch,
      }}
    >
      {children}
    </BatchContext.Provider>
  );
}

/**
 * Hook to access batch context.
 * Must be used within a BatchProvider.
 */
export function useBatch(): BatchContextValue {
  const context = useContext(BatchContext);
  if (context === undefined) {
    throw new Error('useBatch must be used within a BatchProvider');
  }
  return context;
}
