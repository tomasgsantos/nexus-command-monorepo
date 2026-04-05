import { supabase } from '../supabase-client';
import type { Event } from '../types/Event';

/**
 * Fetch all events, optionally filtered by a date range on start_at.
 */
export async function fetchEvents(
  rangeStart?: string,
  rangeEnd?: string,
): Promise<Event[]> {
  let query = supabase.from('events').select('*').order('start_at');

  if (rangeStart) {
    query = query.gte('start_at', rangeStart);
  }
  if (rangeEnd) {
    query = query.lte('start_at', rangeEnd);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`fetchEvents failed: ${error.message}`);
  }

  return (data ?? []) as Event[];
}

/**
 * Fetch a single event by ID, or null if not found.
 */
export async function fetchEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`fetchEvent failed: ${error.message}`);
  }

  return data as Event | null;
}
