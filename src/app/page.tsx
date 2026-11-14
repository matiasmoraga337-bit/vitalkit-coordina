import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { DisciplineStrip } from "@/components/landing/discipline-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CoverageChecker } from "@/components/landing/coverage-checker";
import { SavingsSimulator } from "@/components/landing/savings-simulator";
import { PlansSection } from "@/components/landing/plans-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LeadForm } from "@/components/landing/lead-form";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: { absolute: "VitalKit ? Cuidado coordinado a domicilio" },
  description:
    "Kinesiolog?a, nutrici?n, enfermer?a y aseo coordinados en un solo plan para familias de Puerto Montt.",
  openGraph: {
    title: "VitalKit ? Cuidado coordinado a domicilio",
    description:
      "Un equipo coordinado, una agenda compartida y una sola factura para el cuidado de tu familia.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <LandingHeader />
      <main id="contenido">
        <LandingHero />
        <DisciplineStrip />
        <HowItWorks />
        <CoverageChecker />
        <SavingsSimulator />
        <PlansSection />
        <FaqSection />

        <section id="evaluacion" className="scroll-mt-20 border-b bg-muted/20">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Evaluación inicial sin costo
              </span>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Empieza a cuidar mejor, desde hoy.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Déjanos tus datos y la coordinación te contactará para conocer a
                la persona, resolver dudas y proponer un plan.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Sin costo y sin compromiso.",
                  "Evaluación inicial y plan de cuidados.",
                  "Profesionales verificados.",
                  "Una sola factura mensual.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-start gap-2 rounded-xl border bg-card p-3 text-xs leading-5 text-muted-foreground">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
                Tus datos se usan solo para contactarte. No compartimos
                información con terceros.
              </div>
            </div>
            <LeadForm />
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                ¿Ya eres parte del piloto?
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold">
                Entra a tu espacio de coordinación.
              </h2>
            </div>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Ingresar a la app
              <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
