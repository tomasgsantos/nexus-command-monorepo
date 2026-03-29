/**
 * Mock factory for supabase client — project mutation tests
 *
 * Provides a chainable query builder mock that simulates
 * supabase.from(...).insert/update/delete(...).eq(...).select(...).single()
 */

import { vi } from 'vitest';

export const mockSingle = vi.fn();
export const mockSelectAfterMutation = vi.fn();
export const mockInsert = vi.fn();
export const mockUpdate = vi.fn();
export const mockDeleteFn = vi.fn();
export const mockEq = vi.fn();
export const mockFrom = vi.fn();

export function resetMutationChain(): void {
  mockSingle.mockReturnValue({ data: null, error: null });
  mockSelectAfterMutation.mockReturnValue({ single: mockSingle });
  mockInsert.mockReturnValue({ select: mockSelectAfterMutation });
  mockEq.mockReturnValue({ select: mockSelectAfterMutation });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDeleteFn.mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDeleteFn,
  });
}

resetMutationChain();
