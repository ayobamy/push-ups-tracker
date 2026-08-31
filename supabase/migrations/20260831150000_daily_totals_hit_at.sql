-- Instant the day's running sum first reached the floor.
-- Last rank key on Board / Purse / Today when the other keys tie.

alter table public.daily_totals
  add column if not exists hit_at timestamptz;

create or replace function public.day_hit_at(
  uid uuid,
  cid uuid,
  d date,
  goal int
)
returns timestamptz
language sql
stable
set search_path = public
as $$
  select min(x.logged_at)
  from (
    select
      s.logged_at,
      sum(s.reps) over (order by s.logged_at asc, s.id asc) as running
    from public.sets s
    where s.user_id = uid
      and s.challenge_id = cid
      and s.local_date = d
  ) x
  where x.running >= goal;
$$;

revoke all on function public.day_hit_at(uuid, uuid, date, int) from public;

create or replace function public.sets_refresh_daily_totals()
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
  crossed timestamptz;
begin
  uid := coalesce(new.user_id, old.user_id);
  cid := coalesce(new.challenge_id, old.challenge_id);
  d := coalesce(new.local_date, old.local_date);
  select daily_goal into goal from public.challenges where id = cid;
  select coalesce(sum(reps), 0) into total
  from public.sets
  where user_id = uid and challenge_id = cid and local_date = d;
  crossed := public.day_hit_at(uid, cid, d, coalesce(goal, 100));
  insert into public.daily_totals (
    user_id, challenge_id, local_date, total_reps, hit_goal, hit_at, updated_at
  )
  values (
    uid,
    cid,
    d,
    total,
    total >= coalesce(goal, 100),
    crossed,
    now()
  )
  on conflict (user_id, challenge_id, local_date)
  do update set
    total_reps = excluded.total_reps,
    hit_goal = excluded.hit_goal,
    hit_at = excluded.hit_at,
    updated_at = now();
  return null;
end;
$$;

update public.daily_totals t
set hit_at = public.day_hit_at(
  t.user_id,
  t.challenge_id,
  t.local_date,
  c.daily_goal
)
from public.challenges c
where c.id = t.challenge_id
  and t.hit_goal
  and t.hit_at is null;
