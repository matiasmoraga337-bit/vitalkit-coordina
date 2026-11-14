import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Cuidado coordinado a domicilio para familias de Puerto Montt.
            Prototipo académico en validación.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Producto
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#incluye" className="hover:text-primary">Qué incluye</a></li>
            <li><a href="#planes" className="hover:text-primary">Planes</a></li>
            <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            App
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/demo" className="hover:text-primary">Probar demo</Link></li>
            <li><Link href="/login" className="hover:text-primary">Ingresar</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contacto
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Puerto Montt, Chile</li>
            <li>Prototipo académico</li>
            <li>Datos de demostración</li>
          </ul>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © 2026 VitalKit · Sin pacientes reales · Sin pagos reales
      </div>
    </footer>
  );
}
