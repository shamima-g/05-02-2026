'use client';

/**
 * Confirm Data Button Component
 *
 * Displays a button that validates batch data and confirms readiness
 * for calculation. Shows validation warnings and errors before confirmation.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import {
  getBatchValidation,
  confirmBatch,
  type BatchValidationResult,
} from '@/lib/api/batches';
import { useBatch } from '@/contexts/BatchContext';
import { useToast } from '@/contexts/ToastContext';

interface ConfirmDataButtonProps {
  batchId: number;
  batchName: string;
  onConfirmSuccess?: () => void;
}

interface ApiError extends Error {
  status?: number;
}

export function ConfirmDataButton({
  batchId,
  batchName,
  onConfirmSuccess,
}: ConfirmDataButtonProps) {
  const [isCheckingValidation, setIsCheckingValidation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validation, setValidation] = useState<BatchValidationResult | null>(
    null,
  );

  const { switchBatch } = useBatch();
  const { showToast } = useToast();

  const handleCheckValidation = async () => {
    setIsCheckingValidation(true);
    try {
      const result = await getBatchValidation(batchId);
      setValidation(result);
      setDialogOpen(true);
    } catch (error) {
      showToast({
        title: 'Failed to check validation status',
        message: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    } finally {
      setIsCheckingValidation(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await confirmBatch(batchId);
      showToast({
        title: 'Data confirmed',
        message: 'Batch is now locked and ready for calculations',
        variant: 'success',
      });
      setDialogOpen(false);
      await switchBatch(batchId);
      onConfirmSuccess?.();
    } catch (error) {
      const apiError = error as ApiError;
      let errorMessage = 'Failed to confirm batch';

      if (apiError.status === 403) {
        errorMessage = 'You do not have permission to confirm this batch';
      } else if (apiError.status === 409) {
        errorMessage = 'This batch has already been confirmed';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      showToast({
        title: 'Failed to confirm batch',
        message: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReviewIssues = () => {
    setDialogOpen(false);
  };

  const filesMissing =
    validation &&
    validation.fileCompleteness.expected > validation.fileCompleteness.received;
  const missingCount = filesMissing
    ? validation.fileCompleteness.expected -
      validation.fileCompleteness.received
    : 0;

  const validationErrors = validation && validation.fileCompleteness.failed > 0;
  const errorCount = validation ? validation.fileCompleteness.failed : 0;

  const hasReferenceDataIssues =
    validation &&
    (validation.referenceDataCompleteness.instrumentsMissingRatings > 0 ||
      validation.referenceDataCompleteness.instrumentsMissingDurations > 0 ||
      validation.referenceDataCompleteness.instrumentsMissingBetas > 0 ||
      validation.referenceDataCompleteness.missingIndexPrices > 0);

  const hasIssues = filesMissing || validationErrors;

  return (
    <>
      <Button onClick={handleCheckValidation} disabled={isCheckingValidation}>
        {isCheckingValidation ? 'Checking...' : 'Confirm Data Ready'}
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Data Ready for {batchName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will lock all data entry and initiate calculations. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {filesMissing && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {missingCount} required files are missing. You can proceed, but
                reports may be incomplete.
              </AlertDescription>
            </Alert>
          )}

          {validationErrors && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorCount} validation errors exist. These must be resolved
                before calculations can succeed.
              </AlertDescription>
            </Alert>
          )}

          {hasReferenceDataIssues && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Some validation warnings exist in reference data. This may
                affect report accuracy.
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {hasIssues ? (
              <>
                <Button variant="outline" onClick={handleReviewIssues}>
                  Review Issues
                </Button>
                <Button onClick={handleConfirm} disabled={isConfirming}>
                  {isConfirming ? 'Confirming...' : 'Proceed Anyway'}
                </Button>
              </>
            ) : (
              <Button onClick={handleConfirm} disabled={isConfirming}>
                {isConfirming ? 'Confirming...' : 'Confirm'}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
