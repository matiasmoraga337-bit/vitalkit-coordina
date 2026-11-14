"use client";

import { useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { Inbox, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { RequestStatusBadge } from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { createRequest } from "@/app/actions/visits";
import type { FamilyRequest } from "@/lib/data/family";
import { disciplineMeta, type Discipline } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  extra_visit: "Visita extra",
  change: "Cambio de visita",
  contact: "Contacto",
};

export function FamilyRequestsPanel({
  initialRequests,
  showForm = true,
}: {
  initialRequests: FamilyRequest[];
  showForm?: boolean;
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const discipline = String(formData.get("discipline") ?? "kinesiologia") as Discipline;
    const reason = String(formData.get("reason") ?? "").trim();
    const type = String(formData.get("type") ?? "extra_visit");

    if (!reason) {
      toast.error("Cuéntanos el motivo de la solicitud.");
      return;
    }

    const optimistic: FamilyRequest = {
      id: `optimistic-${Date.now()}`,
      type,
      discipline,
      requestedBy: "Tú",
      date: "Ahora",
      status: "pending",
      reason,
    };

    flushSync(() => {
      setRequests((current) => [optimistic, ...current]);
    });
    form.reset();

    startTransition(async () => {
      const result = await createRequest(formData);

      if (result?.error) {
        setRequests((current) =>
          current.filter((request) => request.id !== optimistic.id),
        );
        toast.error(result.error);
        return;
      }

      toast.success("Solicitud enviada.");
    });
  }

  return (
    <div className="space-y-3">
      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin solicitudes"
          description="Cuando pidas una visita extra o un cambio aparecerá aquí."
        />
      ) : (
        requests.map((request) => (
          <div key={request.id} className="rounded-xl border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {typeLabel[request.type] ?? "Solicitud"}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    disciplineMeta[request.discipline].className,
                  )}
                >
                  {disciplineMeta[request.discipline].label}
                </span>
              </div>
              <RequestStatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {request.requestedBy} · {request.date}
            </p>
            <p className="mt-2 text-sm leading-6">{request.reason}</p>
          </div>
        ))
      )}

      {showForm && (
        <details className="rounded-xl border p-3" open={requests.length === 0}>
          <summary className="cursor-pointer text-sm font-semibold text-primary">
            Pedir visita extra
          </summary>
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <label className="space-y-1 text-xs font-medium">
              Tipo
              <select
                name="type"
                defaultValue="extra_visit"
                className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
              >
                <option value="extra_visit">Visita extra</option>
                <option value="change">Cambio de visita</option>
                <option value="contact">Contacto con coordinación</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium">
              Disciplina
              <select
                name="discipline"
                required
                className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
              >
                <option value="kinesiologia">Kinesiología</option>
                <option value="nutricion">Nutrición</option>
                <option value="enfermeria">Enfermería</option>
                <option value="aseo">Aseo</option>
              </select>
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium">
                Fecha preferida
                <Input name="preferred_date" type="date" />
              </label>
              <label className="space-y-1 text-xs font-medium">
                Hora preferida
                <Input name="preferred_time" type="time" />
              </label>
            </div>
            <label className="space-y-1 text-xs font-medium">
              Motivo
              <Textarea
                name="reason"
                required
                rows={3}
                placeholder="Cuéntanos qué necesita Elena."
              />
            </label>
            <button
              type="submit"
              className={cn(buttonVariants({ size: "sm" }), "w-full")}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Enviar solicitud
                </>
              )}
            </button>
          </form>
        </details>
      )}
    </div>
  );
}
