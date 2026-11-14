drop policy if exists "leads_insert_public" on public.leads;

create policy "leads_insert_public"
on public.leads for insert
to anon, authenticated
with check (
  consent = true
  and source in ('landing', 'landing_checkout')
);
