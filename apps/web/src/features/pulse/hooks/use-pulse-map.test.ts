/**
 * Unit tests — usePulseMap hook
 * Covers: initial viewState matches defaults, onMove updates viewState
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePulseMap } from './use-pulse-map';
import type { ViewState } from 'react-map-gl';

/* ── Helpers ─────────────────────────────────────────────── */

function makeViewState(overrides?: Partial<ViewState>): ViewState {
  return {
    longitude: -98.5,
    latitude: 39.8,
    zoom: 3.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    ...overrides,
  };
}

/* ── Tests ───────────────────────────────────────────────── */

describe('usePulseMap', () => {
  it('returns default viewState on initial render', () => {
    const { result } = renderHook(() => usePulseMap());

    expect(result.current.viewState).toEqual(makeViewState());
  });

  it('updates viewState when onMove is called', () => {
    const { result } = renderHook(() => usePulseMap());

    const newViewState = makeViewState({ longitude: 10, latitude: 50, zoom: 6 });

    act(() => {
      result.current.onMove({ viewState: newViewState });
    });

    expect(result.current.viewState).toEqual(newViewState);
  });

  it('onMove is stable across re-renders (referential equality)', () => {
    const { result, rerender } = renderHook(() => usePulseMap());

    const firstOnMove = result.current.onMove;
    rerender();

    expect(result.current.onMove).toBe(firstOnMove);
  });

  it('successive onMove calls accumulate the latest viewState', () => {
    const { result } = renderHook(() => usePulseMap());

    act(() => {
      result.current.onMove({ viewState: makeViewState({ zoom: 5 }) });
    });
    act(() => {
      result.current.onMove({ viewState: makeViewState({ zoom: 8, longitude: 20 }) });
    });

    expect(result.current.viewState.zoom).toBe(8);
    expect(result.current.viewState.longitude).toBe(20);
  });
});
