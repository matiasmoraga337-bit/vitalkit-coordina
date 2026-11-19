import { cacheLife, cacheTag } from "next/cache";
import { CalendarX2 } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { FamilyCalendarList } from "@/components/family/family-calendar-list";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboardCached } from "@/lib/data/family";

export const instant = false;

export default async function FamilyCalendarPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");

  const { profile } = await requireRole("family");
  const data = await getFamilyDashboardCached(profile.id, profile.full_name);

  if (!data) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Sin hogar asignado"
        description="La coordinadora todavía no vinculó tu cuenta."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        description={`Las visitas de ${data.household.elderName}, en orden.`}
        backHref="/inicio"
        actions={
          <Badge variant="outline" className="rounded-full">
            {data.stats.upcoming} próximas
          </Badge>
        }
      />

      <FamilyCalendarList visits={data.visits} />
    </div>
  );
}
