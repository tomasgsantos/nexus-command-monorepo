-- Ephemeral guest calendar for demo sessions
-- Depends on: 20260404_events_owner.sql

-- Add expires_at to events (null = permanent, set = ephemeral)
alter table public.events
  add column if not exists expires_at timestamptz;

-- Update select policy to filter out expired events
drop policy if exists "events_select_owner" on public.events;
create policy "events_select_owner"
  on public.events for select
  using (
    owner_id = auth.uid()
    and (expires_at is null or expires_at > now())
  );

-- RPC: clear and re-seed a fresh guest calendar for the calling demo user.
-- Called once per login from the frontend. Only callable by the demo role.
create or replace function public.seed_demo_events()
returns void language plpgsql security definer as $$
declare
  uid       uuid := auth.uid();
  user_role text;
begin
  select role into user_role from public.profiles where id = uid;
  if user_role != 'demo' then
    raise exception 'Only demo users may call seed_demo_events';
  end if;

  delete from public.events where owner_id = uid;

  insert into public.events (title, start_at, end_at, owner_id, expires_at)
  values
    ('Kickoff Call',
      now() + interval '1 day',
      now() + interval '1 day'  + interval '1 hour',
      uid, now() + interval '1 day'),
    ('Design Review',
      now() + interval '3 days',
      now() + interval '3 days' + interval '2 hours',
      uid, now() + interval '1 day'),
    ('Sprint Planning',
      now() + interval '5 days',
      now() + interval '5 days' + interval '1 hour',
      uid, now() + interval '1 day'),
    ('Stakeholder Demo',
      now() + interval '7 days',
      now() + interval '7 days' + interval '90 minutes',
      uid, now() + interval '1 day'),
    ('Launch Retrospective',
      now() + interval '14 days',
      now() + interval '14 days' + interval '1 hour',
      uid, now() + interval '1 day');
end;
$$;

-- pg_cron: purge expired events daily at 3am (requires pg_cron extension)
select cron.schedule(
  'cleanup-expired-events',
  '0 3 * * *',
  $$delete from public.events where expires_at is not null and expires_at < now()$$
);
