export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'admin' | 'consultant' | 'viewer' | 'demo';
          display_name: string;
          avatar_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          health_status: 'on_track' | 'at_risk' | 'failing';
          lat: number | null;
          lng: number | null;
          owner_id: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['projects']['Row']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          start_at: string;
          end_at: string;
          project_id: string | null;
          caldav_uid: string | null;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      playbooks: {
        Row: {
          id: string;
          title: string;
          owner_id: string;
          steps: unknown;
        };
        Insert: Omit<Database['public']['Tables']['playbooks']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['playbooks']['Row']>;
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          price_tiers: unknown;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['services']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          status: string;
          total: number;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      identity_templates: {
        Row: {
          id: string;
          name: string;
          canvas_config: unknown;
        };
        Insert: Omit<Database['public']['Tables']['identity_templates']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['identity_templates']['Row']>;
      };
    };
  };
}
