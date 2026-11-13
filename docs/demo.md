# Guion de demo

## Preparación

- Abrir la app en un teléfono o en una ventana angosta.
- Confirmar que el modo demo tenga datos cargados.
- Tener a mano las tres vistas: familia, coordinación y profesional.

## Guion de 2 minutos

### 1. Familia (30 s)

Carolina entra a `/inicio`.

- Ve la próxima visita: kinesiología, Diego Pérez, viernes 14 a las 10:30.
- Ve el último reporte y el plan de cuidados de Elena.
- Presiona “Pedir visita extra”.

### 2. Solicitud (20 s)

Carolina elige kinesiología y escribe:

> “Elena tuvo más dolor de lo habitual en la rodilla derecha.”

La solicitud queda en estado `pending`.

### 3. Coordinación (30 s)

Valentina entra a `/tablero`.

- Ve la solicitud pendiente.
- Revisa la agenda de Diego.
- Asigna la visita y confirma.

La solicitud pasa a `approved` y se crea una visita.

### 4. Profesional (25 s)

Diego entra a `/agenda`.

- Ve la visita asignada.
- Hace check-in.
- Completa la visita y escribe la nota.

La visita pasa a `completed` y se crea el reporte.

### 5. Cierre (15 s)

Carolina vuelve a `/inicio`.

- Ve el nuevo reporte.
- Califica la visita.

## Mensaje de cierre

> “Esto es lo que la landing no podía demostrar: la coordinación ocurre, queda registrada y la familia la ve.”

## Qué medir con las 5 personas

- ¿Encuentran la próxima visita sin ayuda?
- ¿Pueden pedir una visita extra sin ayuda?
- ¿Entienden el reporte?
- ¿Preferirían esto a WhatsApp?
- ¿Confiarían más al ver la agenda y el registro?
