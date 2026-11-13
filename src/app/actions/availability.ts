"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export async function updateAvailability(formData: FormData) {
  const { supabase, user } = await requireRole("professional");

  const rows = Array.from({ length: 7 }, (_, weekday) => ({
    professional_id: user.id,
    weekday,
    start_time: String(formData.get(`start_${weekday}`) ?? "09:00") || "09:00",
    end_time: String(formData.get(`end_${weekday}`) ?? "18:00") || "18:00",
    active: formData.get(`active_${weekday}`) === "on",
  }));

  const { error } = await supabase
    .from("availability")
    .upsert(rows, { onConflict: "professional_id,weekday" });

  if (error) {
    redirect(`/disponibilidad?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/disponibilidad");
  revalidatePath("/profesionales");
  redirect("/disponibilidad?ok=Disponibilidad%20actualizada.");
}
