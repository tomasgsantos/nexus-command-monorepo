/**
 * Unit tests — useRealtimeFeed hook
 * Covers: initial fetch, realtime updates, error handling, cleanup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import {
  setupNexusApiMock,
  mockFetchProjects,
  mockSubscribeToProjects,
} from './__mocks__/nexus-api';

setupNexusApiMock();

import type { ProjectWithOwner } from '@nexus/api';
import { useRealtimeFeed } from './hooks/use-realtime-feed';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const projectA: ProjectWithOwner = {
  id: 'p-1',
  title: 'Alpha',
  health_status: 'on_track',
  lat: 40.71,
  lng: -74.0,
  owner_id: 'u-1',
  owner_display_name: 'Sarah Chen',
  city: 'New York',
  country: 'United States',
};

const projectB: ProjectWithOwner = {
  id: 'p-2',
  title: 'Beta',
  health_status: 'at_risk',
  lat: null,
  lng: null,
  owner_id: 'u-2',
  owner_display_name: 'Marcus Okafor',
  city: 'London',
  country: 'United Kingdom',
};

const projectAUpdated: ProjectWithOwner = {
  ...projectA,
  health_status: 'failing',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Captures the realtime callback passed to subscribeToProjects. */
function captureRealtimeCallback() {
  const call = mockSubscribeToProjects.mock.calls[0];
  return call?.[0] as ((project: ProjectWithOwner) => void) | undefined;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useRealtimeFeed', () => {
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribeToProjects.mockReturnValue({ unsubscribe: mockUnsubscribe });
  });

  it('fetches projects on mount and sets them in state', async () => {
    mockFetchProjects.mockResolvedValue([projectA, projectB]);

    const { result } = renderHook(() => useRealtimeFeed());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await act(async () => {
      // let the fetch resolve
    });

    expect(result.current.projects).toEqual([projectA, projectB]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error state when fetchProjects rejects', async () => {
    mockFetchProjects.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useRealtimeFeed());

    await act(async () => {});

    expect(result.current.error).toBe('Network failure');
    expect(result.current.loading).toBe(false);
    expect(result.current.projects).toEqual([]);
  });

  it('uses fallback error message for non-Error rejections', async () => {
    mockFetchProjects.mockRejectedValue('opaque');

    const { result } = renderHook(() => useRealtimeFeed());

    await act(async () => {});

    expect(result.current.error).toBe('Failed to load projects');
  });

  it('subscribes to realtime updates on mount', async () => {
    mockFetchProjects.mockResolvedValue([]);

    renderHook(() => useRealtimeFeed());

    // Flush the pending fetch to avoid act() warnings
    await act(async () => {});

    expect(mockSubscribeToProjects).toHaveBeenCalledOnce();
    expect(typeof mockSubscribeToProjects.mock.calls[0][0]).toBe('function');
  });

  it('updates an existing project when a realtime event arrives', async () => {
    mockFetchProjects.mockResolvedValue([projectA, projectB]);

    const { result } = renderHook(() => useRealtimeFeed());

    await act(async () => {});

    const realtimeCallback = captureRealtimeCallback();
    expect(realtimeCallback).toBeDefined();

    act(() => {
      realtimeCallback!(projectAUpdated);
    });

    expect(result.current.projects[0]).toEqual(projectAUpdated);
    // projectB should be unchanged
    expect(result.current.projects[1]).toEqual(projectB);
  });

  it('appends a new project when a realtime INSERT arrives for an unknown id', async () => {
    mockFetchProjects.mockResolvedValue([projectA]);

    const { result } = renderHook(() => useRealtimeFeed());

    await act(async () => {});

    const realtimeCallback = captureRealtimeCallback();

    // Realtime events are raw DB rows — no profile join, so owner_display_name is absent.
    const { owner_display_name: _, ...rawProjectB } = projectB;
    act(() => {
      realtimeCallback!(rawProjectB as ProjectWithOwner);
    });

    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects[1]).toEqual({ ...rawProjectB, owner_display_name: 'Unknown' });
  });

  it('unsubscribes from the realtime channel on unmount', async () => {
    mockFetchProjects.mockResolvedValue([]);

    const { unmount } = renderHook(() => useRealtimeFeed());

    await act(async () => {});

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it('does not update state after unmount (cancelled flag)', async () => {
    let resolveFetch!: (v: ProjectWithOwner[]) => void;
    mockFetchProjects.mockImplementation(
      () => new Promise((res) => { resolveFetch = res; }),
    );

    const { result, unmount } = renderHook(() => useRealtimeFeed());

    // Unmount before the fetch resolves
    unmount();

    await act(async () => {
      resolveFetch([projectA]);
    });

    // State should remain at initial values since component unmounted
    expect(result.current.projects).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});
