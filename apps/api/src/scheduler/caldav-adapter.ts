import { DAVClient } from 'tsdav';

export type { DAVClient };

export interface CalDavEvent {
  uid: string;
  title: string;
  start: string;
  end: string;
  raw: string;
}

/**
 * Create a configured DAVClient for the given CalDAV server.
 */
export function createCalDavClient(
  serverUrl: string,
  credentials: { username: string; password: string },
): DAVClient {
  return new DAVClient({
    serverUrl,
    credentials,
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
}

/**
 * Fetch and parse events from a CalDAV calendar URL.
 * Returns a flat list of CalDavEvent objects.
 */
export async function syncCalDavEvents(
  client: DAVClient,
  calendarUrl: string,
): Promise<CalDavEvent[]> {
  await client.login();

  const objects = await client.fetchCalendarObjects({ calendar: { url: calendarUrl } as any });

  return objects
    .filter((obj) => Boolean(obj.data))
    .map((obj) => parseCalDavObject(obj.data as string));
}

function parseCalDavObject(raw: string): CalDavEvent {
  const uid = extractField(raw, 'UID') ?? crypto.randomUUID();
  const title = extractField(raw, 'SUMMARY') ?? '(No title)';
  const start = extractField(raw, 'DTSTART') ?? '';
  const end = extractField(raw, 'DTEND') ?? '';

  return { uid, title, start, end, raw };
}

function extractField(ical: string, field: string): string | null {
  const match = ical.match(new RegExp(`^${field}(?:;[^:]*)?:(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}
