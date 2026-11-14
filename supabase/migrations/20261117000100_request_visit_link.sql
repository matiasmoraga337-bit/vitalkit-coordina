alter table public.requests
add column visit_id uuid references public.visits (id) on delete set null;

create index requests_visit_id_idx on public.requests (visit_id);

create or replace function public.validate_request_visit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.visit_id is not null then
    if not exists (
      select 1
      from public.visits v
      where v.id = new.visit_id
        and v.household_id = new.household_id
    ) then
      raise exception 'La visita no pertenece al hogar de la solicitud.';
    end if;
  end if;
  return new;
end;
$$;

create trigger requests_validate_visit
before insert or update of visit_id, household_id on public.requests
for each row execute function public.validate_request_visit();
