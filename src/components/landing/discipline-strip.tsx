import Image from "next/image";
import { disciplines } from "@/lib/landing-data";

export function DisciplineStrip() {
  return (
    <section id="incluye" className="scroll-mt-20 border-b bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Todo incluido
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Cuatro profesionales, un solo equipo.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Cada disciplina aporta una parte del cuidado. VitalKit coordina para
            que la familia no tenga que perseguir a nadie.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {disciplines.map((discipline) => (
            <article
              key={discipline.id}
              className="group overflow-hidden rounded-2xl border bg-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={discipline.image}
                  alt={discipline.name}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {discipline.short}
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold">
                  {discipline.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {discipline.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
