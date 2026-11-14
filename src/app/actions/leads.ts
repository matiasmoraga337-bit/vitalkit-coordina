"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type LeadFormState = {
  ok: boolean;
  error?: string;
};

const leadSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre."),
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

  revalidatePath("/leads");
}
