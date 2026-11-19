"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { planById, type PlanId } from "@/lib/plans";

export type LeadFormState = {
  ok: boolean;
  error?: string;
};

const leadSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre."),
  patient_name: z.string().trim().min(2, "Ingresa el nombre del paciente."),
  email: z.string().trim().email("Ingresa un correo válido."),
  phone: z.string().trim().max(30).optional(),
  comuna: z.string().trim().max(80).optional(),
  plan_id: z.enum(["esencial", "integral", "premium"]).optional(),
  message: z.string().trim().max(1000).optional(),
  consent: z.boolean().refine((value) => value === true, {
    message: "Necesitamos tu consentimiento.",
  }),
});

const planIds = new Set(["esencial", "integral", "premium"]);
const statuses = new Set(["new", "contacted", "converted", "discarded"]);

export async function createLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  const parsed = leadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    patient_name: String(formData.get("patient_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    comuna: String(formData.get("comuna") ?? ""),
    plan_id: String(formData.get("plan_id") ?? "") || undefined,
    message: String(formData.get("message") ?? ""),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Revisa los datos.",
    };
  }

  if (parsed.data.plan_id && !planIds.has(parsed.data.plan_id)) {
    return { ok: false, error: "Plan inválido." };
  }

  const needs = {
    kinesiologia: formData.get("need_kinesiologia") === "on",
    nutricion: formData.get("need_nutricion") === "on",
    enfermeria: formData.get("need_enfermeria") === "on",
    aseo: formData.get("need_aseo") === "on",
  };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    patient_name: parsed.data.patient_name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    comuna: parsed.data.comuna || null,
    plan_id: parsed.data.plan_id ?? null,
    needs,
    message: parsed.data.message || null,
    consent: true,
    source: "landing",
    status: "new",
  });

  if (error) {
    return { ok: false, error: "No pudimos enviar la solicitud. Intenta nuevamente." };
  }

  updateTag("leads");
  revalidatePath("/leads");
  return { ok: true };
}

export async function updateLeadStatus(formData: FormData) {
  const { supabase } = await requireRole("coordinator");
  const leadId = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!leadId || !statuses.has(status)) {
    return;
  }

  await supabase
    .from("leads")
    .update({ status: status as "new" | "contacted" | "converted" | "discarded" })
    .eq("id", leadId);

  updateTag("leads");
  revalidatePath("/leads");
}

export type CheckoutState = {
  ok: boolean;
  approved?: boolean;
  reference?: string;
  error?: string;
};

export async function createLeadCheckout(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: false, error: "No pudimos procesar la solicitud." };
  }

  const planId = String(formData.get("plan_id") ?? "") as PlanId;
  const cardLast4 = String(formData.get("card_last4") ?? "").replace(/\D/g, "").slice(-4);

  if (!planIds.has(planId)) {
    return { ok: false, error: "Selecciona un plan válido." };
  }

  if (cardLast4.length !== 4) {
    return { ok: false, error: "Revisa los datos de la tarjeta." };
  }

  if (cardLast4 === "0002") {
    return {
      ok: false,
      approved: false,
      error: "Pago rechazado. Intenta con la tarjeta de prueba aprobada.",
    };
  }

  const parsed = leadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    patient_name: String(formData.get("patient_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    comuna: String(formData.get("comuna") ?? ""),
    plan_id: planId,
    message: String(formData.get("message") ?? ""),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Revisa los datos.",
    };
  }

  const plan = planById[planId];
  const reference = `SIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const paidAt = new Date().toISOString();
  const supabase = await createClient();

  const leadId = randomUUID();
  const { error: leadError } = await supabase.from("leads").insert({
    id: leadId,
    name: parsed.data.name,
    patient_name: parsed.data.patient_name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    comuna: parsed.data.comuna || null,
    plan_id: planId,
    needs: {},
    message: parsed.data.message || null,
    consent: true,
    source: "landing_checkout",
    status: "new",
  });

  if (leadError) {
    return { ok: false, error: "No pudimos registrar la solicitud." };
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    lead_id: leadId,
    invoice_id: null,
    household_id: null,
    plan_id: planId,
    amount_clp: plan.price,
    method: "simulated_card",
    status: "approved",
    card_last4: cardLast4,
    authorization_code: reference,
    paid_at: paidAt,
    created_by: null,
  });

  if (paymentError) {
    return { ok: false, error: "No pudimos registrar el pago simulado." };
  }

  updateTag("leads");
  revalidatePath("/leads");
  return { ok: true, approved: true, reference };
}
