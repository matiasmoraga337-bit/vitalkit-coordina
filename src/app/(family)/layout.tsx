import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { FamilyBottomNav } from "@/components/family/family-bottom-nav";
import { RequestVisitWizard } from "@/components/family/request-visit-wizard";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";
import { getFamilyDashboardCached } from "@/lib/data/family";
import { getFamilyUnreadCountCached } from "@/lib/data/messages";

export const instant = false;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole("family");
  const [data, unreadCount] = await Promise.all([
    getFamilyDashboardCached(profile.id, profile.full_name),
    getFamilyUnreadCountCached(profile.id, user.id),
  ]);

  return (
    <AppShell
      role="family"
      user={{
        name: profile.full_name,
        detail: data
          ? `${data.household.plan} · ${data.household.elderName}`
          : "Familia",
        initials: getInitials(profile.full_name),
      }}
      bottomNav={<FamilyBottomNav unreadCount={unreadCount} />}
    >
      {children}
      <Suspense fallback={null}>
        <RequestVisitWizard visits={data?.visits ?? []} />
      </Suspense>
    </AppShell>
  );
}
