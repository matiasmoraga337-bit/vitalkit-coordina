-- VitalKit Coordina: initial schema, roles and row level security.
-- Apply with `npx supabase db push` after linking the remote project.

create extension if not exists pgcrypto;

create type public.app_role as enum ('family', 'coordinator', 'professional', 'admin');
create type public.discipline as enum ('kinesiologia', 'nutricion', 'enfermeria', 'aseo');
create type public.visit_status as enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.incident_status as enum ('open', 'in_review', 'resolved');
create type public.verification_status as enum ('pending', 'verified', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'family',
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.plans (
  id text primary key,
  name text not null,
  price_clp integer not null check (price_clp >= 0),
  visits jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  comuna text not null default 'Puerto Montt',
  address text,
  plan_id text references public.plans (id),
  coordinator_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  relationship text,
  primary key (household_id, profile_id)
);

create table public.elders (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  full_name text not null,
  birth_date date,
  mobility text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.professionals (
  id uuid primary key references public.profiles (id) on delete cascade,
  discipline public.discipline not null,
  verification public.verification_status not null default 'pending',
  coverage text[] not null default array['Puerto Montt'],
  bio text,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status text not null default 'active',
  start_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  elder_id uuid references public.elders (id) on delete set null,
  professional_id uuid references public.professionals (id) on delete set null,
  discipline public.discipline not null,
  scheduled_at timestamptz not null,
  duration_min integer not null default 60 check (duration_min > 0),
  status public.visit_status not null default 'scheduled',
  address text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.care_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  goals text[] not null default '{}',
  frequency text,
  recommendations text[] not null default '{}',
  next_review date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visit_reports (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null unique references public.visits (id) on delete cascade,
  summary text not null,
  recommendations text[] not null default '{}',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  requested_by uuid references public.profiles (id),
  discipline public.discipline not null,
  preferred_date date,
  preferred_time text,
  reason text not null,
  status public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  visit_id uuid references public.visits (id) on delete set null,
  reported_by uuid references public.profiles (id),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  description text not null,
  status public.incident_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  period text not null,
  plan_amount_clp integer not null default 0 check (plan_amount_clp >= 0),
  extras_amount_clp integer not null default 0 check (extras_amount_clp >= 0),
  total_clp integer not null default 0 check (total_clp >= 0),
  status text not null default 'pending',
  issued_at date not null default current_date,
  due_at date,
  created_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  profile_id uuid references public.profiles (id),
  type text not null default 'care_services',
  signed_at timestamptz not null default now(),
  document_url text
);

create index visits_household_scheduled_idx on public.visits (household_id, scheduled_at desc);
create index visits_professional_scheduled_idx on public.visits (professional_id, scheduled_at desc);
create index requests_household_status_idx on public.requests (household_id, status);
create index messages_household_created_idx on public.messages (household_id, created_at);
create index incidents_household_status_idx on public.incidents (household_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger visits_set_updated_at
before update on public.visits
for each row execute function public.set_updated_at();

create or replace function public.protect_visit_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_coordinator() then
    new.household_id = old.household_id;
    new.elder_id = old.elder_id;
    new.professional_id = old.professional_id;
    new.discipline = old.discipline;
    new.scheduled_at = old.scheduled_at;
    new.duration_min = old.duration_min;
    new.address = old.address;
    new.created_by = old.created_by;
  end if;
  return new;
end;
$$;

create trigger visits_protect_update
before update on public.visits
for each row execute function public.protect_visit_update();

create trigger care_plans_set_updated_at
before update on public.care_plans
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.app_role() in ('coordinator', 'admin'), false);
$$;

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household
      and hm.profile_id = auth.uid()
  );
$$;

create or replace function public.is_my_coordinator(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.households h
    join public.household_members hm on hm.household_id = h.id
    where hm.profile_id = auth.uid()
      and h.coordinator_id = target_profile
  );
$$;

create or replace function public.is_my_professional(target_profile uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.visits v
    join public.household_members hm on hm.household_id = v.household_id
    where hm.profile_id = auth.uid()
      and v.professional_id = target_profile
  );
$$;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.elders enable row level security;
alter table public.professionals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.visits enable row level security;
alter table public.care_plans enable row level security;
alter table public.visit_reports enable row level security;
alter table public.requests enable row level security;
alter table public.messages enable row level security;
alter table public.incidents enable row level security;
alter table public.invoices enable row level security;
alter table public.consents enable row level security;

create policy "profiles_select_own_related_or_coordinator"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_coordinator()
  or public.is_my_coordinator(id)
  or public.is_my_professional(id)
);

create policy "plans_select_authenticated"
on public.plans for select
to authenticated
using (true);

create policy "plans_write_coordinator"
on public.plans for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "households_select_member_coordinator_or_professional"
on public.households for select
to authenticated
using (
  public.is_coordinator()
  or public.is_household_member(id)
  or exists (
    select 1
    from public.visits v
    where v.household_id = households.id
      and v.professional_id = auth.uid()
  )
);

create policy "households_write_coordinator"
on public.households for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "household_members_select_member_or_coordinator"
on public.household_members for select
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id));

create policy "household_members_write_coordinator"
on public.household_members for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "elders_select_member_coordinator_or_professional"
on public.elders for select
to authenticated
using (
  public.is_coordinator()
  or public.is_household_member(household_id)
  or exists (
    select 1
    from public.visits v
    where v.household_id = elders.household_id
      and v.professional_id = auth.uid()
  )
);

create policy "elders_write_coordinator"
on public.elders for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "professionals_select_authenticated"
on public.professionals for select
to authenticated
using (true);

create policy "professionals_write_coordinator"
on public.professionals for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "subscriptions_select_member_or_coordinator"
on public.subscriptions for select
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id));

create policy "subscriptions_write_coordinator"
on public.subscriptions for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "visits_select_member_coordinator_or_professional"
on public.visits for select
to authenticated
using (
  public.is_coordinator()
  or public.is_household_member(household_id)
  or professional_id = auth.uid()
);

create policy "visits_write_coordinator"
on public.visits for insert
to authenticated
with check (public.is_coordinator());

create policy "visits_update_coordinator_or_professional"
on public.visits for update
to authenticated
using (public.is_coordinator() or professional_id = auth.uid())
with check (public.is_coordinator() or professional_id = auth.uid());

create policy "visits_delete_coordinator"
on public.visits for delete
to authenticated
using (public.is_coordinator());

create policy "care_plans_select_member_coordinator_or_professional"
on public.care_plans for select
to authenticated
using (
  public.is_coordinator()
  or public.is_household_member(household_id)
  or exists (
    select 1
    from public.visits v
    where v.household_id = care_plans.household_id
      and v.professional_id = auth.uid()
  )
);

create policy "care_plans_write_coordinator"
on public.care_plans for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "visit_reports_select_related"
on public.visit_reports for select
to authenticated
using (
  public.is_coordinator()
  or exists (
    select 1
    from public.visits v
    where v.id = visit_id
      and (public.is_household_member(v.household_id) or v.professional_id = auth.uid())
  )
);

create policy "visit_reports_insert_related"
on public.visit_reports for insert
to authenticated
with check (
  exists (
    select 1
    from public.visits v
    where v.id = visit_id
      and (v.professional_id = auth.uid() or public.is_coordinator())
  )
);

create policy "visit_reports_update_related"
on public.visit_reports for update
to authenticated
using (
  exists (
    select 1
    from public.visits v
    where v.id = visit_id
      and (v.professional_id = auth.uid() or public.is_coordinator())
  )
)
with check (
  exists (
    select 1
    from public.visits v
    where v.id = visit_id
      and (v.professional_id = auth.uid() or public.is_coordinator())
  )
);

create policy "requests_select_member_or_coordinator"
on public.requests for select
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id));

create policy "requests_insert_member"
on public.requests for insert
to authenticated
with check (public.is_household_member(household_id) and requested_by = auth.uid());

create policy "requests_update_coordinator"
on public.requests for update
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "messages_select_member_or_coordinator"
on public.messages for select
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id));

create policy "messages_insert_member_or_coordinator"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and (public.is_coordinator() or public.is_household_member(household_id))
);

create policy "incidents_select_related"
on public.incidents for select
to authenticated
using (
  public.is_coordinator()
  or public.is_household_member(household_id)
  or reported_by = auth.uid()
);

create policy "incidents_insert_related"
on public.incidents for insert
to authenticated
with check (
  reported_by = auth.uid()
  and (public.is_coordinator() or public.is_household_member(household_id))
);

create policy "incidents_update_coordinator"
on public.incidents for update
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "invoices_select_member_or_coordinator"
on public.invoices for select
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id));

create policy "invoices_write_coordinator"
on public.invoices for all
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

create policy "consents_select_member_or_coordinator"
on public.consents for select
to authenticated
using (public.is_coordinator() or public.is_household_member(household_id));

create policy "consents_insert_member_or_coordinator"
on public.consents for insert
to authenticated
with check (public.is_coordinator() or public.is_household_member(household_id));

create policy "consents_update_coordinator"
on public.consents for update
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into public.plans (id, name, price_clp, visits)
values
  ('esencial', 'Esencial', 99000, '{"kinesiologia":2,"nutricion":0,"enfermeria":1,"aseo":0}'::jsonb),
  ('integral', 'Integral', 236000, '{"kinesiologia":4,"nutricion":1,"enfermeria":2,"aseo":1}'::jsonb),
  ('premium', 'Premium', 372000, '{"kinesiologia":6,"nutricion":2,"enfermeria":3,"aseo":2}'::jsonb)
on conflict (id) do update
set name = excluded.name,
    price_clp = excluded.price_clp,
    visits = excluded.visits;
