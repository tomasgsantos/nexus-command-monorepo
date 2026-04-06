/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import type { Event } from '@nexus/api';

vi.mock('../components/AgendaPanel.css', () => ({}));
vi.mock('../utils/ics-formatter', () => ({ downloadIcs: vi.fn() }));
vi.mock('@nexus/ui', () => ({
  Button: ({ children, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    createElement('button', { onClick, ...rest }, children),
}));

import { AgendaPanel } from '../components/AgendaPanel';
import { downloadIcs } from '../utils/ics-formatter';

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'evt-1',
    title: 'Team Standup',
    start_at: '2026-04-06T09:00:00Z',
    end_at: '2026-04-06T09:30:00Z',
    project_id: null,
    caldav_uid: null,
    owner_id: 'user-1',
    expires_at: null,
    ...overrides,
  };
}

function makeProps(overrides?: Partial<Parameters<typeof AgendaPanel>[0]>) {
  return {
    selectedDate: new Date('2026-04-06T00:00:00Z'),
    events: [],
    onDateChange: vi.fn(),
    onNewEvent: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
}

afterEach(cleanup);

describe('AgendaPanel', () => {
  it('shows empty state when there are no events for the selected day', () => {
    render(createElement(AgendaPanel, makeProps()));
    expect(screen.getByText('No events scheduled')).toBeDefined();
  });

  it('renders an event card when there is a matching event for the selected day', () => {
    const event = makeEvent();
    render(createElement(AgendaPanel, makeProps({ events: [event] })));
    expect(screen.getByText('Team Standup')).toBeDefined();
  });

  it('does not render events from a different day', () => {
    const event = makeEvent({ start_at: '2026-04-07T09:00:00Z', end_at: '2026-04-07T09:30:00Z' });
    render(createElement(AgendaPanel, makeProps({ events: [event] })));
    expect(screen.queryByText('Team Standup')).toBeNull();
  });

  it('calls onNewEvent when the "+ New" button is clicked', () => {
    const onNewEvent = vi.fn();
    render(createElement(AgendaPanel, makeProps({ onNewEvent })));
    fireEvent.click(screen.getByText('+ New'));
    expect(onNewEvent).toHaveBeenCalledOnce();
  });

  it('calls onNewEvent when the "Schedule event" empty-state button is clicked', () => {
    const onNewEvent = vi.fn();
    render(createElement(AgendaPanel, makeProps({ onNewEvent })));
    fireEvent.click(screen.getByText('Schedule event'));
    expect(onNewEvent).toHaveBeenCalledOnce();
  });

  it('calls onEdit with the event when the edit button is clicked', () => {
    const event = makeEvent();
    const onEdit = vi.fn();
    render(createElement(AgendaPanel, makeProps({ events: [event], onEdit })));
    fireEvent.click(screen.getByTitle('Edit'));
    expect(onEdit).toHaveBeenCalledWith(event, expect.anything());
  });

  it('calls onDelete with the event id when the delete button is clicked', () => {
    const event = makeEvent();
    const onDelete = vi.fn();
    render(createElement(AgendaPanel, makeProps({ events: [event], onDelete })));
    fireEvent.click(screen.getByTitle('Delete'));
    expect(onDelete).toHaveBeenCalledWith('evt-1');
  });

  it('calls downloadIcs when the export button is clicked', () => {
    const event = makeEvent();
    render(createElement(AgendaPanel, makeProps({ events: [event] })));
    fireEvent.click(screen.getByTitle('Export .ics'));
    expect(downloadIcs).toHaveBeenCalledWith(event);
  });

  it('calls onDateChange with the previous day when the "Previous day" button is clicked', () => {
    const onDateChange = vi.fn();
    render(createElement(AgendaPanel, makeProps({ onDateChange })));
    fireEvent.click(screen.getByLabelText('Previous day'));
    expect(onDateChange).toHaveBeenCalledOnce();
    const called: Date = onDateChange.mock.calls[0][0];
    expect(called.getDate()).toBe(5);
  });

  it('calls onDateChange with the next day when the "Next day" button is clicked', () => {
    const onDateChange = vi.fn();
    render(createElement(AgendaPanel, makeProps({ onDateChange })));
    fireEvent.click(screen.getByLabelText('Next day'));
    expect(onDateChange).toHaveBeenCalledOnce();
    const called: Date = onDateChange.mock.calls[0][0];
    expect(called.getDate()).toBe(7);
  });

  it('shows "CalDAV synced" label for events with a caldav_uid', () => {
    const event = makeEvent({ caldav_uid: 'uid-abc' });
    render(createElement(AgendaPanel, makeProps({ events: [event] })));
    expect(screen.getByText('CalDAV synced')).toBeDefined();
  });

  it('does not show "CalDAV synced" for events without a caldav_uid', () => {
    const event = makeEvent({ caldav_uid: null });
    render(createElement(AgendaPanel, makeProps({ events: [event] })));
    expect(screen.queryByText('CalDAV synced')).toBeNull();
  });

  it('displays today count and upcoming count in the footer', () => {
    const today = makeEvent();
    const future = makeEvent({ id: 'evt-2', start_at: '2026-04-10T09:00:00Z', end_at: '2026-04-10T09:30:00Z' });
    render(createElement(AgendaPanel, makeProps({ events: [today, future] })));
    expect(screen.getByText('Today')).toBeDefined();
    expect(screen.getByText('Upcoming')).toBeDefined();
  });
});
