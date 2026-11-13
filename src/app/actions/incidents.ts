"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

const severities = new Set(["low", "medium", "high"]);

export async function createIncident(formData: FormData) {
  const { supabase, user } = await requireRole(["family", "professional", "coordinator"]);
  const visitId = String(formData.get("visit_id") ?? "");
  const severity = String(formData.get("severity") ?? "medium");
  const description = String(formData.get("description") ?? "").trim();

  if (!visitId || !description || !severities.has(severity)) {
    redirect(`/visitas/${visitId}?error=Completa%20la%20incidencia.`);
  }

  const { data: visit } = await supabase
    .from("visits")
    .select("household_id")
    .eq("id", visitId)
    .maybeSingle();

  if (!visit) {
    redirect(`/visitas/${visitId}?error=Visita%20no%20encontrada.`);
  }

  const { error } = await supabase.from("incidents").insert({
    household_id: visit.household_id,
    visit_id: visitId,
    reported_by: user.id,
    severity,
    description,
    status: "open",
  });

  if (error) {
    redirect(`/visitas/${visitId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/visitas/${visitId}`);
  revalidatePath("/tablero");
  redirect(`/visitas/${visitId}?ok=Incidencia%20registrada.`);
}

export async function resolveIncident(formData: FormData) {
  const { supabase } = await requireRole("coordinator");
  const incidentId = String(formData.get("incident_id") ?? "");
  const visitId = String(formData.get("visit_id") ?? "");

  if (!incidentId) redirect("/tablero");

  const { error } = await supabase
    .from("incidents")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", incidentId);

  if (error) {
    redirect(`/visitas/${visitId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/visitas/${visitId}`);
  revalidatePath("/tablero");
  redirect(`/visitas/${visitId}?ok=Incidencia%20resuelta.`);
}
