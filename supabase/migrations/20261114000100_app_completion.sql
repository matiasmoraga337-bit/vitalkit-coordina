-- App completion: request types, visit cancellation, availability and message read state.

create type public.request_type as enum ('extra_visit', 'change', 'contact');

alter table public.requests
add column type public.request_type not null default 'extra_visit';

alter table public.visits
add column cancellation_reason text;

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, weekday)
);

create index availability_professional_idx on public.availability (professional_id);

create trigger availability_set_updated_at
before update on public.availability
for each row execute function public.set_updated_at();

alter table public.availability enable row level security;

create policy "availability_select_own_or_coordinator"
on public.availability for select
to authenticated
using (professional_id = auth.uid() or public.is_coordinator());

create policy "availability_write_own_or_coordinator"
on public.availability for all
to authenticated
using (professional_id = auth.uid() or public.is_coordinator())
with check (professional_id = auth.uid() or public.is_coordinator());

create policy "messages_update_read"
on public.messages for update
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id))
with check (public.is_coordinator() or public.is_household_member(household_id));

create or replace function public.protect_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_coordinator() then
    new.household_id = old.household_id;
    new.sender_id = old.sender_id;
    new.body = old.body;
    new.created_at = old.created_at;
  end if;
  return new;
end;
$$;

create trigger messages_protect_update
before update on public.messages
for each row execute function public.protect_message_update();

grant select, insert, update, delete on public.availability to authenticated;
