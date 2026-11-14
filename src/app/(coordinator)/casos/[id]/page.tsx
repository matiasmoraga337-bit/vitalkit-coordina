import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Inbox,
  MessageCircle,
  Receipt,
  TriangleAlert,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { RequestStatusBadge, VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getCoordinatorCase } from "@/lib/data/coordinator";
import { disciplineMeta } from "@/lib/mock-data";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function CoordinatorCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireRole("coordinator");
  const data = await getCoordinatorCase(supabase, id);

  if (!data) notFound();

  const pendingRequests = data.requests.filter((request) => request.status === "pending");

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Caso"
          title={data.household.name}
          description={`${data.elder?.full_name ?? "Persona mayor"} · ${data.household.comuna}`}
          backHref="/casos"
          actions={
            <Link href={`/mensajes/${data.household.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <MessageCircle className="size-4" />
              Mensajes
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Plan</CardDescription>
              <CardTitle className="text-lg">{data.plan?.name ?? "Sin plan"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {data.plan ? `${formatCLP(data.plan.price_clp)} / mes` : "Sin suscripción"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Coordinación</CardDescription>
              <CardTitle className="text-lg">{data.coordinator}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {data.subscription?.status ?? "Sin suscripción"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visitas pendientes</CardDescription>
              <CardTitle className="text-lg">{data.visits.length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              {data.visits[0] ? `${data.visits[0].date} · ${data.visits[0].time}` : "Sin visitas"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Solicitudes pendientes</CardDescription>
              <CardTitle className="text-lg">{pendingRequests.length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="size-4 text-primary" />
              {pendingRequests.length ? "Requiere revisión" : "Todo al día"}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardDescription>Agenda</CardDescription>
              <CardTitle className="text-xl">Visitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.visits.length === 0 ? (
                <EmptyState icon={CalendarDays} title="Sin visitas" description="No hay visitas pendientes para este hogar." />
              ) : (
                data.visits.map((visit) => (
                  <Link key={visit.id} href={`/visitas/${visit.id}`} className="group block">
                    <div className="flex flex-col gap-3 rounded-xl border p-3 transition-colors group-hover:bg-muted/30 sm:flex-row sm:items-center">
                      <span className="w-16 shrink-0 rounded-lg bg-muted px-2 py-1 text-center text-sm font-semibold">
                        {visit.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{visit.professional}</p>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", disciplineMeta[visit.discipline].className)}>
                            {disciplineMeta[visit.discipline].label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {visit.elder} · {visit.date}
                        </p>
                      </div>
                      <VisitStatusBadge status={visit.status} />
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))
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
                {data.requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin solicitudes.</p>
                ) : (
                  data.requests.map((request) => (
                    <div key={request.id} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{disciplineMeta[request.discipline].label}</p>
                        <RequestStatusBadge status={request.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{request.date}</p>
                      <p className="mt-2 text-sm leading-6">{request.reason}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Seguimiento</CardDescription>
                <CardTitle className="text-xl">Plan de cuidados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {data.carePlan ? (
                  <>
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
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin plan registrado.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Excepciones</CardDescription>
                <CardTitle className="text-xl">Incidencias</CardTitle>
              </div>
              <TriangleAlert className="size-5 text-amber-600" />
            </CardHeader>
            <CardContent className="space-y-3">
              {data.incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin incidencias registradas.</p>
              ) : (
                data.incidents.map((incident) => (
                  <div key={incident.id} className="rounded-xl border p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">{incident.severity}</Badge>
                      <span className="text-xs text-muted-foreground">{incident.status}</span>
                    </div>
                    <p className="mt-2 text-sm">{incident.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Facturación</CardDescription>
                <CardTitle className="text-xl">Facturas</CardTitle>
              </div>
              <Receipt className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              {data.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin facturas emitidas.</p>
              ) : (
                data.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
                    <div>
                      <p className="font-semibold">{invoice.period}</p>
                      <p className="text-xs text-muted-foreground">{invoice.status}</p>
                    </div>
                    <p className="font-heading text-lg font-bold">{formatCLP(invoice.total_clp)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
