"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { RequestStatusBadge } from "@/components/app/status-badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { approveRequest } from "@/app/actions/visits";
import type {
  CoordinatorProfessional,
  CoordinatorRequest,
} from "@/lib/data/coordinator";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  extra_visit: "Visita extra",
  change: "Cambio",
  contact: "Contacto",
};

export function CoordinatorPendingRequests({
  initialRequests,
  professionals,
}: {
  initialRequests: CoordinatorRequest[];
  professionals: CoordinatorProfessional[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    request: CoordinatorRequest,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const optimistic = requests;

    flushSync(() => {
      setRequests((current) => current.filter((item) => item.id !== request.id));
    });
    setPendingId(request.id);

    void approveRequest(formData)
      .then((result) => {
        if (result?.error) {
          setRequests(optimistic);
          toast.error(result.error);
          return;
        }
        toast.success("Solicitud actualizada.");
        router.refresh();
      })
      .finally(() => setPendingId(null));
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Sin solicitudes pendientes"
        description="Todo está asignado por ahora."
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const available = professionals.filter(
          (professional) => professional.discipline === request.discipline,
        );
        const pending = pendingId === request.id;

        return (
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
            {request.visitLabel && (
              <p className="mt-2 rounded-lg bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                Visita vinculada: {request.visitLabel}
              </p>
            )}
            <form
              onSubmit={(event) => handleSubmit(event, request)}
              className="mt-3 space-y-2"
            >
              <input type="hidden" name="request_id" value={request.id} />
              {request.type !== "contact" && (
                <>
                  <select
                    name="professional_id"
                    required
                    className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
                  >
                    <option value="">Selecciona profesional</option>
                    {available.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name}
                      </option>
                    ))}
                  </select>
                  <Input name="scheduled_at" type="datetime-local" required />
                </>
              )}
              <button
                type="submit"
                className={cn(buttonVariants({ size: "sm" }), "w-full")}
                disabled={pending}
                aria-busy={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Guardando...
                  </>
                ) : request.type === "contact" ? (
                  "Marcar atendido"
                ) : request.type === "change" ? (
                  "Confirmar cambio"
                ) : (
                  "Aprobar y asignar"
                )}
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
