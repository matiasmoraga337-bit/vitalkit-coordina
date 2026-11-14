import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { FamilyRequestsPanel } from "@/components/app/family-requests-panel";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboard } from "@/lib/data/family";

export const instant = false;

export default async function FamilyRequestsPage() {
  const { supabase, profile } = await requireRole("family");
  const data = await getFamilyDashboard(supabase, profile.id, profile.full_name);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Solicitudes"
        title="Pide un cambio o una visita extra"
        description="La coordinación revisa cada solicitud y confirma el profesional y el horario."
        backHref="/inicio"
      />

      {!data ? (
        <EmptyState
          icon={Inbox}
          title="Sin hogar asignado"
          description="La coordinadora todavía no vinculó tu cuenta."
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Historial</CardDescription>
              <CardTitle className="text-xl">Tus solicitudes</CardTitle>
            </div>
            <Inbox className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <FamilyRequestsPanel initialRequests={data.requests} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
