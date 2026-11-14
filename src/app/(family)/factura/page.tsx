import Link from "next/link";
import { MessageCircle, Receipt } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { InvoicePaymentButton } from "@/components/family/invoice-payment-button";
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
import { requireRole } from "@/lib/auth";
import { getFamilyInvoicesCached } from "@/lib/data/family";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/utils";

export const instant = false;

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  overdue: "Vencida",
};

export default async function FamilyInvoicePage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-invoices");

  const { profile } = await requireRole("family");
  const invoices = await getFamilyInvoicesCached(profile.id);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Facturación"
          title="Tus facturas"
          description="Un solo cobro mensual por el plan y las visitas extra."
          backHref="/inicio"
        />

        {invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="Sin facturas" description="Cuando se emita el primer cobro aparecerá aquí." />
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardDescription>Período {invoice.period}</CardDescription>
                    <CardTitle className="text-xl">Factura mensual</CardTitle>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {statusLabel[invoice.status] ?? invoice.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="mt-1 font-semibold">{formatCLP(invoice.planAmount)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Visitas extra</p>
                      <p className="mt-1 font-semibold">{formatCLP(invoice.extrasAmount)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="mt-1 font-heading text-xl font-bold">{formatCLP(invoice.total)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>Emitida: {invoice.issuedAt}</p>
                    <p>Vencimiento: {invoice.dueAt ?? "Sin fecha"}</p>
                  </div>
                  <div className="space-y-2">
                    <InvoicePaymentButton
                      invoiceId={invoice.id}
                      amount={invoice.total}
                      period={invoice.period}
                    />
                    <Link
                      href="/mensajes"
                      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                    >
                      <MessageCircle className="size-4" />
                      ¿Dudas con tu factura? Hablar con coordinación
                    </Link>
                    <p className="text-center text-xs text-muted-foreground">
                      Pago simulado de demostración. No se realiza ningún cobro real.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}