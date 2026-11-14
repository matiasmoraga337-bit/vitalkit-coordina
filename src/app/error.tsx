"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-bold">Algo salió mal</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No pudimos cargar esta sección. Intenta nuevamente.
        </p>
        <Button onClick={reset} className="mt-5">
          <RotateCcw className="size-4" />
          Reintentar
        </Button>
      </div>
    </main>
  );
}
