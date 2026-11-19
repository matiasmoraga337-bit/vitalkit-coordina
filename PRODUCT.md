# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El usuario principal es el **familiar cuidador**: una hija, hijo u otro familiar responsable que coordina el cuidado de una persona mayor que vive en su casa. Usa la app desde el teléfono, muchas veces con poco tiempo y bajo estrés, para entender qué está pasando, qué viene después, pedir cambios y pagar sin tener que perseguir a distintos prestadores.

La coordinadora y los profesionales usan vistas internas para asignar, ejecutar y documentar el cuidado. La persona mayor puede estar presente durante el uso, pero no es la operadora principal de la app.

## Product Purpose

VitalKit coordina cuidado domiciliario multidisciplinario en una sola suscripción mensual. El producto existe para que una familia pueda cuidar a una persona mayor sin contratar y coordinar por separado kinesiología, nutrición, enfermería y aseo especializado.

El éxito para la familia es entender en menos de un minuto **qué está pasando y cuál es el siguiente paso**, y poder actuar sin ambigüedad.

## Positioning

Un solo equipo coordinado, un solo plan, una sola agenda y una sola factura para el cuidado en casa. La diferencia no es tener más prestadores, sino eliminar la coordinación dispersa entre ellos.

## Operating Context

- Piloto en Puerto Montt y Alerce, Chile.
- La familia paga un plan mensual y coordina el cuidado de una persona mayor.
- La coordinación evalúa, define el plan de cuidados, agenda visitas y hace seguimiento.
- Los profesionales registran visitas y reportes.
- La app se usa principalmente en mobile web/PWA.
- Los datos actuales son de demostración y no corresponden a pacientes reales.

## Capabilities and Constraints

- Planes Esencial, Integral y Premium, con distintas cantidades de visitas por disciplina.
- Flujo familiar: inicio, calendario, mensajes, plan de cuidados, solicitudes y factura.
- Flujo de coordinación y flujo profesional con vistas separadas.
- Checkout público con pago simulado. Se piden **nombre del paciente** y **nombre del familiar o contacto responsable**, además de correo, teléfono y comuna.
- Decisión delegada para la demo: el checkout **no crea una cuenta real**. Registra la solicitud y el pago simulado; coordinación contacta a la familia para la evaluación inicial. La pantalla de éxito debe mostrar con claridad qué sigue y ofrecer una entrada a la demo.
- En `/demo/flujo-completo`, el plan de cuidado es una **propuesta inicial editable**: el familiar puede redistribuir el total de visitas del paquete entre disciplinas. El total contratado es el único límite.
- El pago no debe presentarse como cobro real. No se guardan datos completos de tarjeta; solo los últimos cuatro dígitos.
- No hay registro público de cuentas ni historial clínico real.
- El idioma del producto es español.
- Stack existente: Next.js 16, TypeScript, Tailwind 4, Supabase y Vercel.

## Brand Commitments

- Nombre: **VitalKit**.
- Voz cercana, clara y tranquila. Evitar lenguaje clínico frío, alarmismo y jerga operativa.
- La confianza se construye mostrando el proceso, no prometiendo resultados médicos.
- La fotografía existente de profesionales reales es parte de la identidad de la landing.
- No inventar testimonios, clientes, benchmarks ni claims clínicos.

## Evidence on Hand

- Landing con fotografías de las cuatro disciplinas en `public/landing/`.
- Datos seed de la familia Rojas y Elena Rojas en Supabase.
- Planes, precios, agenda, visitas, reportes, solicitudes y factura simulada ya implementados.
- No hay testimonios, casos reales ni métricas de resultados verificadas.

## Product Principles

1. **Un solo siguiente paso.** Cada pantalla debe dejar claro qué hacer ahora, sin competir con cinco acciones.
2. **El proceso se ve.** Evaluación, plan, visitas y seguimiento deben formar una secuencia comprensible, no secciones aisladas.
3. **Lenguaje de familia.** Nombrar las cosas como las diría un familiar, no como las diría un sistema interno.
4. **Confianza sin ruido.** Mostrar estado, fecha, responsable y costo cuando importan; ocultar lo que no cambia la decisión.
5. **La familia mantiene el control.** Pedir ayuda, cambiar una visita o hablar con coordinación debe estar siempre a la vista.

## Accessibility & Inclusion

- Objetivo WCAG 2.2 AA.
- Textos legibles, controles táctiles cómodos y navegación por teclado.
- No depender solo del color para comunicar estado.
- Respetar `prefers-reduced-motion`.
- La interfaz debe funcionar para personas mayores y familiares con poca familiaridad tecnológica.
