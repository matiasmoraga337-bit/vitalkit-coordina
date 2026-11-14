"use client";

import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/plans";

export function PlanCta({
  planId,
  variant = "default",
  label = "Elegir plan",
}: {
  planId: PlanId;
  variant?: "default" | "outline";
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("vitalkit:select-plan", { detail: planId }),
        );
        document.getElementById("evaluacion")?.scrollIntoView({ behavior: "smooth" });
      }}
      className={cn(buttonVariants({ variant }), "w-full")}
    >
      {label}
      <ArrowRight className="size-4" />
    </button>
  );
}
