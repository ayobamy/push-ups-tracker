-- 100 a Day v1 schema. Open signup. One seeded challenge.

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  daily_goal int not null default 100 check (daily_goal > 0),
  starts_on date not null,
  duration_days int not null default 365 check (duration_days > 0),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text unique,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint display_name_len check (
    display_name is null
    or (
      char_length(display_name) >= 2
      and char_length(display_name) <= 32
    )
  )
);

create table public.challenge_members (
  challenge_id uuid not null references public.challenges (id)
    on delete cascade,
  user_id uuid not null references public.profiles (id)
    on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id)
    on delete cascade,
  challenge_id uuid not null references public.challenges (id)
    on delete cascade,
  reps int not null check (reps >= 1 and reps <= 1000),
  logged_at timestamptz not null default now(),
  local_date date not null,
  note text check (note is null or char_length(note) <= 140)
);

create table public.daily_totals (
  user_id uuid not null references public.profiles (id)
    on delete cascade,
  challenge_id uuid not null references public.challenges (id)
    on delete cascade,
  local_date date not null,
  total_reps int not null default 0,
  hit_goal boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_id, local_date)
);

create index sets_user_day on public.sets (user_id, challenge_id, local_date);

-- Profile row on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Stamp local_date from the member timezone
create function public.sets_stamp_local_date()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tz text;
begin
  select timezone into tz from public.profiles where id = new.user_id;
  if tz is null then
    tz := 'UTC';
  end if;
  new.local_date := (new.logged_at at time zone tz)::date;
  return new;
end;
$$;

create trigger sets_before_write
  before insert or update on public.sets
  for each row execute procedure public.sets_stamp_local_date();

-- Cap 50 sets per local day
create function public.sets_cap_per_day()
returns trigger
language plpgsql
as $$
declare
  n int;
begin
  select count(*) into n
  from public.sets
  where user_id = new.user_id
    and challenge_id = new.challenge_id
    and local_date = new.local_date
    and id <> new.id;
  if n >= 50 then
    raise exception 'too many sets for this day';
  end if;
  return new;
end;
$$;

create trigger sets_cap
  before insert on public.sets
  for each row execute procedure public.sets_cap_per_day();

-- Roll up daily_totals
create function public.sets_refresh_daily_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  cid uuid;
  d date;
  goal int;
  total int;
begin
  uid := coalesce(new.user_id, old.user_id);
  cid := coalesce(new.challenge_id, old.challenge_id);
  d := coalesce(new.local_date, old.local_date);
  select daily_goal into goal from public.challenges where id = cid;
  select coalesce(sum(reps), 0) into total
  from public.sets
  where user_id = uid and challenge_id = cid and local_date = d;
  insert into public.daily_totals (
    user_id, challenge_id, local_date, total_reps, hit_goal, updated_at
  )
  values (uid, cid, d, total, total >= coalesce(goal, 100), now())
  on conflict (user_id, challenge_id, local_date)
  do update set
    total_reps = excluded.total_reps,
    hit_goal = excluded.hit_goal,
    updated_at = now();
  return null;
end;
$$;

create trigger sets_after_write
  after insert or update or delete on public.sets
  for each row execute procedure public.sets_refresh_daily_totals();

create function public.join_active_challenge()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select id into cid from public.challenges where slug = 'hundred-2026';
  if cid is null then
    raise exception 'challenge not seeded';
  end if;
  insert into public.challenge_members (challenge_id, user_id)
  values (cid, auth.uid())
  on conflict do nothing;
end;
$$;

grant usage on schema public to authenticated;
grant select on public.challenges to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.challenge_members to authenticated;
grant select, insert, update, delete on public.sets to authenticated;
grant select on public.daily_totals to authenticated;
grant execute on function public.join_active_challenge() to authenticated;

alter table public.challenges enable row level security;
alter table public.profiles enable row level security;
alter table public.challenge_members enable row level security;
alter table public.sets enable row level security;
alter table public.daily_totals enable row level security;

create policy "challenges_select" on public.challenges
  for select to authenticated
  using (true);

create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated
  using (true);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "members_select" on public.challenge_members
  for select to authenticated
  using (true);

create policy "members_insert_own" on public.challenge_members
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "members_delete_own" on public.challenge_members
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "sets_select_own" on public.sets
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "sets_insert_own" on public.sets
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.challenge_members
      where user_id = (select auth.uid())
        and challenge_id = sets.challenge_id
    )
  );

create policy "sets_update_own_today" on public.sets
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and local_date = (
      (now() at time zone (
        select timezone from public.profiles where id = (select auth.uid())
      ))::date
    )
  )
  with check (user_id = (select auth.uid()));

create policy "sets_delete_own_today" on public.sets
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and local_date = (
      (now() at time zone (
        select timezone from public.profiles where id = (select auth.uid())
      ))::date
    )
  );

create policy "totals_select_authenticated" on public.daily_totals
  for select to authenticated
  using (true);

insert into public.challenges (
  slug, title, daily_goal, starts_on, duration_days
) values (
  'hundred-2026',
  '100 a Day',
  100,
  '2026-09-01',
  365
);
