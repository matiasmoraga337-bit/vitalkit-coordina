# Modelo de datos

## Entidades

| Tabla | Propósito |
|---|---|
| `profiles` | Usuario de Supabase con rol: `family`, `coordinator`, `professional`, `admin`. |
| `households` | Hogar de la familia, comuna, dirección, plan y coordinador asignado. |
| `household_members` | Relación entre usuarios familiares y su hogar. |
| `elders` | Persona mayor beneficiaria: nombre, edad, condiciones y notas de cuidado. |
| `professionals` | Datos del profesional: disciplina, verificación, cobertura y disponibilidad. |
| `plans` | Planes Esencial, Integral y Premium con precios y visitas incluidas. |
| `subscriptions` | Plan activo de un hogar, estado y fecha de inicio. |
| `visits` | Visita programada: hogar, profesional, disciplina, fecha, estado y dirección. |
| `care_plans` | Objetivos, frecuencia, recomendaciones y próxima revisión. |
| `visit_reports` | Nota de la visita, resumen para la familia y fecha de cierre. |
| `requests` | Solicitud de visita extra, cambio o contacto. |
| `messages` | Mensajes entre familia y coordinación. |
| `incidents` | Incidencia reportada por el profesional o la familia. |
| `invoices` | Factura simulada del plan y las visitas extra. |
| `consents` | Consentimiento informado y autorización de datos. |

## Estados

### Visita

```text
scheduled → confirmed → in_progress → completed
                    ↘ cancelled
```

### Solicitud

```text
pending → approved
        ↘ rejected
```

### Incidencia

```text
open → in_review → resolved
```

## Reglas de acceso

- La familia ve solo su hogar, sus visitas, sus reportes y sus mensajes.
- La coordinadora ve los hogares que tiene asignados.
- El profesional ve solo sus visitas y los datos mínimos del hogar.
- El admin ve todo, pero no se usa en el MVP.
- Ninguna tabla clínica se expone al cliente sin RLS.

## Datos de demostración

- Familia Rojas: Carolina Rojas, Elena Rojas (78), plan Integral.
- Coordinadora: Valentina Soto.
- Profesionales: Diego Pérez (kinesiología), Andrea Silva (enfermería), Camila Muñoz (nutrición), Paula Díaz (aseo).
- Visitas: una confirmada, tres agendadas y una completada con reporte.
- Solicitud pendiente: kinesiología extra por dolor de rodilla.

## Privacidad

- Solo datos ficticios en demo.
- No se almacenan exámenes, diagnósticos ni datos clínicos sensibles.
- Las notas de visita son de coordinación, no un registro médico.
- El consentimiento se muestra en el onboarding.
