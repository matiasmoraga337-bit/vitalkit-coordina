import { Plus } from "lucide-react";
import { faqs } from "@/lib/landing-data";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-b">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Resolvemos tus dudas.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Si te queda algo pendiente, puedes probar la app o solicitar una
            evaluación.
          </p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border bg-card p-4 open:bg-muted/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {faq.question}
                <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
