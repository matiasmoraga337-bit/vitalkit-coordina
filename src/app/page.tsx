import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardCheck,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const roles = [
  {
    title: "Familia",
    description:
      "Ve el plan, la próxima visita, el reporte y pide cambios sin perseguir a nadie por WhatsApp.",
    href: "/inicio",
    icon: UserRound,
    accent: "bg-sky-50 text-sky-700",
  },
  {
    title: "Coordinación",
    description:
      "Asigna profesionales, resuelve solicitudes y detecta visitas sin cubrir en un solo tablero.",
    href: "/tablero",
    icon: LayoutDashboard,
    accent: "bg-teal-50 text-teal-700",
  },
  {
    title: "Profesional",
    description:
      "Revisa su agenda, hace check-in, completa la visita y deja la nota para la familia.",
    href: "/agenda",
    icon: ClipboardCheck,
    accent: "bg-orange-50 text-orange-700",
  },
];

const flow = [
  {
    title: "La familia pide",
    detail: "Una visita extra o un cambio de horario desde la app.",
    icon: HeartHandshake,
  },
  {
    title: "Coordinación asigna",
    detail: "Ve la solicitud, elige profesional y confirma la visita.",
    icon: CalendarCheck2,
  },
  {
    title: "El profesional ejecuta",
    detail: "Check-in, nota de visita y reporte visible para la familia.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Logo />
          </Link>
          <Badge variant="outline" className="ml-1 hidden rounded-full text-[10px] uppercase tracking-wide sm:inline-flex">
            MVP en construcción
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/demo"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
            >
              Ver demo
            </Link>
            <Link href="/inicio" className={buttonVariants({ size: "sm" })}>
              Entrar
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge className="rounded-full bg-sky-50 text-sky-800 hover:bg-sky-50">
                <Sparkles className="size-3.5" />
                PWA para coordinar cuidado domiciliario
              </Badge>
              <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                La coordinación del cuidado, en una sola app.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                VitalKit Coordina conecta a la familia, la coordinadora y los
                profesionales: agenda compartida, visitas con seguimiento y un
                reporte claro después de cada atención.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className={buttonVariants({ size: "lg" })}>
                  Probar el flujo demo
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/inicio"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Entrar como familia
                </Link>
              </div>
              <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3 text-sm">
                {[
                  ["3", "roles conectados"],
                  ["1", "agenda compartida"],
                  ["1", "reporte por visita"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border bg-card p-3">
                    <dt className="font-heading text-2xl font-bold text-foreground">
                      {value}
                    </dt>
                    <dd className="mt-0.5 text-xs leading-4 text-muted-foreground">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Card className="overflow-hidden border-sky-100 bg-linear-to-br from-sky-50 via-white to-teal-50">
              <CardHeader className="pb-3">
                <CardDescription>Vista rápida · Familia Rojas</CardDescription>
                <CardTitle className="text-xl">Próxima visita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Kinesiología
                      </p>
                      <p className="mt-1 font-heading text-lg font-bold">
                        Diego Pérez
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      Confirmada
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-muted/60 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Fecha</p>
                      <p className="font-semibold">Vie 14 nov</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Hora</p>
                      <p className="font-semibold">10:30</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed bg-card/60 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Último reporte</p>
                  <p className="mt-1 leading-6">
                    “Elena completó la rutina de movilidad sin dolor. Se
                    ajustaron dos ejercicios para la semana.”
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Tres roles, un solo flujo
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
                Cada persona ve lo que necesita.
              </h2>
            </div>
            <Link
              href="/demo"
              className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
            >
              Cambiar de rol →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link key={role.title} href={role.href} className="group">
                  <Card className="h-full transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
                    <CardHeader>
                      <span className={cn("grid size-10 place-items-center rounded-xl", role.accent)}>
                        <Icon className="size-5" />
                      </span>
                      <CardTitle className="mt-3 text-lg">{role.title}</CardTitle>
                      <CardDescription className="leading-6">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Ver vista
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                El loop del MVP
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
                Pedir, asignar y cerrar la visita.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                La landing vende; la app demuestra que la coordinación ocurre.
                Este es el flujo que vamos a probar con las cinco familias.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {flow.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Paso {index + 1}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>VitalKit Coordina · MVP académico · datos de demostración</p>
          <p>Next.js + Supabase · PWA</p>
        </div>
      </footer>
    </div>
  );
}
