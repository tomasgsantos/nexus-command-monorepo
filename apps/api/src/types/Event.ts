import type { Database } from './Database';

export type Event = Database['public']['Tables']['events']['Row'];

export type CreateEventInput = Omit<Database['public']['Tables']['events']['Insert'], 'id'>;

export type UpdateEventInput = Database['public']['Tables']['events']['Update'] & { id: string };
