import type { Event } from '@nexus/api';

// Route through Date object so Postgres "+00:00" offsets are handled correctly.
function toIcsDate(iso: string): string {
  return new Date(iso).toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

// Apple Calendar requires commas, semicolons and backslashes escaped in text fields.
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function formatEventAsIcs(event: Event): string {
  const uid = event.caldav_uid ?? `${event.id}@nexus-command`;
  const dtstart = toIcsDate(event.start_at);
  const dtend = toIcsDate(event.end_at);
  const dtstamp = toIcsDate(new Date().toISOString());

  // Trailing \r\n is required by RFC 5545.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Nexus Command//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeText(event.title)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function downloadIcs(event: Event): void {
  const content = formatEventAsIcs(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
