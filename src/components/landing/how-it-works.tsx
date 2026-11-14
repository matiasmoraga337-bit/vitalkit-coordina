import { ArrowRight, ClipboardList, Home, MessagesSquare, UserCheck } from "lucide-react";
import { steps } from "@/lib/landing-data";

const icons = [UserCheck, ClipboardList, Home, MessagesSquare];

export function HowItWorks() {
  return (
    <section id="como" className="scroll-mt-20 border-b">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Cómo funciona
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Cuidar bien, en 4 pasos.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Desde la primera conversación hasta el seguimiento de cada visita.
            </p>
          </div>
          <a
            href="#evaluacion"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Empezar ahora
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = icons[index] ?? ClipboardList;
            return (
              <article key={step.title} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-heading text-3xl font-bold text-muted-foreground/25">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
