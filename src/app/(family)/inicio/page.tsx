import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  MessageCircle,
  Receipt,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createRequest } from "@/app/actions/visits";
import { getFamilyDashboard } from "@/lib/data/family";
import { RequestStatusBadge, VisitStatusBadge } from "@/components/app/status-badge";
import { SubmitButton } from "@/components/app/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function FamilyHomePage() {
  const { supabase, profile } = await requireRole("family");
  const data = await getFamilyDashboard(supabase, profile.id, profile.full_name);

  if (!data) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Sin hogar asignado</CardTitle>
            <CardDescription>
              La coordinadora todavía no vinculó tu cuenta a un hogar.
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  const { household, visits, requests, carePlan, stats } = data;
  const nextVisit = visits.find(
    (visit) => visit.status !== "completed" && visit.status !== "cancelled",
  );
  const lastReport = visits
    .filter((visit) => visit.status === "completed" && visit.note)
    .at(-1);
  const pendingRequest = requests.find((request) => request.status === "pending");
  const carePlanData = carePlan ?? {
    goals: [],
    frequency: "Sin plan de cuidados",
    recommendations: [],
    nextReview: "Sin fecha",
  };

  if (!nextVisit) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Sin visitas programadas</CardTitle>
            <CardDescription>
              La coordinadora todavía no agendó la próxima visita.
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Hola, {household.contactName.split(" ")[0]}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              El cuidado de Elena, en un solo lugar.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan {household.plan} · {household.comuna} · coordinadora{" "}
              {household.coordinator}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              Plan activo
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {household.plan} · ${household.planPrice.toLocaleString("es-CL")}/mes
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Próxima visita</CardDescription>
              <CardTitle className="text-lg">
                {nextVisit.date} · {nextVisit.time}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="size-4 text-primary" />
              {disciplineMeta[nextVisit.discipline].label}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Profesional</CardDescription>
              <CardTitle className="text-lg">{nextVisit.professional}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-4 text-primary" />
              {nextVisit.professionalRole}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visitas este mes</CardDescription>
              <CardTitle className="text-lg">{stats.visitsThisMonth} de {stats.planVisits}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              {stats.upcoming} programadas
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Solicitud pendiente</CardDescription>
              <CardTitle className="text-lg">
                {pendingRequest ? "1 en revisión" : "Sin pendientes"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="size-4 text-primary" />
              {pendingRequest ? "Kinesiología extra" : "Todo al día"}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Lo que viene</CardDescription>
                <CardTitle className="text-xl">Próxima visita</CardTitle>
              </div>
              <VisitStatusBadge status={nextVisit.status} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-2xl",
                    disciplineMeta[nextVisit.discipline].className,
                  )}
                >
                  <HeartPulse className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg font-bold">
                    {disciplineMeta[nextVisit.discipline].label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nextVisit.professional} · {nextVisit.professionalRole}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold">{nextVisit.date}</p>
                  <p className="text-sm text-muted-foreground">{nextVisit.time} hrs</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/visitas/${nextVisit.id}`} className={cn(buttonVariants())}>
                  Ver detalle
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/solicitudes" className={cn(buttonVariants({ variant: "outline" }))}>
                  Pedir cambio
                </Link>
                <Link href="/mensajes" className={cn(buttonVariants({ variant: "ghost" }))}>
                  <MessageCircle className="size-4" />
                  Hablar con coordinación
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                La información y las acciones se guardan en Supabase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Última atención</CardDescription>
              <CardTitle className="text-xl">Reporte de visita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastReport ? (
                <>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">
                      {disciplineMeta[lastReport.discipline].label}
                    </span>
                    <span className="text-muted-foreground">
                      {lastReport.date} · {lastReport.time}
                    </span>
                  </div>
                  <p className="rounded-xl bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">
                    {lastReport.note}
                  </p>
                  <Link
                    href={`/visitas/${lastReport.id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    Ver reporte completo
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay reportes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Seguimiento</CardDescription>
                <CardTitle className="text-xl">Plan de cuidados</CardTitle>
              </div>
              <ClipboardList className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Frecuencia
                </p>
                <p className="mt-1 text-sm leading-6">{carePlanData.frequency}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Objetivos
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  {carePlanData.goals.map((goal) => (
                    <li key={goal} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Próxima revisión: {carePlanData.nextReview}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Coordinación</CardDescription>
                <CardTitle className="text-xl">Solicitudes</CardTitle>
              </div>
              <Link href="/solicitudes" className="text-sm font-semibold text-primary hover:underline">
                Ver todas
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {disciplineMeta[request.discipline].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.date} · {request.reason}
                    </p>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
              ))}
              <details className="rounded-xl border p-3">
                <summary className="cursor-pointer text-sm font-semibold text-primary">
                  Pedir visita extra
                </summary>
                <form action={createRequest} className="mt-3 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
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
                    <label className="space-y-1 text-xs font-medium">
                      Fecha preferida
                      <Input name="preferred_date" type="date" />
                    </label>
                  </div>
                  <label className="space-y-1 text-xs font-medium">
                    Hora preferida
                    <Input name="preferred_time" type="time" />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    Motivo
                    <Textarea
                      name="reason"
                      required
                      rows={3}
                      placeholder="Cuéntanos qué necesita Elena."
                    />
                  </label>
                  <SubmitButton size="sm" className="w-full" pendingText="Enviando...">
                    Enviar solicitud
                  </SubmitButton>
                </form>
              </details>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/factura" className={cn(buttonVariants({ variant: "outline" }))}>
                  <Receipt className="size-4" />
                  Ver factura
                </Link>
                <Link href="/mensajes" className={cn(buttonVariants({ variant: "ghost" }))}>
                  Hablar con coordinación
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}