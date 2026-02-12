/**
 * Batch API Functions
 *
 * Provides functions for batch operations with permission checks.
 */

import { get, post } from '@/lib/api/client';

export interface ReportBatch {
  id: number;
  reportBatchType: string;
  reportDate: string;
  workflowInstanceId: string | null;
  status: string;
  createdAt: string;
  createdBy: string;
  lastRejection: {
    date: string;
    level: string;
    reason: string;
  } | null;
  fileSummary: {
    received: number;
    total: number;
  };
  validationSummary: {
    errors: number;
    warnings: number;
  };
  calculationStatus: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ReportBatchList {
  items: ReportBatch[];
  meta: PaginationMeta;
}

export interface CreateReportBatchRequest {
  reportBatchType: string;
  reportDate: string;
}

export interface ListReportBatchesParams {
  page?: number;
  pageSize?: number;
  status?: string;
  sort?: string;
}

/**
 * List all report batches with optional filtering and pagination.
 */
export async function listReportBatches(
  params?: ListReportBatchesParams,
): Promise<ReportBatchList> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.sort) {
    queryParams.append('sort', params.sort);
  }

  const queryString = queryParams.toString();
  const url = queryString
    ? `/report-batches?${queryString}`
    : '/report-batches';

  return get<ReportBatchList>(url);
}

/**
 * Create a new report batch.
 * Requires 'batch.create' permission.
 */
export async function createReportBatch(
  data: CreateReportBatchRequest,
): Promise<ReportBatch> {
  return post<ReportBatch>('/report-batches', data);
}

/**
 * Legacy batch creation interface (Epic 1 compatibility).
 */
export interface CreateBatchRequest {
  name: string;
  type: string;
}

export interface Batch {
  id: string;
  status: string;
}

/**
 * Create a new batch (legacy endpoint).
 * Requires 'batch.create' permission.
 */
export async function createBatch(data: CreateBatchRequest): Promise<Batch> {
  return post<Batch>('/v1/batches', data);
}
