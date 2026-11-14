"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

type PayInvoiceResult = {
  ok: boolean;
  approved?: boolean;
  reference?: string;
  amount?: number;
  error?: string;
};

export async function payInvoice(formData: FormData) {
  const { supabase } = await requireRole("family");
  const invoiceId = String(formData.get("invoice_id") ?? "");
  const cardLast4 = String(formData.get("card_last4") ?? "").replace(/\D/g, "").slice(-4);

  if (!invoiceId || cardLast4.length !== 4) {
    return { ok: false, error: "Revisa los datos de la tarjeta." };
  }

  const { data, error } = await supabase.rpc("pay_invoice", {
    p_invoice_id: invoiceId,
    p_card_last4: cardLast4,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const result = data as PayInvoiceResult | null;

  if (!result?.ok) {
    return {
      ok: false,
      approved: false,
      error: result?.error ?? "No pudimos procesar el pago.",
    };
  }

  updateTag("family-invoices");
  updateTag("family-dashboard");
  updateTag("coordinator-dashboard");
  updateTag("coordinator-case");
  revalidatePath("/factura");
  revalidatePath("/inicio");
  revalidatePath("/tablero");

  return {
    ok: true,
    approved: true,
    reference: result.reference,
    amount: result.amount,
  };
}
