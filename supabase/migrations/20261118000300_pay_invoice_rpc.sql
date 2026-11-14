create or replace function public.pay_invoice(
  p_invoice_id uuid,
  p_card_last4 text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.invoices%rowtype;
  v_reference text;
  v_member boolean;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'No autenticado.');
  end if;

  if p_card_last4 = '0002' then
    return jsonb_build_object(
      'ok', false,
      'approved', false,
      'error', 'Pago rechazado. Intenta con la tarjeta de prueba aprobada.'
    );
  end if;

  select * into v_invoice
  from public.invoices
  where id = p_invoice_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Factura no encontrada.');
  end if;

  if v_invoice.status = 'paid' then
    return jsonb_build_object('ok', false, 'error', 'Esta factura ya está pagada.');
  end if;

  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = v_invoice.household_id
      and hm.profile_id = auth.uid()
  ) into v_member;

  if not v_member then
    return jsonb_build_object('ok', false, 'error', 'No autorizado para pagar esta factura.');
  end if;

  v_reference := 'SIM-' || upper(substr(md5(random()::text), 1, 6));

  insert into public.payments (
    invoice_id,
    household_id,
    plan_id,
    amount_clp,
    method,
    status,
    card_last4,
    authorization_code,
    paid_at,
    created_by
  ) values (
    v_invoice.id,
    v_invoice.household_id,
    null,
    v_invoice.total_clp,
    'simulated_card',
    'approved',
    p_card_last4,
    v_reference,
    now(),
    auth.uid()
  );

  update public.invoices
  set status = 'paid'
  where id = v_invoice.id;

  update public.subscriptions
  set status = 'active'
  where household_id = v_invoice.household_id;

  return jsonb_build_object(
    'ok', true,
    'approved', true,
    'reference', v_reference,
    'amount', v_invoice.total_clp
  );
end;
$$;

grant execute on function public.pay_invoice(uuid, text) to authenticated;
