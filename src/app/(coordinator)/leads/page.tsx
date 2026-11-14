import { CreditCard, Mail, Phone, UserPlus } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/app/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getLeadsCached } from "@/lib/data/leads";
import { updateLeadStatus } from "@/app/actions/leads";
import { formatCLP, formatRelativeDate } from "@/lib/format";
import { planById, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const instant = false;

const statusLabel: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  converted: "Convertido",
  discarded: "Descartado",
};

const statusClass: Record<string, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-amber-100 text-amber-800",
  converted: "bg-emerald-100 text-emerald-800",
  discarded: "bg-muted text-muted-foreground",
};

export default async function LeadsPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("leads");

  await requireRole("coordinator");
  const leads = await getLeadsCached();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Leads"
        title="Solicitudes desde la landing"
        description="Personas que pidieron una evaluación inicial desde el sitio."
        backHref="/tablero"
        actions={<Badge variant="outline" className="rounded-full">{leads.length} leads</Badge>}
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Sin leads todavía"
          description="Cuando alguien envíe el formulario de evaluación aparecerá aquí."
        />
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => {
            const plan = lead.plan_id ? planById[lead.plan_id as PlanId] : null;
            const needs = Object.entries(lead.needs ?? {})
              .filter(([, value]) => value)
              .map(([key]) => key);

            return (
              <Card key={lead.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardDescription>{formatRelativeDate(lead.created_at)}</CardDescription>
                    <CardTitle className="text-xl">{lead.name}</CardTitle>
                  </div>
                  <Badge className={cn("rounded-full", statusClass[lead.status])}>
                    {statusLabel[lead.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-foreground">
                      <Mail className="size-4 text-primary" />
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-foreground">
                        <Phone className="size-4 text-primary" />
                        {lead.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {lead.comuna && <Badge variant="outline" className="rounded-full">{lead.comuna}</Badge>}
                    {plan && <Badge variant="outline" className="rounded-full">Plan {plan.name}</Badge>}
                    {needs.map((need) => (
                      <Badge key={need} variant="outline" className="rounded-full">{need}</Badge>
                    ))}
                    {lead.paymentStatus === "approved" && (
                      <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        <CreditCard className="size-3" />
                        Pago simulado
                      </Badge>
                    )}
                  </div>
                  {lead.paymentStatus === "approved" && (
                    <p className="text-xs text-muted-foreground">
                      Autorización {lead.paymentReference ?? "SIM-DEMO"}
                      {lead.paymentAmount ? ` ? ${formatCLP(lead.paymentAmount)}` : ""}
                    </p>
                  )}
                  {lead.message && (
                    <p className="rounded-xl bg-muted/50 p-3 text-sm leading-6">{lead.message}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <form action={updateLeadStatus}>
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <input type="hidden" name="status" value="contacted" />
                      <SubmitButton variant="outline" size="sm" pendingText="Guardando...">
                        Marcar contactado
                      </SubmitButton>
                    </form>
                    <form action={updateLeadStatus}>
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <input type="hidden" name="status" value="converted" />
                      <SubmitButton size="sm" pendingText="Guardando...">
                        Convertir
                      </SubmitButton>
                    </form>
                    <form action={updateLeadStatus}>
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <input type="hidden" name="status" value="discarded" />
                      <SubmitButton variant="ghost" size="sm" pendingText="Guardando...">
                        Descartar
                      </SubmitButton>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}