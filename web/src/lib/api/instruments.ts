/**
 * Instrument API Functions
 *
 * Provides functions for instrument operations with permission checks.
 */

import { put } from '@/lib/api/client';

export interface UpdateInstrumentRequest {
  name: string;
}

export interface Instrument {
  id: string;
  name: string;
  type: string;
}

/**
 * Update an instrument.
 * Requires 'instrument.update' permission.
 */
export async function updateInstrument(
  id: string,
  data: UpdateInstrumentRequest,
): Promise<Instrument> {
  return put<Instrument>(`/v1/instruments/${id}`, data);
}
