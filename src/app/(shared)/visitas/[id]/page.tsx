import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/app/submit-button";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import { roleHome } from "@/lib/auth/roles";
import { getVisitDetail } from "@/lib/data/visit";
import { formatVisitDate, formatVisitTime } from "@/lib/format";
import { disciplineMeta } from "@/lib/mock-data";
import { cancelVisit, reassignVisit } from "@/app/actions/visits";
import { createIncident, resolveIncident } from "@/app/actions/incidents";

export const instant = false;

export default async function VisitDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const { supabase, profile } = await requireRole([
    "family",
    "coordinator",
    "professional",
  ]);
  const data = await getVisitDetail(supabase, id, profile.role);

  if (!data) notFound();

  const discipline = disciplineMeta[data.visit.discipline];
  const professionalLabel = data.professional?.name ?? "Sin asignar";
  const professionalDiscipline = data.professional?.discipline ?? data.visit.discipline;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Detalle de visita"
          title={discipline.label}
          description={`${data.household.name} · ${data.elder?.full_name ?? "Persona mayor"}`}
          backHref={roleHome[profile.role]}
          actions={<VisitStatusBadge status={data.visit.status} />}
        />

        <FeedbackBanner error={error} ok={ok} />

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardDescription>Programación</CardDescription>
              <CardTitle className="text-xl">
                {formatVisitDate(data.visit.scheduled_at)} ·{" "}
                {formatVisitTime(data.visit.scheduled_at)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Profesional
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <UserRound className="size-4 text-primary" />
                    {professionalLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {disciplineMeta[
                      professionalDiscipline as keyof typeof disciplineMeta
                    ]?.label ?? professionalDiscipline}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Dirección
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <MapPin className="size-4 text-primary" />
                    {data.visit.address ?? data.household.address ?? data.household.comuna}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Duración
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <Clock3 className="size-4 text-primary" />
                    {data.visit.duration_min} minutos
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <CalendarDays className="size-4 text-primary" />
                    {data.visit.status}
                  </p>
                </div>
              </div>

              {data.visit.cancellation_reason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-semibold">Motivo de cancelación</p>
                  <p className="mt-1">{data.visit.cancellation_reason}</p>
                </div>
              )}

              {profile.role === "coordinator" || profile.role === "admin" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <form action={reassignVisit} className="space-y-2 rounded-xl border p-3">
                    <p className="text-sm font-semibold">Reasignar visita</p>
                    <input type="hidden" name="visit_id" value={data.visit.id} />
                    <select
                      name="professional_id"
                      required
                      defaultValue={data.visit.professional_id ?? ""}
                      className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                    >
                      <option value="">Selecciona profesional</option>
                      {data.professionals
                        .filter(
                          (professional) =>
                            professional.discipline === data.visit.discipline,
                        )
                        .map((professional) => (
                          <option key={professional.id} value={professional.id}>
                            {professional.name}
                          </option>
                        ))}
                    </select>
                    <Input name="scheduled_at" type="datetime-local" />
                    <SubmitButton size="sm" className="w-full" pendingText="Guardando...">
                      Guardar cambios
                    </SubmitButton>
                  </form>

                  <form action={cancelVisit} className="space-y-2 rounded-xl border p-3">
                    <p className="text-sm font-semibold">Cancelar visita</p>
                    <input type="hidden" name="visit_id" value={data.visit.id} />
                    <Textarea
                      name="cancellation_reason"
                      rows={2}
                      placeholder="Motivo de la cancelación"
                    />
                    <SubmitButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      pendingText="Cancelando..."
                    >
                      Cancelar visita
                    </SubmitButton>
                  </form>
                </div>
              ) : null}

              {profile.role === "professional" && data.visit.status !== "completed" && data.visit.status !== "cancelled" ? (
                <div className="flex flex-wrap gap-2">
                  <Link href="/agenda" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Ir a mi agenda
                  </Link>
                </div>
              ) : null}

              {profile.role === "family" ? (
                <div className="flex flex-wrap gap-2">
                  <Link href="/solicitudes" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <MessageCircle className="size-4" />
                    Pedir un cambio
                  </Link>
                  <Link href="/mensajes" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    Hablar con coordinación
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardDescription>Después de la visita</CardDescription>
                <CardTitle className="text-xl">Reporte</CardTitle>
              </CardHeader>
              <CardContent>
                {data.report ? (
                  <div className="space-y-3">
                    <p className="rounded-xl bg-muted/50 p-3 text-sm leading-6">
                      {data.report.summary}
                    </p>
                    {data.report.recommendations.length > 0 && (
                      <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                        {data.report.recommendations.map((recommendation) => (
                          <li key={recommendation} className="flex gap-2">
                            <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    La visita aún no tiene reporte. Se genera al completar la atención.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Seguimiento</CardDescription>
                <CardTitle className="text-xl">Plan de cuidados</CardTitle>
              </CardHeader>
              <CardContent>
                {data.carePlan ? (
                  <div className="space-y-3 text-sm">
                    <p className="flex items-start gap-2">
                      <ClipboardList className="mt-0.5 size-4 shrink-0 text-primary" />
                      {data.carePlan.frequency}
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {data.carePlan.goals.map((goal) => (
                        <li key={goal} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin plan de cuidados registrado.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Excepciones</CardDescription>
              <CardTitle className="text-xl">Incidencias</CardTitle>
            </div>
            <AlertTriangle className="size-5 text-amber-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.incidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay incidencias registradas para esta visita.
              </p>
            ) : (
              data.incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full">
                        {incident.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {incident.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{incident.description}</p>
                  </div>
                  {profile.role === "coordinator" &&
                    incident.status !== "resolved" && (
                      <form action={resolveIncident}>
                        <input type="hidden" name="incident_id" value={incident.id} />
                        <input type="hidden" name="visit_id" value={data.visit.id} />
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          pendingText="Resolviendo..."
                        >
                          Resolver
                        </SubmitButton>
                      </form>
                    )}
                </div>
              ))
            )}

            {data.visit.status !== "cancelled" && (
              <details className="rounded-xl border p-3">
                <summary className="cursor-pointer text-sm font-semibold text-primary">
                  Registrar incidencia
                </summary>
                <form action={createIncident} className="mt-3 space-y-2">
                  <input type="hidden" name="visit_id" value={data.visit.id} />
                  <select
                    name="severity"
                    className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                    defaultValue="medium"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                  <Textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="Describe qué ocurrió."
                  />
                  <SubmitButton
                    variant="outline"
                    size="sm"
                    className="w-full"
                    pendingText="Registrando..."
                  >
                    Registrar incidencia
                  </SubmitButton>
                </form>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
