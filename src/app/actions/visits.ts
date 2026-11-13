"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import type { Database } from "@/lib/supabase/database.types";

type Discipline = Database["public"]["Enums"]["discipline"];

const disciplines = new Set(["kinesiologia", "nutricion", "enfermeria", "aseo"]);

function parseDiscipline(value: FormDataEntryValue | null): Discipline | null {
  const discipline = String(value ?? "");
  return disciplines.has(discipline) ? (discipline as Discipline) : null;
}

export async function createRequest(formData: FormData) {
  const { supabase, profile } = await requireRole("family");
  const discipline = parseDiscipline(formData.get("discipline"));
  const preferredDate = String(formData.get("preferred_date") ?? "").trim() || null;
  const preferredTime = String(formData.get("preferred_time") ?? "").trim() || null;
  const reason = String(formData.get("reason") ?? "").trim();

  if (!discipline || !reason) {
    redirect("/inicio?error=Completa%20la%20disciplina%20y%20el%20motivo.");
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profile.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/inicio?error=No%20tienes%20un%20hogar%20asignado.");
  }

  const { error } = await supabase.from("requests").insert({
    household_id: membership.household_id,
    requested_by: profile.id,
    discipline,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    reason,
    status: "pending",
  });

  if (error) {
    redirect(`/inicio?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/inicio");
  revalidatePath("/tablero");
  redirect("/inicio");
}

export async function approveRequest(formData: FormData) {
  const { supabase, profile } = await requireRole("coordinator");
  const requestId = String(formData.get("request_id") ?? "");
  const professionalId = String(formData.get("professional_id") ?? "");
  const scheduledAtInput = String(formData.get("scheduled_at") ?? "");

  if (!requestId || !professionalId || !scheduledAtInput) {
    redirect("/tablero?error=Selecciona%20profesional%20y%20horario.");
  }

  const scheduledAt = new Date(scheduledAtInput);
  if (Number.isNaN(scheduledAt.getTime())) {
    redirect("/tablero?error=Horario%20inv%C3%A1lido.");
  }

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    redirect("/tablero?error=Solicitud%20no%20encontrada.");
  }

  const { data: elder } = await supabase
    .from("elders")
    .select("id")
    .eq("household_id", request.household_id)
    .limit(1)
    .maybeSingle();

  const { data: household } = await supabase
    .from("households")
    .select("address, comuna")
    .eq("id", request.household_id)
    .single();

  const { error: visitError } = await supabase.from("visits").insert({
    household_id: request.household_id,
    elder_id: elder?.id ?? null,
    professional_id: professionalId,
    discipline: request.discipline,
    scheduled_at: scheduledAt.toISOString(),
    duration_min: 60,
    status: "confirmed",
    address: household?.address ?? household?.comuna ?? "Puerto Montt",
    created_by: profile.id,
  });

  if (visitError) {
    redirect(`/tablero?error=${encodeURIComponent(visitError.message)}`);
  }

  const { error: updateError } = await supabase
    .from("requests")
    .update({
      status: "approved",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) {
    redirect(`/tablero?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/tablero");
  revalidatePath("/inicio");
  revalidatePath("/agenda");
  redirect("/tablero");
}

export async function startVisit(formData: FormData) {
  const { supabase, user } = await requireRole("professional");
  const visitId = String(formData.get("visit_id") ?? "");

  if (!visitId) redirect("/agenda");

  const { error } = await supabase
    .from("visits")
    .update({ status: "in_progress" })
    .eq("id", visitId)
    .eq("professional_id", user.id);

  if (error) {
    redirect(`/agenda?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/agenda");
  revalidatePath("/inicio");
  redirect("/agenda");
}

export async function completeVisit(formData: FormData) {
  const { supabase, user } = await requireRole("professional");
  const visitId = String(formData.get("visit_id") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();

  if (!visitId || !summary) {
    redirect("/agenda?error=Escribe%20la%20nota%20de%20la%20visita.");
  }

  const { error: reportError } = await supabase.from("visit_reports").insert({
    visit_id: visitId,
    summary,
    created_by: user.id,
  });

  if (reportError) {
    redirect(`/agenda?error=${encodeURIComponent(reportError.message)}`);
  }

  const { error: visitError } = await supabase
    .from("visits")
    .update({ status: "completed" })
    .eq("id", visitId)
    .eq("professional_id", user.id);

  if (visitError) {
    redirect(`/agenda?error=${encodeURIComponent(visitError.message)}`);
  }

  revalidatePath("/agenda");
  revalidatePath("/inicio");
  revalidatePath("/tablero");
  redirect("/agenda");
}
