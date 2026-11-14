import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHome, type AppRole } from "@/lib/auth/roles";

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", userId)
    .single();

  return profile ? { supabase, user: { id: userId }, profile } : null;
});

export const requireRole = cache(async (expected: AppRole | AppRole[]) => {
  const session = await getCurrentProfile();

  if (!session) {
    redirect("/login");
  }

  const allowed = Array.isArray(expected) ? expected : [expected];

  if (!allowed.includes(session.profile.role)) {
    redirect(roleHome[session.profile.role]);
  }

  return session;
});
