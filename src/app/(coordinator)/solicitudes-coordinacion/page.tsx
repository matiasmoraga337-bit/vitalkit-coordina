import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { PageHeader } from "@/components/app/page-header";
import { RequestStatusBadge } from "@/components/app/status-badge";
import { SubmitButton } from "@/components/app/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth";
import { getCoordinatorDashboard } from "@/lib/data/coordinator";
import { approveRequest } from "@/app/actions/visits";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

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
            {pending.length === 0 ? (
              <EmptyState icon={Inbox} title="Sin solicitudes pendientes" description="Todo está asignado por ahora." />
            ) : (
              pending.map((request) => (
                <div key={request.id} className="rounded-xl border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{typeLabel[request.type] ?? "Solicitud"}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", disciplineMeta[request.discipline].className)}>
                        {disciplineMeta[request.discipline].label}
                      </span>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {request.requestedBy} · {request.date}
                  </p>
                  <p className="mt-2 text-sm leading-6">{request.reason}</p>
                  <form action={approveRequest} className="mt-3 space-y-2">
                    <input type="hidden" name="request_id" value={request.id} />
                    <input type="hidden" name="redirect_to" value="/solicitudes-coordinacion" />
                    <select
                      name="professional_id"
                      required
                      className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                    >
                      <option value="">Selecciona profesional</option>
                      {data.professionals
                        .filter((professional) => professional.discipline === request.discipline)
                        .map((professional) => (
                          <option key={professional.id} value={professional.id}>
                            {professional.name}
                          </option>
                        ))}
                    </select>
                    <Input name="scheduled_at" type="datetime-local" required />
                    <SubmitButton size="sm" className="w-full" pendingText="Asignando...">
                      Aprobar y asignar
                    </SubmitButton>
                  </form>
                </div>
              ))
            )}
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
