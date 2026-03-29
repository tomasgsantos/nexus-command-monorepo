import type { Database } from './Database';

export type Project = Database['public']['Tables']['projects']['Row'];

export type HealthStatus = Project['health_status'];

export type CreateProjectInput = Omit<Database['public']['Tables']['projects']['Insert'], 'owner_id'>;

export type UpdateProjectInput = Database['public']['Tables']['projects']['Update'];
