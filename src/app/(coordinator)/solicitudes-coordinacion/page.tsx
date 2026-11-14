import { Inbox } from "lucide-react";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { PageHeader } from "@/components/app/page-header";
import { RequestStatusBadge } from "@/components/app/status-badge";
import { CoordinatorPendingRequests } from "@/components/app/coordinator-pending-requests";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getCoordinatorDashboard } from "@/lib/data/coordinator";
import { disciplineMeta } from "@/lib/mock-data";

export const instant = false;

const typeLabel: Record<string, string> = {
  extra_visit: "Visita extra",
  change: "Cambio",
  contact: "Contacto",
};

export default async function CoordinatorRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { supabase } = await requireRole("coordinator");
  const data = await getCoordinatorDashboard(supabase);
  const pending = data.requests.filter((request) => request.status === "pending");
  const others = data.requests.filter((request) => request.status !== "pending");

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Solicitudes"
          title="Bandeja de entrada"
          description="Aprueba, asigna y revisa las solicitudes de las familias."
          backHref="/tablero"
          actions={<RequestStatusBadge status="pending" />}
        />

        <FeedbackBanner error={error} ok={ok} />

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className="text-xl">{pending.length} por revisar</CardTitle>
            </div>
            <Inbox className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <CoordinatorPendingRequests
              initialRequests={pending}
              professionals={data.professionals}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Historial</CardDescription>
            <CardTitle className="text-xl">Solicitudes revisadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {others.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin solicitudes revisadas.</p>
            ) : (
              others.map((request) => (
                <div key={request.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{typeLabel[request.type] ?? "Solicitud"}</p>
                      <span className="text-xs text-muted-foreground">{disciplineMeta[request.discipline].label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{request.requestedBy} · {request.date}</p>
                    <p className="mt-1 text-sm">{request.reason}</p>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
