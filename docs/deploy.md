# Deploy en Vercel

## Requisitos

- Cuenta GitHub con acceso a `matiasmoraga337-bit/vitalkit-coordina`.
- Cuenta Vercel Free (Hobby).
- Proyecto Supabase `vitalkit-coordina` activo.

## Pasos

1. Entrar a [vercel.com](https://vercel.com) y elegir **Continue with GitHub**.
2. Autorizar a Vercel para acceder al repositorio.
3. Elegir **Add New → Project** e importar `vitalkit-coordina`.
4. Confirmar:
   - Framework: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`
5. Agregar variables de entorno de **Production** y **Preview**:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DEMO_PASSWORD
```

No agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel. Esa llave solo se usa localmente para el seed.

6. Presionar **Deploy**.
7. Abrir la URL `*.vercel.app` y probar:
   - `/login` con los botones demo.
   - `/inicio`, `/tablero` y `/agenda`.
   - El loop: pedir visita extra → aprobar → check-in → nota.

## CLI opcional

```powershell
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add DEMO_PASSWORD
npx vercel --prod
```

## Después del deploy

- Copiar la URL de producción en el README.
- Probar en un teléfono real.
- Verificar que el service worker y el manifest carguen.
- No usar datos reales de pacientes.
