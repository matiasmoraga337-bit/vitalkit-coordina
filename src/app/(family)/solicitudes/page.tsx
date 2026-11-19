import { Inbox } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { EmptyState } from "@/components/app/empty-state";
import { FamilyRequestsPanel } from "@/components/app/family-requests-panel";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboardCached } from "@/lib/data/family";

export const instant = false;

export default async function FamilyRequestsPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");

  const { profile } = await requireRole("family");
  const data = await getFamilyDashboardCached(profile.id, profile.full_name);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes"
        description="Pide una visita extra, cambia una visita o revisa lo que ya enviaste."
        backHref="/plan"
      />

      {!data ? (
        <EmptyState
          icon={Inbox}
          title="Sin hogar asignado"
          description="La coordinadora todavía no vinculó tu cuenta."
        />
      ) : (
        <Card>
          <CardHeader>
            <div>
              <CardDescription>Historial</CardDescription>
              <CardTitle className="text-xl">Tus solicitudes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <FamilyRequestsPanel initialRequests={data.requests} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}