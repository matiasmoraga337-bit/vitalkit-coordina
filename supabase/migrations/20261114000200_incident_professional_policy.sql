drop policy if exists "incidents_select_related" on public.incidents;
drop policy if exists "incidents_insert_related" on public.incidents;

create policy "incidents_select_related"
on public.incidents for select
to authenticated
using (
  public.is_coordinator()
  or public.is_household_member(household_id)
  or reported_by = auth.uid()
  or exists (
    select 1
    from public.visits v
    where v.id = incidents.visit_id
      and v.professional_id = auth.uid()
  )
);

create policy "incidents_insert_related"
on public.incidents for insert
to authenticated
with check (
  reported_by = auth.uid()
  and (
    public.is_coordinator()
    or public.is_household_member(household_id)
    or exists (
      select 1
      from public.visits v
      where v.id = incidents.visit_id
        and v.professional_id = auth.uid()
    )
  )
);
