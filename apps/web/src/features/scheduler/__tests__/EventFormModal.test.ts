/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import type { Event, CreateEventInput } from '@nexus/api';

vi.mock('../components/EventFormModal.css', () => ({}));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      createElement('div', rest, children),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));
vi.mock('@nexus/ui', () => ({
  Button: ({ children, onClick, type, disabled, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode; variant?: string }) =>
    createElement('button', { onClick, type, disabled, ...rest }, children),
}));

import { EventFormModal } from '../components/EventFormModal';

function makeProps(overrides?: Partial<Parameters<typeof EventFormModal>[0]>) {
  return {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeEvent(overrides?: Partial<Event>): Partial<Event> {
  return {
    id: 'evt-1',
    title: 'Team Standup',
    start_at: '2026-04-06T09:00:00.000Z',
    end_at: '2026-04-06T09:30:00.000Z',
    project_id: null,
    ...overrides,
  };
}

afterEach(cleanup);

describe('EventFormModal', () => {
  it('renders nothing when open is false', () => {
    render(createElement(EventFormModal, makeProps({ open: false })));
    expect(screen.queryByText('New Event')).toBeNull();
  });

  it('renders "New Event" title when no initial id is provided', () => {
    render(createElement(EventFormModal, makeProps()));
    expect(screen.getByText('New Event')).toBeDefined();
  });

  it('renders "Edit Event" title when initial has an id', () => {
    render(createElement(EventFormModal, makeProps({ initial: makeEvent() })));
    expect(screen.getByText('Edit Event')).toBeDefined();
  });

  it('pre-fills the title field from initial prop', () => {
    render(createElement(EventFormModal, makeProps({ initial: makeEvent() })));
    const input = screen.getByLabelText('Title') as HTMLInputElement;
    expect(input.value).toBe('Team Standup');
  });

  it('calls onClose when the Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(createElement(EventFormModal, makeProps({ onClose })));
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(createElement(EventFormModal, makeProps({ onClose })));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not attach keydown listener when closed', () => {
    const onClose = vi.fn();
    render(createElement(EventFormModal, makeProps({ open: false, onClose })));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct shape and then onClose on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const { container } = render(createElement(EventFormModal, makeProps({ initial: makeEvent(), onSubmit, onClose })));

    fireEvent.submit(container.querySelector('form')!);

    await new Promise((r) => setTimeout(r, 0));

    expect(onSubmit).toHaveBeenCalledOnce();
    const arg: CreateEventInput = onSubmit.mock.calls[0][0];
    expect(arg.title).toBe('Team Standup');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'));
    const { container } = render(createElement(EventFormModal, makeProps({ initial: makeEvent(), onSubmit })));

    fireEvent.submit(container.querySelector('form')!);

    await new Promise((r) => setTimeout(r, 0));

    expect(screen.getByText('Save failed')).toBeDefined();
  });

  it('shows fallback error text for non-Error rejections', async () => {
    const onSubmit = vi.fn().mockRejectedValue('raw error');
    const { container } = render(createElement(EventFormModal, makeProps({ initial: makeEvent(), onSubmit })));

    fireEvent.submit(container.querySelector('form')!);

    await new Promise((r) => setTimeout(r, 0));

    expect(screen.getByText('Failed to save event')).toBeDefined();
  });
});
