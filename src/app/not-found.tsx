import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-6" />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-bold">Página no encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          La ruta que buscas no existe o no tienes acceso a ella.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-5")}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
