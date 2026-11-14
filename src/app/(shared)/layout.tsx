import { AppShell } from "@/components/app/app-shell";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";
import type { Role } from "@/lib/mock-data";

export const instant = false;

export default async function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(["family", "coordinator", "professional"]);
  const role: Role =
    profile.role === "coordinator" || profile.role === "admin"
      ? "coordinator"
      : profile.role;

  return (
    <AppShell
      role={role}
      user={{
        name: profile.full_name,
        detail:
          role === "family"
            ? "Familia"
            : role === "professional"
              ? "Profesional"
              : "Coordinación",
        initials: getInitials(profile.full_name),
      }}
    >
      {children}
    </AppShell>
  );
}
