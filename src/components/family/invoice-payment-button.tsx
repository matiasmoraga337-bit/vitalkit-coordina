"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import { PaymentResult } from "@/components/payments/payment-result";
import {
  SimulatedCardForm,
  type SimulatedPaymentInput,
  type SimulatedPaymentResponse,
} from "@/components/payments/simulated-card-form";
import { buttonVariants } from "@/components/ui/button";
import { payInvoice } from "@/app/actions/payments";
import { cn } from "@/lib/utils";

export function InvoicePaymentButton({
  invoiceId,
  amount,
  period,
}: {
  invoiceId: string;
  amount: number;
  period: string;
}) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState<{ reference: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setSuccess(null);
  }

  async function handlePayment(
    input: SimulatedPaymentInput,
  ): Promise<SimulatedPaymentResponse> {
    const formData = new FormData();
    formData.set("invoice_id", invoiceId);
    formData.set("card_last4", input.cardLast4);

    const result = await payInvoice(formData);

    if (result.ok && result.approved) {
      setSuccess({ reference: result.reference ?? "SIM-DEMO" });
      toast.success("Pago simulado aprobado.");
      router.refresh();
      return { ok: true, approved: true, reference: result.reference };
    }

    toast.error(result.error ?? "Pago rechazado.");
    return {
      ok: false,
      approved: false,
      error: result.error ?? "Pago rechazado.",
    };
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        <CreditCard className="size-4" />
        Pagar plan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-payment-title"
        >
          <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border bg-background p-4 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Pago simulado
                </p>
                <h2 id="invoice-payment-title" className="font-heading text-xl font-bold">
                  Pagar factura {period}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            {success ? (
              <PaymentResult
                approved
                amount={amount}
                reference={success.reference}
                title="Pago simulado aprobado"
                description="La factura quedó pagada y el plan sigue activo."
                actions={
                  <>
                    <Link href="/inicio" className={cn(buttonVariants({ size: "sm" }))}>
                      Ir al inicio
                    </Link>
                    <Link
                      href="/plan"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Ver plan
                    </Link>
                    <Link
                      href="/mensajes"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Hablar con coordinación
                    </Link>
                  </>
                }
              />
            ) : (
              <SimulatedCardForm amount={amount} onSubmit={handlePayment} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
