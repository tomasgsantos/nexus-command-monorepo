/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useIsMobile } from '../use-mobile';

function makeMockMq(matches: boolean) {
  return {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue(makeMockMq(false)),
  });
});

describe('useIsMobile', () => {
  it('returns false when viewport is wider than 480px', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when viewport is 480px or narrower', () => {
    window.matchMedia = vi.fn().mockReturnValue(makeMockMq(true));
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('registers a change listener on mount', () => {
    const mq = makeMockMq(false);
    window.matchMedia = vi.fn().mockReturnValue(mq);
    renderHook(() => useIsMobile());
    expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes the change listener on unmount', () => {
    const mq = makeMockMq(false);
    window.matchMedia = vi.fn().mockReturnValue(mq);
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates when the media query fires a change event', () => {
    let capturedHandler: ((e: MediaQueryListEvent) => void) | null = null;
    const mq = {
      matches: false,
      addEventListener: vi.fn((_: string, fn: (e: MediaQueryListEvent) => void) => {
        capturedHandler = fn;
      }),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mq);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      capturedHandler!({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });
});
