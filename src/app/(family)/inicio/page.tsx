import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  Plus,
  Receipt,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { FamilyRequestsPanel } from "@/components/app/family-requests-panel";
import { VisitTimeline } from "@/components/family/visit-timeline";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    (visit) => visit.status === "scheduled" || visit.status === "confirmed" || visit.status === "in_progress",
  );
  const lastReport = data.visits
    .filter((visit) => visit.status === "completed" && visit.note)
    .at(-1);
  const planUsage = data.stats.planVisits
    ? Math.min(Math.round((data.stats.visitsThisMonth / data.stats.planVisits) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Hola, {data.household.contactName.split(" ")[0]}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          ¿Cómo está Elena hoy?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.household.plan} · {data.household.comuna} · coordinadora{" "}
          {data.household.coordinator}
        </p>
      </div>

      {nextVisit ? (
        <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-sky-50 via-white to-teal-50">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn("grid size-12 place-items-center rounded-2xl", disciplineMeta[nextVisit.discipline].className)}>
                  <Stethoscope className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Próxima visita
                  </p>
                  <h2 className="font-heading text-xl font-bold">
                    {disciplineMeta[nextVisit.discipline].label}
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
              <div className="rounded-xl border bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Fecha y hora</p>
                <p className="mt-1 font-semibold">
                  {nextVisit.date} · {nextVisit.time} hrs
                </p>
              </div>
              <div className="rounded-xl border bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="mt-1 font-semibold">{data.household.address}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/visitas/${nextVisit.id}`} className={cn(buttonVariants())}>
                Ver detalle
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/inicio?pedir=1&type=change&visit=${nextVisit.id}`}
                className={cn(buttonVariants({ variant: "outline" }))}
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
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Sin próxima visita"
          description="La coordinación todavía no agendó la siguiente atención."
          action={
            <Link href="/inicio?pedir=1&type=extra_visit" className={cn(buttonVariants())}>
              <Plus className="size-4" />
              Pedir una visita
            </Link>
          }
        />
      )}

      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="sr-only">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link href="/inicio?pedir=1&type=extra_visit" className="flex flex-col gap-2 rounded-2xl border bg-card p-4 hover:bg-muted/40">
            <Plus className="size-5 text-primary" />
            <span className="text-sm font-semibold">Pedir visita</span>
          </Link>
          <Link href="/mensajes" className="flex flex-col gap-2 rounded-2xl border bg-card p-4 hover:bg-muted/40">
            <MessageCircle className="size-5 text-primary" />
            <span className="text-sm font-semibold">Mensajes</span>
          </Link>
          <Link href="/plan" className="flex flex-col gap-2 rounded-2xl border bg-card p-4 hover:bg-muted/40">
            <ClipboardList className="size-5 text-primary" />
            <span className="text-sm font-semibold">Ver plan</span>
          </Link>
          <Link href="/factura" className="flex flex-col gap-2 rounded-2xl border bg-card p-4 hover:bg-muted/40">
            <Receipt className="size-5 text-primary" />
            <span className="text-sm font-semibold">Factura</span>
          </Link>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Tu plan</CardDescription>
              <CardTitle className="text-xl">Uso del mes</CardTitle>
            </div>
            <Badge variant="outline" className="rounded-full">
              {data.household.plan}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Visitas usadas</span>
              <span className="font-semibold">
                {data.stats.visitsThisMonth} de {data.stats.planVisits}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${planUsage}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Próxima revisión: {data.carePlan?.nextReview ?? "Sin fecha"}</span>
              <Link href="/plan" className="font-semibold text-primary hover:underline">
                Ver plan completo
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Apoyo cercano</CardDescription>
            <CardTitle className="text-xl">Tu coordinadora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {data.household.coordinator
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div>
                <p className="font-semibold">{data.household.coordinator}</p>
                <p className="text-xs text-muted-foreground">Coordinación VitalKit</p>
              </div>
            </div>
            <Link href="/mensajes" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              <MessageCircle className="size-4" />
              Hablar por chat
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
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
                <Link href={`/visitas/${lastReport.id}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Ver reporte completo
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay reportes de visitas.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Coordinación</CardDescription>
              <CardTitle className="text-xl">Solicitudes recientes</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {data.stats.pendingRequests > 0 && (
                <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {data.stats.pendingRequests} en revisión
                </Badge>
              )}
              <Link href="/solicitudes" className="text-sm font-semibold text-primary hover:underline">
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <FamilyRequestsPanel initialRequests={data.requests.slice(0, 2)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
