# VitalKit Coordina

PWA de coordinación de cuidado domiciliario para familias de Puerto Montt. Conecta a la familia, la coordinación y los profesionales en un solo flujo: plan, agenda, visitas, mensajes y reportes.

> MVP académico del Hito 3. Datos de demostración, sin pacientes reales.

**Demo en vivo:** https://vitalkit-coordina.vercel.app

## Estado

- [x] Repositorio y scaffold Next.js
- [x] Sistema visual y vistas de los tres roles
- [x] Supabase: schema, RLS y seed
- [x] Autenticación y selector de rol real
- [x] Loop: solicitud → asignación → check-in → reporte
- [x] Calendario, plan de cuidados y factura simulada
- [x] Flujo familiar rediseñado con wizard y barra inferior
- [x] Solicitudes de cambio vinculadas a visitas
- [x] Casos, profesionales, reasignación y cancelación
- [x] Incidencias y verificación de profesionales
- [x] Chat familia ↔ coordinación
- [x] Disponibilidad profesional editable
- [x] PWA: manifest y service worker
- [x] Landing React en `/` con formulario de evaluaci?n
- [x] Leads reales y bandeja `/leads`
- [x] Tema claro por defecto con toggle a oscuro
- [x] Deploy en Vercel
- [ ] Validación con 5 personas (fuera del alcance actual)
- [ ] Informe y presentación (fuera del alcance actual)

## Stack

- Next.js 16 + TypeScript + App Router
- Tailwind CSS 4 + shadcn/ui
- Supabase Free: Postgres, Auth y Realtime
- Vercel Hobby
- GitHub Actions

## Empezar

```powershell
npm install
Copy-Item .env.example .env.local
# Completa las llaves de Supabase en .env.local
npm run seed
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) y usar los botones demo de `/demo` o `/login`. No necesitas escribir contraseña para la demo.

## Scripts

```bash
npm run dev        # desarrollo
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # build de producción
npm run check      # lint + typecheck + build
npm run seed       # crea usuarios y datos demo en Supabase
```

## Performance

- Autenticaci?n deduplicada con `getClaims` y `cache()`.
- `AppShell` persistente por layout; ya no se remonta en cada navegaci?n.
- Skeletons con `loading.tsx` y botones con estado pendiente.
- Chat y disponibilidad con actualizaci?n optimista.
- Contenido de p?ginas cacheado por sesi?n con `use cache: private` y prefetch priorizado.
- Dashboard familiar reducido a 3 consultas con selects anidados.
- Mediciones: contenido de nueva pantalla ~40?100 ms tras el prefetch; mensaje visible ~80 ms; cambio de disponibilidad ~40 ms.

## Supabase

- Proyecto: `vitalkit-coordina` (São Paulo).
- Migraciones en `supabase/migrations/`.
- Seed demo en `scripts/seed.mjs`.
- RLS activo en todas las tablas.
- La `SERVICE_ROLE_KEY` solo vive en `.env.local`; no se commitea.

## Rutas

| Ruta | Rol | Descripción |
|---|---|---|
| `/` | Público | Entrada |
| `/demo` | Público | Selector de rol demo |
| `/login` | Público | Login y cuentas demo |
| `/inicio` | Familia | Inicio, próxima visita y resumen |
| `/calendario` | Familia | Próximas visitas e historial |
| `/visitas/[id]` | Familia / profesional / coordinación | Detalle compartido de visita |
| `/solicitudes` | Familia | Visita extra, cambio y contacto |
| `/plan` | Familia | Plan de cuidados |
| `/factura` | Familia | Factura simulada |
| `/mensajes` | Familia / coordinación | Chat |
| `/mensajes/[householdId]` | Familia / coordinación | Hilo por hogar |
| `/tablero` | Coordinación | Tablero del día |
| `/casos` | Coordinación | Hogares del piloto |
| `/casos/[id]` | Coordinación | Caso completo |
| `/solicitudes-coordinacion` | Coordinación | Bandeja de solicitudes |
| `/profesionales` | Coordinación | Equipo, verificación y disponibilidad |
| `/calendario-coordinacion` | Coordinación | Agenda global |
| `/agenda` | Profesional | Agenda personal |
| `/visitas` | Profesional | Historial de visitas |
| `/disponibilidad` | Profesional | Disponibilidad semanal |

## Estructura

```text
src/
  app/
    (family)/
    (coordinator)/
    (professional)/
    (auth)/
    actions/
    visitas/[id]/
    mensajes/
  components/
    app/
    brand/
    ui/
  lib/
    auth/
    data/
    supabase/
docs/
supabase/
```

## Roles

- **Familia:** plan, próxima visita, calendario, reportes, solicitudes, factura y chat.
- **Coordinación:** tablero, casos, solicitudes, profesionales, calendario y chat.
- **Profesional:** agenda, historial, detalle de visita, incidencias y disponibilidad.

## Documentación

- [Alcance del MVP](docs/alcance.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Guion de demo](docs/demo.md)
- [Arquitectura](docs/arquitectura.md)
- [Recursos gratuitos](docs/recursos.md)
- [Deploy en Vercel](docs/deploy.md)

## Seguridad

- No se commitean `.env.local`, tokens ni claves de servicio.
- La `SERVICE_ROLE_KEY` solo se usa en scripts locales de seed.
- La demo usa datos ficticios.
- RLS activo en todas las tablas.
- No se almacenan datos clínicos sensibles.
