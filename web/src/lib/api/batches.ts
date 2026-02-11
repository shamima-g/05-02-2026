/**
 * Batch API Functions
 *
 * Provides functions for batch operations with permission checks.
 */

import { post } from '@/lib/api/client';

export interface CreateBatchRequest {
  name: string;
  type: string;
}

export interface Batch {
  id: string;
  status: string;
}

/**
 * Create a new batch.
 * Requires 'batch.create' permission.
 */
export async function createBatch(data: CreateBatchRequest): Promise<Batch> {
  return post<Batch>('/v1/batches', data);
}
