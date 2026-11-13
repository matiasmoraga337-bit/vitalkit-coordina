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
import { AppShell } from "@/components/app/app-shell";
import { RequestStatusBadge, VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  demoCarePlan,
  demoHousehold,
  demoRequests,
  demoVisits,
  disciplineMeta,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const nextVisit = demoVisits[0];
const lastReport = demoVisits.find((visit) => visit.status === "completed");
const pendingRequest = demoRequests.find((request) => request.status === "pending");

export default function FamilyHomePage() {
  return (
    <AppShell role="family">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Hola, {demoHousehold.contactName.split(" ")[0]}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              El cuidado de Elena, en un solo lugar.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan {demoHousehold.plan} · {demoHousehold.comuna} · coordinadora{" "}
              {demoHousehold.coordinator}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              Plan activo
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {demoHousehold.plan} · ${demoHousehold.planPrice.toLocaleString("es-CL")}/mes
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
              <CardTitle className="text-lg">6 de 8</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              2 programadas
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
                <Button disabled>
                  Ver detalle
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline" disabled>
                  Pedir cambio
                </Button>
                <Button variant="ghost" disabled>
                  <MessageCircle className="size-4" />
                  Hablar con coordinación
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Los botones se habilitarán cuando conectemos Supabase y la
                autenticación.
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
                  <Button variant="outline" className="w-full" disabled>
                    Ver reporte completo
                  </Button>
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
                <p className="mt-1 text-sm leading-6">{demoCarePlan.frequency}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Objetivos
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  {demoCarePlan.goals.map((goal) => (
                    <li key={goal} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Próxima revisión: {demoCarePlan.nextReview}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Coordinación</CardDescription>
                <CardTitle className="text-xl">Solicitudes</CardTitle>
              </div>
              <Link href="/demo" className="text-sm font-semibold text-primary hover:underline">
                Ver demo
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoRequests.map((request) => (
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
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" disabled>
                  <Receipt className="size-4" />
                  Ver factura
                </Button>
                <Link href="/demo" className={cn(buttonVariants({ variant: "ghost" }))}>
                  Ir al modo demo
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
