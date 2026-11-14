"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { updateAvailability } from "@/app/actions/availability";
import type { ProfessionalAvailabilityBlock } from "@/lib/data/professional";
import { cn } from "@/lib/utils";

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function AvailabilityForm({
  initialBlocks,
}: {
  initialBlocks: ProfessionalAvailabilityBlock[];
}) {
  const initialMap = new Map(initialBlocks.map((block) => [block.weekday, block]));
  const [blocks, setBlocks] = useState(() =>
    weekdays.map((_, weekday) => {
      const block = initialMap.get(weekday);
      return {
        weekday,
        active: block?.active ?? false,
        startTime: block?.startTime.slice(0, 5) ?? "09:00",
        endTime: block?.endTime.slice(0, 5) ?? "18:00",
      };
    }),
  );
  const [pending, startTransition] = useTransition();

  function updateBlock(weekday: number, patch: Partial<(typeof blocks)[number]>) {
    setBlocks((current) =>
      current.map((block) =>
        block.weekday === weekday ? { ...block, ...patch } : block,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const snapshot = blocks;

    startTransition(async () => {
      const result = await updateAvailability(formData);

      if (result?.error) {
        setBlocks(snapshot);
        toast.error(result.error);
        return;
      }

      toast.success("Disponibilidad actualizada.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {blocks.map((block) => (
        <div
          key={block.weekday}
          className="grid items-center gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_auto_auto_auto]"
        >
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name={`active_${block.weekday}`}
              checked={block.active}
              onChange={(event) =>
                updateBlock(block.weekday, { active: event.target.checked })
              }
              className="size-4 rounded border-input"
            />
            {weekdays[block.weekday]}
          </label>
          <Input
            name={`start_${block.weekday}`}
            type="time"
            value={block.startTime}
            onChange={(event) =>
              updateBlock(block.weekday, { startTime: event.target.value })
            }
            className="w-full sm:w-28"
          />
          <Input
            name={`end_${block.weekday}`}
            type="time"
            value={block.endTime}
            onChange={(event) =>
              updateBlock(block.weekday, { endTime: event.target.value })
            }
            className="w-full sm:w-28"
          />
          <span className="text-xs text-muted-foreground">hrs</span>
        </div>
      ))}
      <button
        type="submit"
        className={cn(buttonVariants(), "w-full")}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar disponibilidad"
        )}
      </button>
    </form>
  );
}
