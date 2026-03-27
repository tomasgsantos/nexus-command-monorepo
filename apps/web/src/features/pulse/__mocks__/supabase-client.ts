/**
 * Mock factory for the supabase client — project query tests
 *
 * Provides a chainable query builder mock that simulates
 * supabase.from(...).select(...).order(...) and .eq(...).maybeSingle()
 */

import { vi } from 'vitest';

export const mockMaybeSingle = vi.fn();
export const mockOrder = vi.fn();
export const mockEq = vi.fn();
export const mockSelect = vi.fn();
export const mockFrom = vi.fn();

export function resetChain(): void {
  mockMaybeSingle.mockReturnValue({ data: null, error: null });
  mockOrder.mockReturnValue({ data: [], error: null });
  mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq });
  mockFrom.mockReturnValue({ select: mockSelect });
}

resetChain();
