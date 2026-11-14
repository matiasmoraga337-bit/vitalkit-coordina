"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import type { Database } from "@/lib/supabase/database.types";

type Discipline = Database["public"]["Enums"]["discipline"];

const disciplines = new Set(["kinesiologia", "nutricion", "enfermeria", "aseo"]);
const requestTypes = new Set(["extra_visit", "change", "contact"]);

function invalidateVisitData() {
  updateTag("family-dashboard");
  updateTag("coordinator-dashboard");
  updateTag("coordinator-cases");
  updateTag("coordinator-case");
  updateTag("professional-agenda");
  updateTag("visit-detail");
}

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
  const requestedType = String(formData.get("type") ?? "extra_visit");
  const type = requestTypes.has(requestedType) ? requestedType : "extra_visit";
  const visitId =
    type === "change" ? String(formData.get("visit_id") ?? "").trim() || null : null;

  if (!discipline || !reason) {
    return { ok: false, error: "Completa la disciplina y el motivo." };
  }

  if (type === "change" && !visitId) {
    return { ok: false, error: "Selecciona la visita que quieres cambiar." };
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profile.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { ok: false, error: "No tienes un hogar asignado." };
  }

  if (visitId) {
    const { data: visit } = await supabase
      .from("visits")
      .select("id")
      .eq("id", visitId)
      .eq("household_id", membership.household_id)
      .maybeSingle();

    if (!visit) {
      return { ok: false, error: "La visita seleccionada no pertenece a tu hogar." };
    }
  }

  const { error } = await supabase.from("requests").insert({
    household_id: membership.household_id,
    requested_by: profile.id,
    discipline,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    reason,
    type: type as Database["public"]["Enums"]["request_type"],
    visit_id: visitId,
    status: "pending",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  invalidateVisitData();
  revalidatePath("/inicio");
  revalidatePath("/tablero");
  return { ok: true };
}

export async function approveRequest(formData: FormData) {
  const { supabase, profile } = await requireRole("coordinator");
  const requestId = String(formData.get("request_id") ?? "");
  const professionalId = String(formData.get("professional_id") ?? "");
  const scheduledAtInput = String(formData.get("scheduled_at") ?? "");

  if (!requestId) {
    return { ok: false, error: "Solicitud no encontrada." };
  }

  const scheduledAt = scheduledAtInput ? new Date(scheduledAtInput) : null;
  if (scheduledAtInput && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
    return { ok: false, error: "Horario inválido." };
  }

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { ok: false, error: "Solicitud no encontrada." };
  }

  if (request.type === "contact") {
    const { error: contactError } = await supabase
      .from("requests")
      .update({
        status: "approved",
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (contactError) return { ok: false, error: contactError.message };

    invalidateVisitData();
    revalidatePath("/tablero");
    revalidatePath("/solicitudes-coordinacion");
    revalidatePath("/inicio");
    return { ok: true };
  }

  if (!professionalId || !scheduledAtInput || !scheduledAt) {
    return { ok: false, error: "Selecciona profesional y horario." };
  }

  if (request.type === "change") {
    if (!request.visit_id) {
      return { ok: false, error: "La solicitud no tiene una visita vinculada." };
    }

    const { error: changeError } = await supabase
      .from("visits")
      .update({
        professional_id: professionalId,
        scheduled_at: scheduledAt.toISOString(),
        status: "confirmed",
        cancellation_reason: null,
      })
      .eq("id", request.visit_id)
      .eq("household_id", request.household_id);

    if (changeError) return { ok: false, error: changeError.message };
  } else {
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
      return { ok: false, error: visitError.message };
    }
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
    return { ok: false, error: updateError.message };
  }

  invalidateVisitData();
  revalidatePath("/tablero");
  revalidatePath("/inicio");
  revalidatePath("/agenda");
  return { ok: true };
}

export async function startVisit(formData: FormData) {
  const { supabase, user } = await requireRole("professional");
  const visitId = String(formData.get("visit_id") ?? "");

  if (!visitId) return { ok: false, error: "Visita no encontrada." };

  const { error } = await supabase
    .from("visits")
    .update({ status: "in_progress" })
    .eq("id", visitId)
    .eq("professional_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  invalidateVisitData();
  revalidatePath("/agenda");
  revalidatePath("/inicio");
  return { ok: true };
}

export async function completeVisit(formData: FormData) {
  const { supabase, user } = await requireRole("professional");
  const visitId = String(formData.get("visit_id") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();

  if (!visitId || !summary) {
    return { ok: false, error: "Escribe la nota de la visita." };
  }

  const { error: reportError } = await supabase.from("visit_reports").insert({
    visit_id: visitId,
    summary,
    created_by: user.id,
  });

  if (reportError) {
    return { ok: false, error: reportError.message };
  }

  const { error: visitError } = await supabase
    .from("visits")
    .update({ status: "completed" })
    .eq("id", visitId)
    .eq("professional_id", user.id);

  if (visitError) {
    return { ok: false, error: visitError.message };
  }

  revalidatePath("/agenda");
  invalidateVisitData();
  revalidatePath("/inicio");
  revalidatePath("/tablero");
  return { ok: true };
}

export async function reassignVisit(formData: FormData) {
  const { supabase } = await requireRole("coordinator");
  const visitId = String(formData.get("visit_id") ?? "");
  const professionalId = String(formData.get("professional_id") ?? "");
  const scheduledAtInput = String(formData.get("scheduled_at") ?? "");

  if (!visitId || !professionalId) {
    redirect("/tablero?error=Selecciona%20un%20profesional.");
  }

  const update: {
    professional_id: string;
    status: "confirmed";
    scheduled_at?: string;
  } = {
    professional_id: professionalId,
    status: "confirmed",
  };

  if (scheduledAtInput) {
    const scheduledAt = new Date(scheduledAtInput);
    if (Number.isNaN(scheduledAt.getTime())) {
      redirect(`/visitas/${visitId}?error=Horario%20inv%C3%A1lido.`);
    }
    update.scheduled_at = scheduledAt.toISOString();
  }

  const { error } = await supabase.from("visits").update(update).eq("id", visitId);

  if (error) {
    redirect(`/visitas/${visitId}?error=${encodeURIComponent(error.message)}`);
  }

  invalidateVisitData();
  revalidatePath("/tablero");
  revalidatePath("/inicio");
  revalidatePath("/agenda");
  revalidatePath(`/visitas/${visitId}`);
  redirect(`/visitas/${visitId}?ok=Visita%20reasignada.`);
}

export async function cancelVisit(formData: FormData) {
  const { supabase } = await requireRole("coordinator");
  const visitId = String(formData.get("visit_id") ?? "");
  const reason = String(formData.get("cancellation_reason") ?? "").trim();

  if (!visitId) redirect("/tablero");

  const { error } = await supabase
    .from("visits")
    .update({
      status: "cancelled",
      cancellation_reason: reason || "Cancelada por coordinación.",
    })
    .eq("id", visitId);

  if (error) {
    redirect(`/visitas/${visitId}?error=${encodeURIComponent(error.message)}`);
  }

  invalidateVisitData();
  revalidatePath("/tablero");
  revalidatePath("/inicio");
  revalidatePath("/agenda");
  revalidatePath(`/visitas/${visitId}`);
  redirect(`/visitas/${visitId}?ok=Visita%20cancelada.`);
}
