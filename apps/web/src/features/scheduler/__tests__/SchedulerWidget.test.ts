/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import type { Event } from '@nexus/api';

vi.mock('../components/SchedulerWidget.css', () => ({}));
vi.mock('@nexus/ui', () => ({
  Button: ({ children, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode; variant?: string }) =>
    createElement('button', { onClick, ...rest }, children),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockUseScheduler = vi.fn();
vi.mock('../hooks/use-scheduler', () => ({
  useScheduler: () => mockUseScheduler(),
}));

import { SchedulerWidget } from '../components/SchedulerWidget';
import { AppRoute } from '../../../constants/routes';

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'evt-1',
    title: 'Team Standup',
    start_at: new Date(Date.now() + 3_600_000).toISOString(),
    end_at: new Date(Date.now() + 7_200_000).toISOString(),
    project_id: null,
    caldav_uid: null,
    owner_id: 'user-1',
    expires_at: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseScheduler.mockReturnValue({ events: [] });
});

afterEach(cleanup);

describe('SchedulerWidget', () => {
  it('shows empty state when there are no upcoming events', () => {
    render(createElement(SchedulerWidget, {}));
    expect(screen.getByText('No upcoming events')).toBeDefined();
  });

  it('renders upcoming event titles', () => {
    mockUseScheduler.mockReturnValue({ events: [makeEvent()] });
    render(createElement(SchedulerWidget, {}));
    expect(screen.getByText('Team Standup')).toBeDefined();
  });

  it('does not show events that are in the past', () => {
    const past = makeEvent({
      start_at: new Date(Date.now() - 7_200_000).toISOString(),
      end_at: new Date(Date.now() - 3_600_000).toISOString(),
    });
    mockUseScheduler.mockReturnValue({ events: [past] });
    render(createElement(SchedulerWidget, {}));
    expect(screen.queryByText('Team Standup')).toBeNull();
    expect(screen.getByText('No upcoming events')).toBeDefined();
  });

  it('shows at most 4 upcoming events', () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      makeEvent({ id: `evt-${i}`, title: `Event ${i}`, start_at: new Date(Date.now() + (i + 1) * 3_600_000).toISOString() })
    );
    mockUseScheduler.mockReturnValue({ events });
    render(createElement(SchedulerWidget, {}));
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('navigates to the scheduler route when "View all" is clicked', () => {
    render(createElement(SchedulerWidget, {}));
    fireEvent.click(screen.getByText('View all'));
    expect(mockNavigate).toHaveBeenCalledWith(AppRoute.Scheduler);
  });

  it('renders the "Upcoming" heading', () => {
    render(createElement(SchedulerWidget, {}));
    expect(screen.getByText('Upcoming')).toBeDefined();
  });
});
