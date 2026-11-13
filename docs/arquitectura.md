# Arquitectura

## Stack

- Next.js 16 con App Router y TypeScript.
- Tailwind CSS 4.
- shadcn/ui con Base UI.
- Supabase Free: Postgres, Auth, Realtime y Storage.
- Vercel Hobby para deploy y previews.
- GitHub Actions para lint, typecheck y build.

## Rutas

```text
/                       Entrada y presentación del MVP
/demo                   Selector de rol
/inicio                 Vista familia
/tablero                Vista coordinación
/agenda                 Vista profesional
```

Rutas futuras:

```text
/calendario             Calendario familiar
/visitas/[id]           Detalle de visita
/solicitudes            Solicitudes familia/coordinación
/plan                   Plan de cuidados
/factura                Factura simulada
/casos/[id]             Caso de coordinación
/disponibilidad         Disponibilidad profesional
```

## Autenticación

- Supabase Auth con email y contraseña.
- Tres cuentas demo precargadas.
- `profiles.role` define el rol.
- Middleware de Next.js refresca la sesión y redirige según el rol.
- No hay registro público en el MVP; la coordinadora crea los hogares.

## Supabase

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el cliente.
- `SUPABASE_SERVICE_ROLE_KEY` solo en scripts locales de seed.
- RLS activo en todas las tablas.
- Migraciones SQL versionadas en `supabase/migrations/`.
- Tipos generados en `src/lib/supabase/database.types.ts`.

## PWA

- `app/manifest.ts` con iconos y `display: standalone`.
- Service worker básico para assets estáticos.
- Sin offline de datos en el MVP.
- Instalable en Android e iOS.

## Deploy

- `main` deploya a producción en Vercel.
- Cada PR genera un preview.
- Variables de entorno configuradas en Vercel.
- No se suben secretos al repositorio.
