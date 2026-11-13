# Alcance del MVP

## Objetivo

Demostrar el loop de coordinación de VitalKit:

1. La familia pide una visita o un cambio.
2. La coordinación ve la solicitud y asigna un profesional.
3. El profesional hace check-in, completa la visita y deja una nota.
4. La familia ve el reporte.

La landing page vende el servicio; esta app demuestra que el servicio ocurre.

## Roles

### Familia
- Ver el plan y la próxima visita.
- Ver el calendario de visitas.
- Leer el reporte de una visita.
- Revisar el plan de cuidados.
- Pedir una visita extra o un cambio.
- Ver la factura simulada.

### Coordinación
- Ver el tablero del día.
- Ver visitas sin asignar.
- Asignar o reasignar un profesional.
- Revisar solicitudes pendientes.
- Ver el caso completo de una familia.
- Resolver incidencias.

### Profesional
- Ver su agenda.
- Ver el detalle de una visita.
- Hacer check-in y check-out.
- Escribir la nota de visita.
- Reportar una incidencia.

## Must-have

- Autenticación con tres cuentas demo.
- Datos seed de una familia, una coordinadora y dos profesionales.
- Vistas de familia, coordinación y profesional.
- Solicitud de visita extra.
- Asignación de profesional.
- Check-in/check-out y nota.
- Reporte visible para la familia.
- PWA instalable.
- Deploy público en Vercel.

## Fuera del MVP

- Pagos reales.
- App nativa iOS/Android.
- Videollamadas.
- IA o triage automático.
- Geolocalización.
- Integración con fichas clínicas.
- Verificación automática de antecedentes.
- Notificaciones por WhatsApp o SMS.
- Multiciudad.

## Regla de corte

Si el 24 de noviembre hay retraso:

1. Se elimina el chat.
2. Se elimina la factura simulada.
3. Se elimina el rol profesional completo y se simula desde coordinación.

Nunca se recorta el loop: pedir → asignar → ejecutar → reportar.

## Criterio de aceptación

- Una familia puede encontrar su próxima visita sin ayuda.
- Una familia puede pedir una visita extra sin ayuda.
- La coordinadora puede asignar la solicitud a un profesional.
- El profesional puede completar la visita y dejar una nota.
- La familia ve el reporte actualizado.
- La app funciona en un teléfono y en escritorio.
- El deploy público está disponible.
