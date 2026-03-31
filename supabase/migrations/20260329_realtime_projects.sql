-- Enable Supabase Realtime replication for the projects table.
-- This allows postgres_changes events (INSERT, UPDATE, DELETE) to
-- propagate to subscribed clients via the Realtime websocket.

ALTER PUBLICATION supabase_realtime ADD TABLE projects;
