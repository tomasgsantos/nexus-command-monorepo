import { vi } from 'vitest';

export const mockFetchEvents = vi.fn();
export const mockCreateEvent = vi.fn();
export const mockUpdateEvent = vi.fn();
export const mockDeleteEvent = vi.fn();
export const mockSubscribeToEvents = vi.fn();

export function setupNexusApiMock(): void {
  vi.mock('@nexus/api', () => ({
    fetchEvents: mockFetchEvents,
    createEvent: mockCreateEvent,
    updateEvent: mockUpdateEvent,
    deleteEvent: mockDeleteEvent,
    subscribeToEvents: mockSubscribeToEvents,
  }));
}
