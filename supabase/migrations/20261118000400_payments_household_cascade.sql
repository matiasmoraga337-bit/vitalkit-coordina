alter table public.payments
  drop constraint payments_household_id_fkey;

alter table public.payments
  add constraint payments_household_id_fkey
  foreign key (household_id) references public.households (id) on delete cascade;
