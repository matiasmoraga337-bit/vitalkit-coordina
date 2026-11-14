"use client";

import Link from "next/link";
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
    <Link
      href={`/checkout?plan=${planId}`}
      className={cn(buttonVariants({ variant }), "w-full")}
    >
      {label}
      <ArrowRight className="size-4" />
    </Link>
  );
}
