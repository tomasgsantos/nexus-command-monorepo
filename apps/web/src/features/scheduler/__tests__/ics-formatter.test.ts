/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Event } from '@nexus/api';
import { formatEventAsIcs, downloadIcs } from '../utils/ics-formatter';

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

describe('formatEventAsIcs', () => {
  it('produces a valid VCALENDAR wrapper', () => {
    const output = formatEventAsIcs(makeEvent());

    expect(output).toContain('BEGIN:VCALENDAR');
    expect(output).toContain('END:VCALENDAR');
    expect(output).toContain('BEGIN:VEVENT');
    expect(output).toContain('END:VEVENT');
  });

  it('includes DTSTART and DTEND from the event', () => {
    const output = formatEventAsIcs(makeEvent());

    expect(output).toContain('DTSTART:20260406T090000Z');
    expect(output).toContain('DTEND:20260406T093000Z');
  });

  it('includes the event title as SUMMARY', () => {
    const output = formatEventAsIcs(makeEvent({ title: 'Sprint Review' }));
    expect(output).toContain('SUMMARY:Sprint Review');
  });

  it('uses caldav_uid as UID when present', () => {
    const output = formatEventAsIcs(makeEvent({ caldav_uid: 'my-caldav-uid' }));
    expect(output).toContain('UID:my-caldav-uid');
  });

  it('falls back to <id>@nexus-command when caldav_uid is null', () => {
    const output = formatEventAsIcs(makeEvent({ id: 'abc-123', caldav_uid: null }));
    expect(output).toContain('UID:abc-123@nexus-command');
  });

  it('escapes commas in the title', () => {
    const output = formatEventAsIcs(makeEvent({ title: 'A,B' }));
    expect(output).toContain('SUMMARY:A\\,B');
  });

  it('escapes semicolons in the title', () => {
    const output = formatEventAsIcs(makeEvent({ title: 'A;B' }));
    expect(output).toContain('SUMMARY:A\\;B');
  });

  it('escapes backslashes in the title', () => {
    const output = formatEventAsIcs(makeEvent({ title: 'A\\B' }));
    expect(output).toContain('SUMMARY:A\\\\B');
  });

  it('uses CRLF line endings throughout', () => {
    const output = formatEventAsIcs(makeEvent());
    const lines = output.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
  });
});

describe('downloadIcs', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { writable: true, value: vi.fn().mockReturnValue('blob:fake-url') });
    Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: vi.fn() });
  });

  it('triggers a download by clicking an anchor element', () => {
    const anchor = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);

    downloadIcs(makeEvent({ title: 'My Event' }));

    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.download).toBe('My-Event.ics');
  });

  it('sets the correct MIME type on the blob', () => {
    let capturedBlob: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn().mockImplementation((b: Blob) => { capturedBlob = b; return 'blob:fake'; }),
    });

    downloadIcs(makeEvent());

    expect(capturedBlob?.type).toBe('text/calendar;charset=utf-8');
  });

  it('revokes the object URL after click', () => {
    const anchor = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);

    downloadIcs(makeEvent());

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
