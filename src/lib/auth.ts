import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHome, type AppRole } from "@/lib/auth/roles";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  return profile ? { supabase, user, profile } : null;
}

export async function requireRole(expected: AppRole | AppRole[]) {
  const session = await getCurrentProfile();

  if (!session) {
    redirect("/login");
  }

  const allowed = Array.isArray(expected) ? expected : [expected];

  if (!allowed.includes(session.profile.role)) {
    redirect(roleHome[session.profile.role]);
  }

  return session;
}
