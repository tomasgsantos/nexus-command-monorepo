import { supabase } from '../supabase-client';
import type { Event, CreateEventInput, UpdateEventInput } from '../types/Event';

// The Database type uses a simplified schema without relationship metadata,
// so Supabase's generic resolution on write operations falls back to `never`.
// We use an untyped reference for mutations while keeping the public API fully typed.
function eventsTable() {
  return (supabase as any).from('events');
}

export async function createEvent(data: CreateEventInput): Promise<Event> {
  const { data: event, error } = await eventsTable()
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`createEvent failed: ${error.message}`);
  }

  return event as Event;
}

export async function updateEvent(id: string, data: UpdateEventInput): Promise<Event> {
  const { id: _id, ...fields } = data;

  const { data: event, error } = await eventsTable()
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`updateEvent failed: ${error.message}`);
  }

  return event as Event;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await eventsTable()
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`deleteEvent failed: ${error.message}`);
  }
}
