"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

const statuses = new Set(["pending", "verified", "rejected"]);

export async function verifyProfessional(formData: FormData) {
  const { supabase } = await requireRole("coordinator");
  const professionalId = String(formData.get("professional_id") ?? "");
  const verification = String(formData.get("verification") ?? "");

  if (!professionalId || !statuses.has(verification)) {
    redirect("/profesionales?error=Verificaci%C3%B3n%20inv%C3%A1lida.");
  }

  const { error } = await supabase
    .from("professionals")
    .update({ verification: verification as "pending" | "verified" | "rejected" })
    .eq("id", professionalId);

  if (error) {
    redirect(`/profesionales?error=${encodeURIComponent(error.message)}`);
  }

  updateTag("coordinator-dashboard");
  updateTag("coordinator-availability");
  updateTag("coordinator-cases");
  revalidatePath("/profesionales");
  revalidatePath("/tablero");
  redirect("/profesionales?ok=Verificaci%C3%B3n%20actualizada.");
}
