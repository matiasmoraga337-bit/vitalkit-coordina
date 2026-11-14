create type public.lead_status as enum ('new', 'contacted', 'converted', 'discarded');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  comuna text,
  plan_id text references public.plans (id),
  needs jsonb not null default '{}'::jsonb,
  message text,
  consent boolean not null default false,
  source text not null default 'landing',
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_created_idx on public.leads (status, created_at desc);

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

create policy "leads_insert_public"
on public.leads for insert
to anon, authenticated
with check (consent = true and source = 'landing');

create policy "leads_select_coordinator"
on public.leads for select
to authenticated
using (public.is_coordinator());

create policy "leads_update_coordinator"
on public.leads for update
to authenticated
using (public.is_coordinator())
with check (public.is_coordinator());

grant insert on public.leads to anon, authenticated;
grant select, update on public.leads to authenticated;
