import { CheckCircle2, XCircle } from "lucide-react";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PaymentResult({
  approved,
  amount,
  reference,
  title,
  description,
  children,
  actions,
}: {
  approved: boolean;
  amount: number;
  reference?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <span
        className={cn(
          "mx-auto grid size-16 place-items-center rounded-full",
          approved ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
        )}
      >
        {approved ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
      </span>
      <h3 className="mt-4 font-heading text-2xl font-bold">
        {title ?? (approved ? "Pago simulado aprobado" : "Pago rechazado")}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description ??
          (approved
            ? "El pago se registró correctamente en la demostración."
            : "No se realizó ningún cambio. Puedes intentar con otra tarjeta.")}
      </p>
      <div className="mx-auto mt-5 max-w-sm rounded-2xl border bg-muted/30 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Monto</span>
          <span className="font-heading text-xl font-bold">{formatCLP(amount)}</span>
        </div>
        {reference && (
          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">Autorización</span>
            <span className="font-mono font-semibold">{reference}</span>
          </div>
        )}
      </div>
      {children && <div className="mt-5 text-left">{children}</div>}
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
