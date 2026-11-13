import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Inbox,
  UserCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { RequestStatusBadge, VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  demoCoordinatorStats,
  demoRequests,
  demoVisits,
  disciplineMeta,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const upcomingVisits = demoVisits.filter((visit) => visit.status !== "completed");
const pendingRequests = demoRequests.filter((request) => request.status === "pending");

export default function CoordinatorDashboardPage() {
  return (
    <AppShell role="coordinator">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tablero de coordinación
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Tienes {demoCoordinatorStats.visitsToday} visitas en agenda.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa lo que falta asignar, las solicitudes pendientes y las
              visitas en riesgo.
            </p>
          </div>
          <Badge className="w-fit rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="size-3.5" />
            {demoCoordinatorStats.unassigned} visita sin asignar
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visitas en agenda</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {demoCoordinatorStats.visitsToday}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4 text-primary" />
              1 hoy · 4 próximas
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sin asignar</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {demoCoordinatorStats.unassigned}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleDashed className="size-4 text-amber-600" />
              Requiere acción
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Solicitudes pendientes</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {demoCoordinatorStats.pendingRequests}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="size-4 text-primary" />
              Prioridad media
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Familias activas</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {demoCoordinatorStats.activeHouseholds}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4 text-primary" />
              Piloto Puerto Montt
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Operación</CardDescription>
                <CardTitle className="text-xl">Próximas visitas</CardTitle>
              </div>
              <Button variant="outline" size="sm" disabled>
                Ver calendario
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
                >
                  <span className="w-16 shrink-0 rounded-lg bg-muted px-2 py-1 text-center text-sm font-semibold">
                    {visit.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{visit.professional}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          disciplineMeta[visit.discipline].className,
                        )}
                      >
                        {disciplineMeta[visit.discipline].label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Familia Rojas · Elena Rojas · {visit.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VisitStatusBadge status={visit.status} />
                    <Button size="sm" variant="ghost" disabled>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingVisits.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay visitas pendientes para hoy.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardDescription>Entrada</CardDescription>
                <CardTitle className="text-xl">Solicitudes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {disciplineMeta[request.discipline].label}
                      </p>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {request.requestedBy} · {request.date}
                    </p>
                    <p className="mt-2 text-sm leading-6">{request.reason}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" disabled>
                        Asignar
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        Revisar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin solicitudes pendientes.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardDescription>Equipo</CardDescription>
                  <CardTitle className="text-xl">Profesionales</CardTitle>
                </div>
                <UserCheck className="size-5 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["Diego Pérez", "Kinesiología", "3 visitas hoy"],
                  ["Andrea Silva", "Enfermería", "1 visita hoy"],
                  ["Camila Muñoz", "Nutrición", "Sin visitas hoy"],
                ].map(([name, role, detail]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {role} · {detail}
                      </p>
                    </div>
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
