# VitalKit Coordina

PWA de coordinación de cuidado domiciliario para familias de Puerto Montt. Conecta a la familia, la coordinación y los profesionales en un solo flujo: plan, agenda, visitas y reportes.

> MVP académico del Hito 3. Datos de demostración, sin pacientes reales.

## Estado

- [x] Repositorio y scaffold Next.js
- [x] Sistema visual y vistas demo de los tres roles
- [x] Documentación de alcance, datos, demo y arquitectura
- [ ] Supabase: schema, RLS y seed
- [ ] Autenticación y selector de rol real
- [ ] Solicitud → asignación → check-in → reporte persistente
- [x] PWA: manifest y service worker básico
- [ ] Deploy en Vercel
- [ ] Validación con 5 personas

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
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # desarrollo
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # build de producción
npm run check      # lint + typecheck + build
```

## Rutas

| Ruta | Rol | Estado |
|---|---|---|
| `/` | Entrada | Lista |
| `/demo` | Selector de rol | Lista |
| `/inicio` | Familia | Demo estática |
| `/tablero` | Coordinación | Demo estática |
| `/agenda` | Profesional | Demo estática |

## Estructura

```text
src/
  app/
    (family)/inicio/
    (coordinator)/tablero/
    (professional)/agenda/
    demo/
  components/
    app/
    brand/
    ui/
  lib/
docs/
```

## Roles

- **Familia:** plan, próxima visita, reporte, plan de cuidados y solicitudes.
- **Coordinación:** tablero del día, solicitudes, asignación y profesionales.
- **Profesional:** agenda, visita, check-in/out y nota.

## Documentación

- [Alcance del MVP](docs/alcance.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Guion de demo](docs/demo.md)
- [Arquitectura](docs/arquitectura.md)
- [Recursos gratuitos](docs/recursos.md)

## Entregables H2

El informe, la presentación y el prototipo de landing del Hito 2 se mantienen fuera de este repositorio para no mezclar la app con los entregables académicos. Enlace público pendiente.

## Seguridad

- No se commitean `.env.local`, tokens ni claves de servicio.
- La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en scripts locales de seed.
- La demo usa datos ficticios.
- RLS se activa en todas las tablas cuando se conecte Supabase.
- No se almacenan datos clínicos sensibles.

## Próximo hito

1. Crear el proyecto Supabase y aplicar migraciones.
2. Conectar autenticación y las tres cuentas demo.
3. Persistir solicitudes, asignaciones, visitas y reportes.
4. Agregar PWA y deploy.
5. Validar el flujo con cinco personas.
