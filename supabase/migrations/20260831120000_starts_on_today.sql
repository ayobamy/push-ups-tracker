update public.challenges
set starts_on = '2026-08-31'
where slug = 'hundred-2026'
  and starts_on is distinct from '2026-08-31';
