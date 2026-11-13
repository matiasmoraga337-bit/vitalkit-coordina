"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHome, type AppRole } from "@/lib/auth/roles";

const demoEmails: Record<"family" | "coordinator" | "professional", string> = {
  family: "familia@demo.vitalkit.cl",
  coordinator: "coordinadora@demo.vitalkit.cl",
  professional: "kinesiologo@demo.vitalkit.cl",
};

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Ingresa%20tu%20correo%20y%20contrase%C3%B1a.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "No se pudo iniciar sesión.")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(roleHome[profile?.role ?? "family"]);
}

export async function demoLogin(formData: FormData) {
  const role = String(formData.get("role") ?? "") as keyof typeof demoEmails;

  if (!(role in demoEmails)) {
    redirect("/login?error=Rol%20demo%20inv%C3%A1lido.");
  }

  const password = process.env.DEMO_PASSWORD;

  if (!password) {
    redirect("/login?error=Demo%20no%20configurada.%20Falta%20DEMO_PASSWORD.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmails[role],
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(roleHome[role as AppRole]);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
