import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Plus,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { CareJourney } from "@/components/family/care-journey";
import { VisitTimeline } from "@/components/family/visit-timeline";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboardCached } from "@/lib/data/family";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function FamilyHomePage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");

  const { profile } = await requireRole("family");
  const data = await getFamilyDashboardCached(profile.id, profile.full_name);

  if (!data) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Sin hogar asignado"
        description="La coordinadora todavía no vinculó tu cuenta a un hogar."
      />
    );
  }

  const nextVisit = data.visits.find(
    (visit) =>
      visit.status === "scheduled" ||
      visit.status === "confirmed" ||
      visit.status === "in_progress",
  );
  const lastReport = data.visits
    .filter((visit) => visit.status === "completed" && visit.note)
    .at(-1);
  const planUsage = data.stats.planVisits
    ? Math.min(
        Math.round((data.stats.visitsThisMonth / data.stats.planVisits) * 100),
        100,
      )
    : 0;
  const firstName = data.household.contactName.split(" ")[0];

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm text-muted-foreground">Hola, {firstName}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Así está el cuidado de {data.household.elderName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.household.plan} · {data.household.comuna} · Coordinación{" "}
          {data.household.coordinator}
        </p>
      </header>

      <CareJourney data={data} />

      {nextVisit ? (
        <Card className="border-primary/20">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl",
                    disciplineMeta[nextVisit.discipline].className,
                  )}
                >
                  <Stethoscope className="size-6" />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-bold">
                    Próxima visita · {disciplineMeta[nextVisit.discipline].label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {nextVisit.professional} · {nextVisit.professionalRole}
                  </p>
                </div>
              </div>
              <VisitStatusBadge status={nextVisit.status} />
            </div>

            <div className="mt-4">
              <VisitTimeline status={nextVisit.status} />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Fecha y hora</p>
                <p className="mt-1 font-semibold">
                  {nextVisit.date} · {nextVisit.time} hrs
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="mt-1 font-semibold">{data.household.address}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href={`/visitas/${nextVisit.id}`} className={cn(buttonVariants())}>
                Ver visita
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/inicio?pedir=1&type=change&visit=${nextVisit.id}`}
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                <RefreshCw className="size-4" />
                Pedir cambio
              </Link>
              <Link href="/mensajes" className={cn(buttonVariants({ variant: "ghost" }))}>
                <MessageCircle className="size-4" />
                Hablar con coordinación
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : !data.carePlan ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 sm:p-6">
            <h2 className="font-heading text-xl font-bold">
              Estamos preparando la evaluación inicial
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Coordinación te contactará para conocer a {data.household.elderName} y
              definir el plan de cuidado.
            </p>
            <Link
              href="/mensajes"
              className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
            >
              <MessageCircle className="size-4" />
              Hablar con coordinación
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 sm:p-6">
            <h2 className="font-heading text-xl font-bold">
              Estamos agendando tu próxima visita
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              El plan de {data.household.elderName} está activo. Coordinación está
              buscando el mejor horario para la siguiente atención.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/inicio?pedir=1&type=extra_visit"
                className={cn(buttonVariants())}
              >
                <Plus className="size-4" />
                Pedir una visita
              </Link>
              <Link
                href="/mensajes"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <MessageCircle className="size-4" />
                Hablar con coordinación
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tu plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Visitas del mes</span>
              <span className="font-semibold">
                {data.stats.visitsThisMonth} de {data.stats.planVisits}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${planUsage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Próxima revisión: {data.carePlan?.nextReview ?? "Sin fecha"}
            </p>
            <Link
              href="/plan"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Ver mi cuidado
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Último reporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastReport ? (
              <>
                <p className="text-sm leading-6 text-muted-foreground">
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
              <p className="text-sm leading-6 text-muted-foreground">
                Cuando se complete la primera visita, aquí verás el reporte.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
