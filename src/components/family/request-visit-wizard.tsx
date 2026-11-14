"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Loader2,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { createRequest } from "@/app/actions/visits";
import type { FamilyVisit } from "@/lib/data/family";
import { disciplineMeta, type Discipline } from "@/lib/mock-data";
import { formatVisitDate, formatVisitTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type RequestType = "extra_visit" | "change" | "contact";

const typeOptions: Array<{
  id: RequestType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "extra_visit",
    title: "Visita extra",
    description: "Necesito una atención adicional este mes.",
    icon: CalendarDays,
  },
  {
    id: "change",
    title: "Cambio de visita",
    description: "Quiero mover o ajustar una visita ya agendada.",
    icon: ArrowRight,
  },
  {
    id: "contact",
    title: "Hablar con coordinación",
    description: "Tengo una duda o necesito orientación.",
    icon: MessageCircle,
  },
];

function toDateInput(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInput(value: string) {
  return formatVisitTime(value);
}

export function RequestVisitWizard({ visits }: { visits: FamilyVisit[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const open = searchParams.get("pedir") === "1";

  if (!open) return null;

  const typeParam = searchParams.get("type");
  const type: RequestType =
    typeParam === "change" || typeParam === "contact" ? typeParam : "extra_visit";
  const visitParam = searchParams.get("visit") ?? "";

  function close() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <WizardDialog
      key={`${type}-${visitParam}`}
      initialType={type}
      initialVisitId={visitParam}
      visits={visits}
      onClose={close}
    />
  );
}

function WizardDialog({
  initialType,
  initialVisitId,
  visits,
  onClose,
}: {
  initialType: RequestType;
  initialVisitId: string;
  visits: FamilyVisit[];
  onClose: () => void;
}) {
  const router = useRouter();
  const upcoming = useMemo(
    () =>
      visits.filter(
        (visit) => visit.status === "scheduled" || visit.status === "confirmed",
      ),
    [visits],
  );
  const initialVisit = upcoming.find((visit) => visit.id === initialVisitId);
  const [step, setStep] = useState(1);
  const [type, setType] = useState<RequestType>(initialType);
  const [visitId, setVisitId] = useState(initialVisit?.id ?? "");
  const [discipline, setDiscipline] = useState<Discipline>(
    initialVisit?.discipline ?? "kinesiologia",
  );
  const [preferredDate, setPreferredDate] = useState(
    initialVisit ? toDateInput(initialVisit.scheduledAt) : "",
  );
  const [preferredTime, setPreferredTime] = useState(
    initialVisit ? toTimeInput(initialVisit.scheduledAt) : "",
  );
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const selectedVisit = upcoming.find((visit) => visit.id === visitId);

  function selectVisit(id: string) {
    setVisitId(id);
    const visit = upcoming.find((item) => item.id === id);
    if (visit) {
      setDiscipline(visit.discipline);
      setPreferredDate(toDateInput(visit.scheduledAt));
      setPreferredTime(toTimeInput(visit.scheduledAt));
    }
  }

  function submit() {
    if (pending) return;

    if (!reason.trim()) {
      toast.error("Cuéntanos el motivo de la solicitud.");
      return;
    }

    if (type === "change" && !visitId) {
      toast.error("Selecciona la visita que quieres cambiar.");
      return;
    }

    const formData = new FormData();
    formData.set("type", type);
    formData.set("discipline", discipline);
    formData.set("preferred_date", preferredDate);
    formData.set("preferred_time", preferredTime);
    formData.set("reason", reason.trim());
    if (type === "change") formData.set("visit_id", visitId);

    startTransition(async () => {
      const result = await createRequest(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Solicitud enviada. Coordinación la revisará.");
      router.refresh();
      onClose();
    });
  }

  const canContinue =
    step === 1 || (step === 2 && (type !== "change" || Boolean(visitId)));

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-wizard-title"
    >
      <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border bg-background shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              Nueva solicitud
            </p>
            <h2 id="request-wizard-title" className="font-heading text-lg font-bold">
              ¿Qué necesitas?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b px-4 py-2">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                item <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === 1 && (
            <div className="grid gap-2">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const active = type === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setType(option.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                      active ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-primary",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{option.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                    {active && <Check className="mt-1 size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {type === "change" && (
                <label className="block space-y-1 text-xs font-medium">
                  Visita a cambiar
                  <select
                    value={visitId}
                    onChange={(event) => selectVisit(event.target.value)}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="">Selecciona una visita</option>
                    {upcoming.map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        {disciplineMeta[visit.discipline].label} · {visit.date}{" "}
                        {visit.time}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedVisit && (
                <div className="rounded-xl border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">{selectedVisit.professional}</p>
                  <p className="text-muted-foreground">
                    {disciplineMeta[selectedVisit.discipline].label} ·{" "}
                    {formatVisitDate(selectedVisit.scheduledAt)}{" "}
                    {formatVisitTime(selectedVisit.scheduledAt)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium">Disciplina</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    ["kinesiologia", "nutricion", "enfermeria", "aseo"] as Discipline[]
                  ).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDiscipline(item)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                        discipline === item
                          ? "border-primary bg-primary/5 font-medium"
                          : "hover:bg-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          disciplineMeta[item].dot,
                        )}
                      />
                      {disciplineMeta[item].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium">
                  Fecha preferida
                  <Input
                    type="date"
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                  />
                </label>
                <label className="space-y-1 text-xs font-medium">
                  Hora preferida
                  <Input
                    type="time"
                    value={preferredTime}
                    onChange={(event) => setPreferredTime(event.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="block space-y-1 text-xs font-medium">
                Motivo
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                  placeholder="Cuéntanos qué necesita Elena o qué quieres cambiar."
                />
              </label>

              <div className="rounded-2xl border bg-muted/30 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Resumen
                </p>
                <p className="mt-2 font-semibold">
                  {typeOptions.find((option) => option.id === type)?.title}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {disciplineMeta[discipline].label}
                  {preferredDate ? ` · ${preferredDate}` : ""}
                  {preferredTime ? ` · ${preferredTime}` : ""}
                </p>
                {selectedVisit && (
                  <p className="mt-1 text-muted-foreground">
                    Visita actual: {formatVisitDate(selectedVisit.scheduledAt)}{" "}
                    {formatVisitTime(selectedVisit.scheduledAt)}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  La coordinación responde en menos de 24 horas.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t p-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
              disabled={pending}
            >
              <ArrowLeft className="size-4" />
              Atrás
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() =>
                setStep((current) =>
                  current === 1 && type === "contact" ? 3 : current + 1,
                )
              }
              className={cn(buttonVariants(), "flex-1")}
              disabled={!canContinue}
            >
              Continuar
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className={cn(buttonVariants(), "flex-1")}
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
          )}
        </div>
      </div>
    </div>
  );
}
