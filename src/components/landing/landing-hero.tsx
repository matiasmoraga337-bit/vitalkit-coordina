import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck2, HeartHandshake } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trust = [
  { icon: BadgeCheck, label: "Profesionales verificados" },
  { icon: CalendarCheck2, label: "Agenda y seguimiento" },
  { icon: HeartHandshake, label: "Una sola factura" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(3,105,161,0.12),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(15,118,110,0.10),transparent_38%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Prototipo en validación · Puerto Montt
          </span>
          <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            Todos los cuidados de tu familia, en un solo plan.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Kinesiología, nutrición, enfermería y aseo coordinados en una
            suscripción mensual. Sin contratar por separado, sin coordinar
            horarios, sin sorpresas.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#evaluacion" className={cn(buttonVariants({ size: "lg" }))}>
              Solicitar evaluación
              <ArrowRight className="size-4" />
            </a>
            <Link href="/demo" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Probar la app
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[2rem] border bg-muted shadow-xl shadow-slate-900/10">
              <Image
                src="/landing/kine.webp"
                alt="Kinesiólogo atendiendo a domicilio"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border bg-muted">
              <Image
                src="/landing/nutri.webp"
                alt="Nutricionista"
                fill
                sizes="(max-width: 1024px) 45vw, 260px"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border bg-muted">
              <Image
                src="/landing/nurse.webp"
                alt="Enfermera a domicilio"
                fill
                sizes="(max-width: 1024px) 45vw, 260px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute -bottom-4 left-4 rounded-2xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur sm:left-6">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Un equipo coordinado
            </p>
            <p className="mt-0.5 font-heading text-lg font-bold">4 disciplinas, 1 plan</p>
          </div>
        </div>
      </div>
    </section>
  );
}
