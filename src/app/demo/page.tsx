import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  LayoutDashboard,
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
import { demoLogin } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const demos = [
  {
    role: "family",
    title: "Entrar como familia",
    description:
      "Carolina Rojas · plan Integral. Ve la próxima visita, el reporte y el plan de cuidado de Elena.",
    icon: UserRound,
    accent: "bg-sky-50 text-sky-700",
    cta: "Abrir vista familia",
  },
  {
    role: "coordinator",
    title: "Entrar como coordinadora",
    description:
      "Valentina Soto. Revisa el tablero del día, las solicitudes pendientes y las visitas sin asignar.",
    icon: LayoutDashboard,
    accent: "bg-teal-50 text-teal-700",
    cta: "Abrir tablero",
  },
  {
    role: "professional",
    title: "Entrar como profesional",
    description:
      "Diego Pérez · kinesiólogo. Revisa su agenda, la visita de hoy y el registro de atención.",
    icon: ClipboardCheck,
    accent: "bg-orange-50 text-orange-700",
    cta: "Abrir agenda",
  },
] as const;

export default function DemoPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Logo />
          </Link>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
            Modo demo
          </Badge>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Demo del MVP
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Elige un rol y prueba el flujo.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Los datos son de demostración. Cada botón inicia sesión con la cuenta
            demo del rol y abre su vista.
          </p>
        </div>

        <form action={demoLogin} className="mt-8 grid gap-4 md:grid-cols-3">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Card key={demo.role} className="flex h-full flex-col">
                <CardHeader>
                  <span className={cn("grid size-11 place-items-center rounded-xl", demo.accent)}>
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-3 text-lg">{demo.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {demo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <button
                    type="submit"
                    name="role"
                    value={demo.role}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    {demo.cta}
                    <ArrowRight className="size-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </form>

        <p className="mt-8 rounded-xl border border-dashed bg-muted/40 p-4 text-xs leading-5 text-muted-foreground">
          Esta demo usa las cuentas seed de Supabase. Para entrar con correo y
          contraseña, usa{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            la pantalla de login
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
