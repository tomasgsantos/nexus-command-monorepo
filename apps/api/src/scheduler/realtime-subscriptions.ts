import { supabase } from '../supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Event } from '../types/Event';

interface EventCallbacks {
  onInsert: (event: Event) => void;
  onUpdate: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function subscribeToEvents({ onInsert, onUpdate, onDelete }: EventCallbacks): RealtimeChannel {
  return supabase
    .channel('events-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' },
      (payload) => onInsert(payload.new as Event))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' },
      (payload) => onUpdate(payload.new as Event))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' },
      (payload) => onDelete((payload.old as { id: string }).id))
    .subscribe();
}
