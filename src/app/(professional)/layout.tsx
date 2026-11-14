import { AppShell } from "@/components/app/app-shell";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";

export const instant = false;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("professional");

  return (
    <AppShell
      role="professional"
      user={{
        name: profile.full_name,
        detail: "Profesional",
        initials: getInitials(profile.full_name),
      }}
    >
      {children}
    </AppShell>
  );
}
