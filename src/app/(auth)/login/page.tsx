import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardCheck, LayoutDashboard, UserRound } from "lucide-react";
import { SubmitButton } from "@/components/app/submit-button";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { demoLogin, login } from "@/app/actions/auth";

export const instant = false;

const demos = [
  { role: "family", label: "Familia", detail: "Carolina Rojas", icon: UserRound },
  {
    role: "coordinator",
    label: "Coordinación",
    detail: "Valentina Soto",
    icon: LayoutDashboard,
  },
  {
    role: "professional",
    label: "Profesional",
    detail: "Diego Pérez",
    icon: ClipboardCheck,
  },
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.25),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.2),transparent_42%)]" />
        <div className="relative">
          <Link href="/" className="inline-flex rounded-lg text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300">
            <Logo className="[&_span:last-child]:text-white" />
          </Link>
        </div>
        <div className="relative mt-auto max-w-lg">
          <Badge className="rounded-full bg-white/10 text-sky-100 hover:bg-white/10">
            MVP Hito 3
          </Badge>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight">
            La coordinación del cuidado, en una sola app.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Plan, agenda, visitas y reportes para la familia, la coordinación y
            los profesionales. Un solo flujo, una sola factura.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            {[
              "La familia ve qué pasa y cuándo.",
              "La coordinación asigna y resuelve.",
              "El profesional registra la visita.",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="size-2 rounded-full bg-sky-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="relative mt-10 text-xs text-slate-500">
          Datos de demostración · sin pacientes reales
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <Logo />
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Volver
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Entrar a VitalKit</CardTitle>
              <CardDescription>
                Usa una cuenta demo o tus credenciales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {error}
                </p>
              )}

              <form action={login} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.cl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <SubmitButton className="w-full" pendingText="Entrando...">
                  Entrar
                  <ArrowRight className="size-4" />
                </SubmitButton>
              </form>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  o entra como demo
                </span>
                <Separator className="flex-1" />
              </div>

              <form action={demoLogin} className="grid gap-2">
                {demos.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <button
                      key={demo.role}
                      type="submit"
                      name="role"
                      value={demo.role}
                      className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{demo.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {demo.detail}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </form>

              <p className="text-xs leading-5 text-muted-foreground">
                Las cuentas demo usan datos ficticios. No hay registro público en
                este MVP.
              </p>
            </CardContent>
          </Card>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </div>
  );
}
