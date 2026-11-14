"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await requireRole(["family", "coordinator"]);
  const householdId = String(formData.get("household_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!householdId || !body) {
    return { ok: false, error: "Escribe un mensaje." };
  }

  const { error } = await supabase.from("messages").insert({
    household_id: householdId,
    sender_id: user.id,
    body,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  updateTag("messages");
  revalidatePath("/mensajes");
  revalidatePath(`/mensajes/${householdId}`);
  revalidatePath("/inicio");
  revalidatePath("/tablero");
  return { ok: true };
}

export async function markMessagesRead(formData: FormData) {
  const { supabase, user } = await requireRole(["family", "coordinator"]);
  const householdId = String(formData.get("household_id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/mensajes");

  if (!householdId) return { ok: false, error: "Hogar no encontrado." };

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("household_id", householdId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (error) {
    return { ok: false, error: error.message };
  }

  updateTag("messages");
  revalidatePath(redirectTo);
  return { ok: true };
}
