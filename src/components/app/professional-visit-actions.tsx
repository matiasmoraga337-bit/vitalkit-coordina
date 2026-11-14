"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { Loader2, NotebookPen, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { completeVisit, startVisit } from "@/app/actions/visits";
import type { VisitStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ProfessionalVisitActions({
  visitId,
  initialStatus,
}: {
  visitId: string;
  initialStatus: VisitStatus;
}) {
  const [status, setStatus] = useState<VisitStatus>(initialStatus);
  const [pendingAction, setPendingAction] = useState<"checkin" | "note" | null>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  function handleCheckIn() {
    if (pendingAction) return;
    const previous = status;
    flushSync(() => setStatus("in_progress"));
    setPendingAction("checkin");

    const formData = new FormData();
    formData.set("visit_id", visitId);

    void startVisit(formData)
      .then((result) => {
        if (result?.error) {
          setStatus(previous);
          toast.error(result.error);
          return;
        }
        toast.success("Check-in registrado.");
        router.refresh();
      })
      .finally(() => setPendingAction(null));
  }

  function handleComplete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingAction || !note.trim()) return;

    const previous = status;
    flushSync(() => setStatus("completed"));
    setPendingAction("note");

    const formData = new FormData();
    formData.set("visit_id", visitId);
    formData.set("summary", note.trim());

    void completeVisit(formData)
      .then((result) => {
        if (result?.error) {
          setStatus(previous);
          toast.error(result.error);
          return;
        }
        toast.success("Visita completada y reporte guardado.");
        setNote("");
        router.refresh();
      })
      .finally(() => setPendingAction(null));
  }

  if (status === "completed") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        Visita completada. El reporte ya está disponible para la familia.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {status !== "in_progress" && (
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={pendingAction !== null}
          className={cn(buttonVariants(), "w-full")}
          aria-busy={pendingAction === "checkin"}
        >
          {pendingAction === "checkin" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <PlayCircle className="size-4" />
              Hacer check-in
            </>
          )}
        </button>
      )}

      <details className="rounded-xl border p-3" open={status === "in_progress"}>
        <summary className="cursor-pointer text-sm font-semibold text-primary">
          Escribir nota de visita
        </summary>
        <form onSubmit={handleComplete} className="mt-3 space-y-2">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required
            rows={3}
            placeholder="Resumen de la visita, avances y recomendaciones."
          />
          <button
            type="submit"
            className={cn(buttonVariants({ size: "sm" }), "w-full")}
            disabled={pendingAction !== null}
            aria-busy={pendingAction === "note"}
          >
            {pendingAction === "note" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <NotebookPen className="size-4" />
                Guardar y completar
              </>
            )}
          </button>
        </form>
      </details>
    </div>
  );
}
