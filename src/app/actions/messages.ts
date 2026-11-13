"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await requireRole(["family", "coordinator"]);
  const householdId = String(formData.get("household_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? "/mensajes");

  if (!householdId || !body) {
    redirect(`${redirectTo}?error=Escribe%20un%20mensaje.`);
  }

  const { error } = await supabase.from("messages").insert({
    household_id: householdId,
    sender_id: user.id,
    body,
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/mensajes");
  revalidatePath(`/mensajes/${householdId}`);
  revalidatePath("/inicio");
  revalidatePath("/tablero");
  redirect(redirectTo);
}

export async function markMessagesRead(formData: FormData) {
  const { supabase, user } = await requireRole(["family", "coordinator"]);
  const householdId = String(formData.get("household_id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/mensajes");

  if (!householdId) redirect(redirectTo);

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("household_id", householdId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}
