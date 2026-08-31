-- Exact unique already exists on profiles.display_name (init).
-- That still allows Ahmed and ahmed. Collapse case so the board
-- cannot show two people as the same name.

do $$
begin
  if exists (
    select 1
    from public.profiles
    where display_name is not null
    group by lower(display_name)
    having count(*) > 1
  ) then
    raise exception
      'profiles.display_name has case-insensitive duplicates; rename them first';
  end if;
end $$;

create unique index if not exists profiles_display_name_lower
  on public.profiles (lower(display_name))
  where display_name is not null;
