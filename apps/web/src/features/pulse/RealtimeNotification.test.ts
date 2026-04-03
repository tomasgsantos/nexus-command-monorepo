/**
 * Tests for RealtimeNotification component
 * Covers: null render, message display, auto-dismiss timer, single dismiss per notification
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { createElement } from 'react';

/* ── Mocks ─────────────────────────────────────────────────── */

import { RealtimeNotification } from './components/RealtimeNotification';

/* ── Helpers ───────────────────────────────────────────────── */

function makeNotification(overrides?: Partial<{ message: string; key: number }>) {
  return { message: 'Project data updated', key: 1, ...overrides };
}

function renderNotification(
  notification: { message: string; key: number } | null,
  onDismiss = vi.fn(),
) {
  return render(
    createElement(RealtimeNotification, { notification, onDismiss }),
  );
}

/* ── Tests ─────────────────────────────────────────────────── */

describe('RealtimeNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('does not render anything when notification is null', () => {
    renderNotification(null);

    expect(screen.queryByText('Project data updated')).toBeNull();
  });

  it('renders the notification message when notification is set', () => {
    const notification = makeNotification({ message: 'Project data updated' });
    renderNotification(notification);

    expect(screen.getByText('Project data updated')).toBeDefined();
  });

  it('calls onDismiss after 3000ms', () => {
    const onDismiss = vi.fn();
    renderNotification(makeNotification(), onDismiss);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not call onDismiss before 3000ms have elapsed', () => {
    const onDismiss = vi.fn();
    renderNotification(makeNotification(), onDismiss);

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('calls onDismiss only once per notification (not on every re-render)', () => {
    const onDismiss = vi.fn();
    const notification = makeNotification();
    const { rerender } = renderNotification(notification, onDismiss);

    // Re-render with same notification — should not schedule a second timer
    rerender(createElement(RealtimeNotification, { notification, onDismiss }));
    rerender(createElement(RealtimeNotification, { notification, onDismiss }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
