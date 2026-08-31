-- Evening reminder opt-in, send log, and one-click unsubscribe.

alter table public.profiles
  add column if not exists reminders_opt_in boolean not null default true;

alter table public.profiles
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists profiles_unsubscribe_token
  on public.profiles (unsubscribe_token);

create table if not exists public.reminder_sends (
  user_id uuid not null references public.profiles (id) on delete cascade,
  local_date date not null,
  kind text not null default 'evening',
  sent_at timestamptz not null default now(),
  primary key (user_id, local_date, kind)
);

alter table public.reminder_sends enable row level security;

create or replace function public.unsubscribe_reminders(token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set reminders_opt_in = false
  where unsubscribe_token = token;
end;
$$;

grant execute on function public.unsubscribe_reminders(uuid) to anon, authenticated;
