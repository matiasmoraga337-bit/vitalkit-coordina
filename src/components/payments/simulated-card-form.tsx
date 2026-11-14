"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SimulatedPaymentInput = {
  cardLast4: string;
};

export type SimulatedPaymentResponse = {
  ok: boolean;
  error?: string;
  approved?: boolean;
  reference?: string;
};

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function SimulatedCardForm({
  amount,
  onSubmit,
  submitLabel,
  className,
}: {
  amount: number;
  onSubmit: (input: SimulatedPaymentInput) => Promise<SimulatedPaymentResponse>;
  submitLabel?: string;
  className?: string;
}) {
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function fillTestCard(last4: string) {
    setNumber(`4242 4242 4242 ${last4}`);
    setHolder("Carolina Rojas");
    setExpiry("12/30");
    setCvv("123");
    setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const digits = number.replace(/\D/g, "");
    const expiryDigits = expiry.replace(/\D/g, "");

    if (digits.length !== 16) {
      setError("Ingresa los 16 dígitos de la tarjeta.");
      return;
    }
    if (!holder.trim()) {
      setError("Ingresa el nombre del titular.");
      return;
    }
    if (expiryDigits.length !== 4) {
      setError("Ingresa el vencimiento MM/AA.");
      return;
    }
    if (cvv.replace(/\D/g, "").length < 3) {
      setError("Ingresa un CVV válido.");
      return;
    }

    setError(null);
    setPending(true);
    try {
      const result = await onSubmit({ cardLast4: digits.slice(-4) });
      if (!result.ok && result.error) setError(result.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)}>
      <div className="rounded-2xl border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total a pagar
            </p>
            <p className="mt-1 font-heading text-3xl font-bold">{formatCLP(amount)}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          Pago simulado. No se realizará ningún cobro real y no se guardan los
          datos completos de la tarjeta.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fillTestCard("4242")}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Usar tarjeta aprobada
        </button>
        <button
          type="button"
          onClick={() => fillTestCard("0002")}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Probar rechazo
        </button>
      </div>

      <label className="block space-y-1 text-xs font-medium">
        Número de tarjeta
        <Input
          value={number}
          onChange={(event) => setNumber(formatCardNumber(event.target.value))}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
        />
      </label>

      <label className="block space-y-1 text-xs font-medium">
        Nombre del titular
        <Input
          value={holder}
          onChange={(event) => setHolder(event.target.value)}
          autoComplete="cc-name"
          placeholder="Como aparece en la tarjeta"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1 text-xs font-medium">
          Vencimiento
          <Input
            value={expiry}
            onChange={(event) => setExpiry(formatExpiry(event.target.value))}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
          />
        </label>
        <label className="block space-y-1 text-xs font-medium">
          CVV
          <Input
            value={cvv}
            onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          submitLabel ?? `Pagar ${formatCLP(amount)}`
        )}
      </button>
    </form>
  );
}
