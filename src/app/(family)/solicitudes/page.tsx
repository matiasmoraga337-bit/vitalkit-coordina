import { Inbox, Send } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { SubmitButton } from "@/components/app/submit-button";
import { PageHeader } from "@/components/app/page-header";
import { RequestStatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboard } from "@/lib/data/family";
import { createRequest } from "@/app/actions/visits";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

const requestTypeLabel: Record<string, string> = {
  extra_visit: "Visita extra",
  change: "Cambio de visita",
  contact: "Contacto",
};

export default async function FamilyRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { supabase, profile } = await requireRole("family");
  const data = await getFamilyDashboard(supabase, profile.id, profile.full_name);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Solicitudes"
          title="Pide un cambio o una visita extra"
          description="La coordinadora revisa cada solicitud y confirma el profesional y el horario."
          backHref="/inicio"
        />

        <FeedbackBanner error={error} ok={ok} />

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardDescription>Nueva solicitud</CardDescription>
              <CardTitle className="text-xl">Cuéntanos qué necesitas</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createRequest} className="space-y-3">
                <label className="space-y-1 text-xs font-medium">
                  Tipo
                  <select
                    name="type"
                    className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                    defaultValue="extra_visit"
                  >
                    <option value="extra_visit">Visita extra</option>
                    <option value="change">Cambio de visita</option>
                    <option value="contact">Contacto con coordinación</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs font-medium">
                  Disciplina
                  <select
                    name="discipline"
                    required
                    className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                  >
                    <option value="kinesiologia">Kinesiología</option>
                    <option value="nutricion">Nutrición</option>
                    <option value="enfermeria">Enfermería</option>
                    <option value="aseo">Aseo</option>
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-medium">
                    Fecha preferida
                    <Input name="preferred_date" type="date" />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    Hora preferida
                    <Input name="preferred_time" type="time" />
                  </label>
                </div>
                <label className="space-y-1 text-xs font-medium">
                  Motivo
                  <Textarea
                    name="reason"
                    required
                    rows={4}
                    placeholder="Cuéntanos qué necesita Elena o qué visita quieres cambiar."
                  />
                </label>
                <SubmitButton className="w-full" pendingText="Enviando...">
                  <Send className="size-4" />
                  Enviar solicitud
                </SubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Historial</CardDescription>
                <CardTitle className="text-xl">Tus solicitudes</CardTitle>
              </div>
              <Inbox className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              {!data || data.requests.length === 0 ? (
                <EmptyState icon={Inbox} title="Sin solicitudes" description="Cuando pidas una visita extra o un cambio aparecerá aquí." />
              ) : (
                data.requests.map((request) => (
                  <div key={request.id} className="rounded-xl border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {requestTypeLabel[request.type] ?? "Solicitud"}
                        </p>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", disciplineMeta[request.discipline].className)}>
                          {disciplineMeta[request.discipline].label}
                        </span>
                      </div>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{request.date}</p>
                    <p className="mt-2 text-sm leading-6">{request.reason}</p>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" disabled>
                Ver factura
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
