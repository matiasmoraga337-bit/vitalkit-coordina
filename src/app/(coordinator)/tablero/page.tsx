import Link from "next/link";
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
import { requireRole } from "@/lib/auth";
import { approveRequest } from "@/app/actions/visits";
import { getCoordinatorDashboard } from "@/lib/data/coordinator";
import { RequestStatusBadge, VisitStatusBadge } from "@/components/app/status-badge";
import { SubmitButton } from "@/components/app/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function CoordinatorDashboardPage() {
  const { supabase } = await requireRole("coordinator");
  const data = await getCoordinatorDashboard(supabase);
  const pendingRequests = data.requests.filter((request) => request.status === "pending");
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tablero de coordinación
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Tienes {data.stats.pendingVisits} visitas en agenda.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa lo que falta asignar, las solicitudes pendientes y las
              visitas en riesgo.
            </p>
          </div>
          <Badge className="w-fit rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="size-3.5" />
            {data.stats.unassigned}{" "}
            {data.stats.unassigned === 1 ? "visita sin asignar" : "visitas sin asignar"}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visitas en agenda</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data.stats.pendingVisits}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4 text-primary" />
              {data.stats.visitsToday} hoy ·{" "}
              {Math.max(data.stats.pendingVisits - data.stats.visitsToday, 0)} próximas
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sin asignar</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data.stats.unassigned}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleDashed className="size-4 text-amber-600" />
              {data.stats.unassigned > 0 ? "Requiere acción" : "Todo asignado"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Solicitudes pendientes</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data.stats.pendingRequests}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="size-4 text-primary" />
              {data.stats.pendingRequests > 0 ? "Requiere revisión" : "Sin pendientes"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Familias activas</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {data.stats.activeHouseholds}
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
              <Link href="/calendario-coordinacion" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Ver calendario
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.visits.map((visit) => (
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
                    <Link
                      href={`/visitas/${visit.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      aria-label="Ver visita"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {data.visits.length === 0 && (
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
                    <form action={approveRequest} className="mt-3 space-y-2">
                      <input type="hidden" name="request_id" value={request.id} />
                      <select
                        name="professional_id"
                        required
                        className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                      >
                        <option value="">Selecciona profesional</option>
                        {data.professionals
                          .filter(
                            (professional) =>
                              professional.discipline === request.discipline,
                          )
                          .map((professional) => (
                            <option key={professional.id} value={professional.id}>
                              {professional.name}
                            </option>
                          ))}
                      </select>
                      <Input
                        name="scheduled_at"
                        type="datetime-local"
                        required
                      />
                      <SubmitButton
                        size="sm"
                        className="w-full"
                        pendingText="Asignando..."
                      >
                        Aprobar y asignar
                      </SubmitButton>
                    </form>
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
                {data.professionals.map((professional) => (
                  <div key={professional.id} className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {professional.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{professional.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {disciplineMeta[professional.discipline].label} ·{" "}
                        {professional.visitsToday > 0
                          ? `${professional.visitsToday} visita(s) hoy`
                          : "Sin visitas hoy"}
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
    </>
  );
}