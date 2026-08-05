# Normalizer

PWA de acceso a la justicia que conecta ciudadanos bolivianos (niños, adultos y personas mayores) con profesionales de apoyo jurídico y psicosocial verificados: mapa y geolocalización, reservas de visitas/llamadas, foro comunitario, botón de emergencias y el asistente determinista de FAQ **Ramon** (sin LLM).

## Documentación

- [Especificación de Requisitos del Sistema (SRS)](docs/SRS.md) — requisitos, casos de uso y modelo de datos conceptual.
- [Documento de Diseño de Software (SDD)](docs/SDD.md) — arquitectura, esquema SQL + RLS y lógica de negocio completa.

## Stack

Nuxt 4 (Vue 3) · Supabase (Auth, Postgres/PostGIS, Storage, Edge Functions) · Leaflet/OpenStreetMap · nuxt-i18n (es, qu, gn, en) · PWA

## Estado de implementación

Prototipo navegable implementado sobre datos mock (`server/data/mock.ts`) para que la app funcione sin configuración. El esquema real de Supabase y las Edge Functions están en `supabase/` (migraciones + funciones `reserve-booking` y `approve-specialist`).

| Área | Estado |
|---|---|
| Navegación, modos por edad (0–12 / 13–64 / 65+), scroller de edad | Implementado (mock) |
| Registro/login (email/password), tutor para menores, perfil profesional + aprobación admin | Implementado (localStorage mock) |
| Especialistas: búsqueda con filtros + mapa Leaflet | Implementado (mock) |
| Reservas (visita/llamada/videollamada) | Implementado (mock) |
| Comunidad (foro) | Implementado (mock) |
| Emergencias (`tel:110/119/118`) | Implementado |
| Ramon (FAQ determinista, sin LLM, i18n, enlaza contenido) | Implementado |
| Persistencia real vía Supabase (auth, Postgres+RLS, storage, edge functions) | Pendiente — requerida conexión de credenciales |

### Conectar Supabase

```bash
# .env
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Aplicar `supabase/migrations/0001_init.sql` y desplegar las Edge Functions con `supabase functions deploy`. Los `server/api/*` devuelven datos mock; reemplazar internamente por consultas a Supabase siguiendo las políticas RLS del SDD §4.3.

## Desarrollo

```bash
pnpm install        # instala y ejecuta `nuxt prepare` (genera .nuxt/ y tipos)
pnpm dev            # http://localhost:3000
pnpm build          # build de producción
pnpm generate       # exportación estática (despliegue CDN)
pnpm preview        # previsualiza el build
```

No hay scripts de test/lint/typecheck configurados; `pnpm build` incluye el typecheck de Nuxt.
