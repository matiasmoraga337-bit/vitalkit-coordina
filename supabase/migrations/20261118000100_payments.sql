create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  household_id uuid references public.households (id) on delete set null,
  plan_id text references public.plans (id),
  amount_clp integer not null check (amount_clp >= 0),
  method text not null default 'simulated_card',
  status text not null check (status in ('approved', 'rejected')),
  card_last4 text,
  authorization_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  created_by uuid references public.profiles (id),
  constraint payments_single_target check (
    (invoice_id is not null and lead_id is null and household_id is not null)
    or (invoice_id is null and lead_id is not null and household_id is null)
  )
);

create index payments_invoice_idx on public.payments (invoice_id);
create index payments_lead_idx on public.payments (lead_id);
create index payments_created_idx on public.payments (created_at desc);

alter table public.payments enable row level security;

create policy "payments_select_coordinator"
on public.payments for select
to authenticated
using (public.is_coordinator());

create policy "payments_select_family"
on public.payments for select
to authenticated
using (
  invoice_id is not null
  and household_id is not null
  and public.is_household_member(household_id)
);

create policy "payments_insert_family_invoice"
on public.payments for insert
to authenticated
with check (
  invoice_id is not null
  and household_id is not null
  and lead_id is null
  and created_by = auth.uid()
  and public.is_household_member(household_id)
  and status = 'approved'
);

create policy "payments_insert_landing"
on public.payments for insert
to anon, authenticated
with check (
  lead_id is not null
  and invoice_id is null
  and household_id is null
  and status = 'approved'
);

grant select on public.payments to authenticated;
grant insert on public.payments to anon, authenticated;
