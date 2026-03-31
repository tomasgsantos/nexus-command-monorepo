/**
 * Tests for useSidebar hook
 * Covers: initial collapsed state, toggle behaviour (expand/collapse)
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useSidebar } from './use-sidebar';

/* ── Tests ─────────────────────────────────────────────────── */

describe('useSidebar', () => {
  it('collapsed starts as false', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.collapsed).toBe(false);
  });

  it('toggle sets collapsed to true', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(true);
  });

  it('calling toggle again sets collapsed back to false', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.toggle();
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(false);
  });
});
