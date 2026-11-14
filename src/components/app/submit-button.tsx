"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingText = "Guardando...",
  className,
  variant,
  size,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "xs" | "icon-sm" | "icon-lg";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
