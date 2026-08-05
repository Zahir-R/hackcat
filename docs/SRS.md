# Especificación de Requisitos del Sistema (SRS)

**Proyecto:** Plataforma de Acceso a la Justicia — Conexión Ciudadana–Profesional ("Normalizer")
**Estándar de Referencia:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018
**Dominio:** Acceso a la Justicia / LegalTech
**Entorno de Despliegue Target:** PWA (Client-Side Rendering) + Backend SaaS (Supabase)
**Estado:** Borrador v1.0

---

## 1. Introducción

### 1.1 Propósito

Este documento especifica los requisitos funcionales, no funcionales, de arquitectura e interfaz de la **Plataforma de Acceso a la Justicia** ("Normalizer"): una PWA que conecta a ciudadanos bolivianos (con foco inicial en Sucre, Chuquisaca) con profesionales de apoyo jurídico y psicosocial verificados, organizada en **tres modos por edad** (niños, adultos, personas mayores). La plataforma incluye geolocalización y mapa de especialistas, reservas de visitas y llamadas, un foro comunitario, un botón de emergencias y un asistente conversacional **determinista** basado en FAQ llamado **"Ramon"**.

El objetivo es guiar la implementación de un prototipo navegable y ejecutable durante la hackathon, priorizando costo bajo (capital semilla Bs. 9.500), sin dependencia de APIs de LLM.

### 1.2 Alcance del Sistema

El sistema permite:

1. **Registro por edad:** Creación de perfil con selector de edad tipo *slider* (8–100 años); el sistema deriva el **modo de la aplicación** (Niños 8–12, Adultos 13–64, Mayores 65–100) y adapta la interfaz y los flujos.
2. **Profesionales verificados:** Ciudadanos que sean profesionales de apoyo (abogados, psicólogos, trabajadores sociales, traductores/intérpretes, paralegales) completan un perfil profesional con currículum; un administrador lo aprueba o rechaza.
3. **Geolocalización y mapa:** Búsqueda de profesionales cercanos sobre un mapa con filtros por idiomas (incluida lengua de señas boliviana), experiencia y especialidad.
4. **Reservas:** Programación de **visitas presenciales, llamadas de voz o videollamadas** con profesionales (agenda por franjas horarias, sin llamadas dentro de la plataforma).
5. **Comunidad:** Foro con temas y respuestas, con moderación por administradores.
6. **Emergencias:** Botón de alerta con enlaces directos a números de emergencia bolivianos.
7. **Chatbot "Ramon":** Asistente determinista de FAQ que responde con contenido curado y **enlaza a contenido relacionado** (páginas, filtros de especialistas, temas del foro). **Explícitamente sin generación de lenguaje por IA.**

**Exclusiones explícitas del alcance:**

- No se genera lenguaje con LLM ni se usa ninguna API de modelo de lenguaje (el chatbot es determinista).
- No se realizan llamadas de voz/vídeo dentro de la plataforma; solo se **programan** (scheduling).
- El botón de emergencias no envía ubicación a servicios de emergencia; solo establece llamada telefónica (`tel:`).
- No incluye firma digital ni integración con pasarelas estatales (ej. Ciudadanía Digital).

### 1.3 Definiciones, Acrónimos y Abreviaturas

- **PWA (Progressive Web App):** Aplicación web instalable con Service Worker y soporte offline parcial.
- **CSR (Client-Side Rendering):** Renderizado de la interfaz en el navegador del cliente.
- **SaaS (Software as a Service):** Servicios externos gestionados (ej. Supabase).
- **RLS (Row-Level Security):** Políticas de seguridad a nivel de fila en Postgres.
- **Modo por edad:** Variante de la aplicación derivada de la edad del usuario (Niño/Adulto/Mayor).
- **Profesional:** Persona con perfil aprobado que ofrece apoyo (legal/psicosocial/traducción/paralegal).
- **Tutor:** Persona adulta que registra y consiente el acceso de un menor.
- **Ramon:** Asistente conversacional determinista de FAQ integrado en la PWA.
- **FAQ:** Preguntas frecuentes curadas, almacenadas en la base de datos con traducciones.
- **Franja de disponibilidad (slot):** Intervalo de tiempo ofrecido por un profesional para una reserva.
- **LSA (Lengua de Señas Boliviana):** Lengua de señas utilizada en Bolivia.

### 1.4 Referencias

- `bare_ideas.txt` — notas de producto (fuente original de la visión).
- `docs/SDD.md` — Documento de Diseño de Software (implementación y lógica detallada).
- Documentación de Nuxt 4: https://nuxt.com/docs
- Documentación de Supabase: https://supabase.com/docs

---

## 2. Descripción General

### 2.1 Perspectiva del Producto

El sistema es una PWA híbrida:

```text
+-------------------------------------------------------------+
|                  CAPA DE PRESENTACIÓN (Nuxt 4 / Vue 3)      |
|  [Inicio] [Mapa] [Especialistas] [Comunidad] [Emergencias]  |
|  [Widget Ramon (FAQ determinista)]  [Perfiles por edad]      |
+-------------------------------------------------------------+
                          |  HTTPS (Nitro server routes)
                          v
+-------------------------------------------------------------+
|              BACKEND COMO SERVICIO (Supabase)               |
|  [Auth email/password + tutores]   [Postgres + PostGIS + RLS]|
|  [Storage (CVs, avatares)]         [Edge Functions (reservas)]|
+-------------------------------------------------------------+
```

- **Frontend:** PWA CSR con Nuxt 4 (estructura `app/`). Desplegada como sitio estático.
- **Backend:** Supabase — autenticación, base de datos Postgres con PostGIS (geolocalización) y RLS, Storage para documentos, funciones edge para reglas sensibles (reservas, aprobación admin).
- **Mapas:** Leaflet + OpenStreetMap (sin API key).
- **i18n:** español, quechua, guaraní e inglés.

### 2.2 Funciones del Producto

- **Modo por edad:** registro con slider de edad (8–100); derivación de modo (8–12 / 13–64 / 65–100); UI y contenido adaptados.
- **Perfil ciudadano:** datos personales, preferencia de idioma, contactos de emergencia.
- **Flujo de tutor para menores:** consentimiento y vinculación tutor–menor.
- **Perfil profesional:** solicitud con currículum, aprobación por administrador, rol/especialidades/idiomas auto-asignados.
- **Mapa y listado de especialistas:** geolocalización, filtros combinados, vista en mapa y en lista.
- **Reservas:** gestión de franjas, reserva de visita/llamada/videollamada, estados de cita.
- **Comunidad:** foro con temas, respuestas y moderación.
- **Emergencias:** enlaces `tel:` a policía, bomberos y médicos.
- **Ramon:** menú de categorías FAQ, búsqueda por palabras clave, respuesta curada con enlace a contenido relacionado.
- **Administración:** aprobación/rechazo de profesionales, moderación de foro, gestión de FAQ.

### 2.3 Características de los Usuarios

| Actor | Descripción | Necesidades |
|---|---|---|
| Ciudadano niño (8–12) | Menor de edad; registrado y acompañado por un tutor | Interfaz sencilla, acceso al mapa/especialistas bajo supervisión del tutor, contenido de Ramon adecuado a su edad |
| Ciudadano adulto (13–64) | Usuario principal | Búsqueda, reservas, foro, Ramon |
| Persona mayor (65–100) | Usuario con posible limitación visual/motriz | Tipografía grande, alto contraste, área de toque ≥48px, flujos guiados |
| Tutor | Adulto que registra/consiente a un menor | Vinculación con el perfil del menor, control del consentimiento |
| Profesional | Abogado, psicólogo, trabajador social, traductor, paralegal | Perfil profesional, agenda, confirmación de reservas |
| Administrador | Miembro del equipo | Panel de aprobación, moderación, gestión de FAQ |

### 2.4 Modos por Edad

| Modo | Rango | Derivación | Comportamiento |
|---|---|---|---|
| `CHILD` | 8–12 | `birth_date` | Requiere tutor; contenido adaptado; reservas gestionadas por el tutor |
| `ADULT` | 13–64 | `birth_date` | Flujo completo sin tutela |
| `ELDER` | 65–100 | `birth_date` | Interfaz de accesibilidad reforzada (tipografía, contraste) |

La derivación es una **regla de negocio** (no un campo editable): `age_mode = f(birth_date, fecha actual)`.

### 2.5 Restricciones, Supuestos y Dependencias

- **Presupuesto:** capital semilla Bs. 9.500; priorizar servicios free-tier (Supabase) y librerías gratuitas.
- **Sin LLM:** el chatbot es determinista; no hay costos de inferencia.
- **Cobertura legal:** contenido curado orientativo, no constituye asesoría legal vinculante.
- **Conectividad:** se asume conexión a internet; la PWA mantiene offline parcial (FAQ en caché).
- **Dependencias externas:** Supabase (auth/db/storage), OpenStreetMap, navegador móvil con geolocalización y soporte `tel:`.

---

## 3. Requisitos de Interfaces Externas

### 3.1 Interfaz de Usuario (UI/UX)

- **UI-01:** La interfaz debe ser *Mobile-First*, responsiva desde 320px hasta 4K.
- **UI-02:** Área de toque mínima de 48×48px por botón/interactivo.
- **UI-03:** En modo `ELDER` se debe incrementar el tamaño base de tipografía (≥18px) y el contraste.
- **UI-04:** En modo `CHILD`, los textos deben usar lenguaje sencillo e iconografía abundante.
- **UI-05:** Navbar global con: **Inicio**, **Mapa**, **Especialistas**, **Comunidad**, **Emergencias** y botón flotante de **Ramon**.
- **UI-06:** El widget de Ramon debe ser accesible desde cualquier pantalla sin perder el estado de navegación.

### 3.2 Interfaz de Software

- **SW-01 (Auth):** Integración con Supabase Auth (email/password, verificación de email, reset de contraseña).
- **SW-02 (Base de datos):** Supabase Postgres + PostGIS; acceso solo a través de políticas RLS.
- **SW-03 (Storage):** Supabase Storage para currículums y avatares.
- **SW-04 (Mapas):** Leaflet + OpenStreetMap (renderizado en cliente, sin clave API).
- **SW-05 (Teléfono):** Enlaces `tel:` nativos (`tel:110`, `tel:119`, `tel:118`).
- **SW-06 (i18n):** nuxt-i18n con locales `es`, `qu`, `gn`, `en`.

### 3.3 Interfaces de Comunicación

- Cliente → Supabase vía HTTPS/REST con autenticación por sesión.
- Cliente → Supabase Edge Functions para operaciones transaccionales sensibles (reservas).
- Notificaciones por email (verificación, aprobación de profesional, confirmación de reserva).

---

## 4. Requisitos Funcionales

### 4.1 Módulo 0: Navegación General

- **RF-0.1:** La aplicación debe exponer una barra de navegación persistente con los destinos: Inicio, Mapa, Especialistas, Comunidad y Emergencias.
- **RF-0.2:** Un botón flotante debe abrir el widget de Ramon desde cualquier página.
- **RF-0.3:** Las rutas protegidas (perfil, reservas, administración) deben redirigir a autenticación si no hay sesión.

### 4.2 Módulo 1: Autenticación y Perfiles

- **RF-1.1:** El registro debe incluir un **slider de edad** (8–100 años) y credenciales email/contraseña.
- **RF-1.2:** Durante el registro, el usuario debe indicar mediante **casilla de verificación** si es profesional.
- **RF-1.3:** El sistema debe derivar el `age_mode` de la fecha de nacimiento (0–12 → `CHILD`, 13–64 → `ADULT`, 65+ → `ELDER`).
- **RF-1.4:** Si `age_mode = CHILD`, el registro **debe** requerir un tutor: el tutor crea su cuenta (adulta) y vincula al menor con consentimiento explícito.
- **RF-1.5:** El perfil de ciudadano debe permitir editar nombre mostrado, avatar, preferencia de idioma, teléfono y fecha de nacimiento (con re-derivación de `age_mode`).
- **RF-1.6:** Si el usuario marca "soy profesional", debe ser **redirigido a una página nueva** para completar su perfil profesional.

### 4.3 Módulo 2: Profesionales

- **RF-2.1:** El perfil profesional debe incluir: presentación, años de experiencia, ciudad, **currículum (archivo PDF)** y rol auto-asignado.
- **RF-2.2:** El profesional debe poder auto-asignarse **roles** del catálogo multi-profesión: abogado, psicólogo, trabajador social, traductor/intérprete, paralegal.
- **RF-2.3:** El profesional debe poder asignarse **especialidades** (según su rol) e **idiomas** (español, quechua, guaraní, inglés, lengua de señas boliviana — LSA).
- **RF-2.4:** Un perfil profesional recién creado queda en estado `PENDING` y **no es visible públicamente** hasta que un administrador lo apruebe.
- **RF-2.5:** El administrador puede aprobar (`APPROVED`) o rechazar (`REJECTED`) con motivo; el profesional recibe notificación por email.
- **RF-2.6:** Un profesional rechazado puede corregir su perfil y reenviar la solicitud (vuelve a `PENDING`).
- **RF-2.7:** Solo los perfiles `APPROVED` aparecen en el mapa, en "Especialistas" y en resultados de búsqueda.

### 4.4 Módulo 3: Mapa y Especialistas

- **RF-3.1:** La página "Mapa" debe mostrar un mapa con marcadores de profesionales aprobados cerca de la ubicación del usuario (con permiso) o de la ciudad configurada.
- **RF-3.2:** La página "Especialistas" debe listar los profesionales aprobados ordenados por distancia.
- **RF-3.3:** Los resultados deben filtrarse de forma combinada por:
  - **Idiomas** (español, quechua, guaraní, inglés, LSA),
  - **Experiencia** (años mínimos),
  - **Especialidad** (según rol),
  - **Rol** (tipo de profesional),
  - **Distancia** (radio máximo en km).
- **RF-3.4:** Al seleccionar un profesional se debe mostrar su perfil completo (presentación, experiencia, idiomas, especialidades, mapa de su ubicación) y un botón de reserva.
- **RF-3.5:** La geolocalización requiere consentimiento del usuario; si se deniega, usar la ciudad por defecto.

### 4.5 Módulo 4: Reservas

- **RF-4.1:** El profesional debe poder definir **franjas de disponibilidad** indicando fecha/hora, duración y modalidad: visita presencial (`VISIT`), llamada de voz (`VOICE`) o videollamada (`VIDEO`).
- **RF-4.2:** La disponibilidad debe mostrarse en la zona horaria local del usuario.
- **RF-4.3:** El ciudadano debe poder solicitar una reserva sobre una franja libre; una franja **no puede reservarse dos veces**.
- **RF-4.4:** El estado de una reserva evoluciona: `PENDING → CONFIRMED → COMPLETED` (o `CANCELLED` desde `PENDING`/`CONFIRMED`).
- **RF-4.5:** La reserva debe ser visible para el ciudadano y el profesional; el ciudadano puede cancelar mientras esté `PENDING`/`CONFIRMED`; el profesional puede confirmar o rechazar las pendientes.
- **RF-4.6:** Toda reserva debe generar una confirmación por email a ambas partes con los datos (fecha, hora, modalidad, medio de contacto).
- **RF-4.7:** La plataforma no aloja llamadas: para `VOICE`/`VIDEO` se intercambia el medio de contacto (número/teléfono) dentro del detalle de la reserva confirmada.

### 4.6 Módulo 5: Comunidad (Foro)

- **RF-5.1:** El foro debe permitir crear **temas** (título + cuerpo) y **respuestas** anidadas.
- **RF-5.2:** Solo usuarios autenticados pueden publicar; la lectura es pública.
- **RF-5.3:** Los usuarios deben poder **reportar** publicaciones inapropiadas.
- **RF-5.4:** El administrador debe poder ocultar (`HIDDEN`) temas/respuestas reportadas o inapropiadas, y bloquear temas (`LOCKED`).
- **RF-5.5:** Los temas ocultos no deben aparecer en la lista pública.

### 4.7 Módulo 6: Emergencias

- **RF-6.1:** La página "Emergencias" debe mostrar botones de alerta que inician llamada telefónica vía enlace `tel:`:
  - Policía: `tel:110`
  - Bomberos: `tel:119`
  - Emergencias médicas: `tel:118`
- **RF-6.2:** Cada botón debe mostrar el número de forma legible y confirmar antes de llamar.
- **RF-6.3:** La página debe incluir información local de apoyo (sedes SLIM, FELCV, Fiscalía, Defensoría) como datos de referencia.

### 4.8 Módulo 7: Chatbot "Ramon" (FAQ determinista)

- **RF-7.1:** El widget de Ramon debe presentar un **menú de categorías y preguntas frecuentes** como botones seleccionables.
- **RF-7.2:** Si el usuario escribe texto libre, el sistema debe **matchear** la consulta contra las palabras clave/aliases de los ítems de FAQ únicamente; **no** genera respuestas libres.
- **RF-7.3:** Cada respuesta de FAQ debe incluir: texto de respuesta curada, referencia a la pregunta y **un enlace a contenido relacionado**:
  - una página de la app (Mapa, Especialistas, Comunidad, Emergencias, Reservas),
  - una búsqueda pre-filtrada de especialistas (ej. `/especialistas?rol=abogado&idioma=qu`),
  - un tema del foro,
  - el perfil de un profesional.
- **RF-7.4:** Si no hay coincidencia suficiente, Ramon debe responder con un mensaje de fallback ("No entendí tu consulta") y **re-mostrar el menú**; nunca inventa contenido.
- **RF-7.5:** Los ítems de FAQ deben estar **restringidos por modo de edad** (los niños ven preguntas adaptadas; los mayores ven preguntas relevantes) y **traducidos** (es, qu, gn, en).
- **RF-7.6:** Los ítems de FAQ y sus traducciones deben ser gestionados por el administrador vía datos estructurados (CRUD admin).
- **RF-7.7:** Las interacciones con Ramon deben quedar registradas (sesión y mensajes) con referencia al ítem de FAQ servido.

### 4.9 Módulo 8: Administración

- **RF-8.1:** El panel de administración debe listar solicitudes de profesionales `PENDING` con su currículum descargable y permitir aprobar/rechazar con motivo.
- **RF-8.2:** El panel debe listar contenido reportado y permitir ocultar/restaurar temas y respuestas.
- **RF-8.3:** El panel debe permitir el CRUD de categorías y ítems de FAQ (incluido traducciones y restricción de edad).
- **RF-8.4:** Solo usuarios con rol `ADMIN` acceden al panel.

---

## 5. Casos de Uso

### UC-01: Registro de ciudadano (modo por edad)

- **Actores:** Ciudadano, Tutor (si el modo es `CHILD`).
- **Precondiciones:** Ninguna.
- **Flujo principal:**
  1. El usuario abre la app y selecciona "Registrarse".
  2. Ingresa su edad con el slider (8–100) y sus datos (email, contraseña, nombre, fecha de nacimiento).
  3. El sistema deriva `age_mode`.
  4. **Si `CHILD`:** el sistema solicita los datos del tutor; el tutor crea su cuenta y acepta el consentimiento de vinculación.
  5. El sistema crea el perfil y envía email de verificación.
  6. El usuario accede a la app en su modo.
- **Flujos alternativos:**
  - 4a. El tutor ya tiene cuenta: inicia sesión y vincula al menor con consentimiento.
  - 5a. El email no se verifica: el acceso completo queda restringido.
- **Postcondiciones:** Perfil creado con `age_mode` correcto; si menor, existe `guardian_link` con consentimiento aprobado.

### UC-02: Postulación de profesional

- **Actores:** Profesional.
- **Precondiciones:** Usuario autenticado con `is_professional = true`.
- **Flujo principal:**
  1. El usuario marca "soy profesional" en el registro (o desde su perfil).
  2. Es redirigido a la página de perfil profesional.
  3. Completa presentación, años de experiencia, ciudad, rol, especialidades, idiomas y sube su currículum.
  4. Guarda y envía la solicitud.
  5. El sistema crea `professional_profile` en estado `PENDING`.
- **Postcondiciones:** Solicitud pendiente de aprobación; el perfil no es visible públicamente.

### UC-03: Aprobación de profesional (administrador)

- **Actores:** Administrador.
- **Precondiciones:** Existe una solicitud `PENDING`.
- **Flujo principal:**
  1. El administrador abre el panel y ve la cola de solicitudes.
  2. Revisa el perfil y descarga el currículum.
  3. Aprueba (o rechaza con motivo).
  4. El sistema cambia el estado a `APPROVED`/`REJECTED` y notifica por email.
- **Postcondiciones:** El profesional aparece en mapa/lista si fue aprobado.

### UC-04: Búsqueda de especialistas con filtros

- **Actores:** Ciudadano.
- **Precondiciones:** Ninguna (lectura pública).
- **Flujo principal:**
  1. El usuario va a "Especialistas" o "Mapa".
  2. Otorga permiso de ubicación (o se usa la ciudad por defecto).
  3. Aplica filtros (idioma, experiencia, especialidad, rol, radio).
  4. El sistema devuelve profesionales `APPROVED` ordenados por distancia.
  5. El usuario ve los resultados en lista y en el mapa; abre el perfil de un profesional.
- **Postcondiciones:** Resultados visibles y navegables.

### UC-05: Reserva de visita/llamada/videollamada

- **Actores:** Ciudadano, Profesional.
- **Precondiciones:** El profesional está `APPROVED` y tiene franjas publicadas; el ciudadano está autenticado.
- **Flujo principal:**
  1. El ciudadano abre el perfil del profesional y pulsa "Reservar".
  2. Selecciona modalidad (visita/llamada/videollamada) y una franja libre.
  3. El sistema crea la reserva `PENDING` (reserva atómica de la franja).
  4. Envía email a ambas partes.
  5. El profesional confirma o rechaza; el sistema actualiza el estado y notifica.
- **Flujos alternativos:**
  - 2a. No hay franjas libres en el rango: se muestra mensaje.
  - 3a. La franja ya fue tomada: error de concurrencia y se refresca la agenda.
  - 5a. Rechazo: el ciudadano es notificado y la franja se libera.
- **Postcondiciones:** Reserva en estado final (`CONFIRMED`/`CANCELLED`) con franja bloqueada/liberada.

### UC-06: Registro de menor con tutor

- **Actores:** Tutor, Menor.
- **Precondiciones:** Ninguna.
- **Flujo principal:**
  1. El tutor inicia el registro de un menor.
  2. Captura los datos del menor (edad con slider, 8–100) y crea/usa su cuenta de tutor.
  3. Otorga consentimiento de vinculación.
  4. El sistema crea el perfil `CHILD` vinculado al tutor.
  5. El menor accede a la app en modo `CHILD` bajo el perfil del tutor.
- **Postcondiciones:** Existe `guardian_link` `APPROVED` entre tutor y menor.

### UC-07: Participación en el foro

- **Actores:** Ciudadano, Administrador.
- **Precondiciones:** Autenticación para publicar.
- **Flujo principal:**
  1. El usuario crea un tema o responde en un tema existente.
  2. El contenido se publica visible.
  3. (Opcional) Un usuario reporta contenido inapropiado.
  4. El administrador revisa y oculta/bloquea si procede.
- **Postcondiciones:** Contenido publicado; reportes atendidos.

### UC-08: Alerta de emergencia

- **Actores:** Ciudadano.
- **Precondiciones:** Ninguna.
- **Flujo principal:**
  1. El usuario abre "Emergencias".
  2. Pulsa el botón de Policía (110), Bomberos (119) o Médicos (118).
  3. Confirma la llamada.
  4. El sistema abre el marcador telefónico con el número (`tel:`).
- **Postcondiciones:** Llamada iniciada en el dispositivo.

### UC-09: Consulta a Ramon (FAQ determinista)

- **Actores:** Ciudadano, Administrador (edición de FAQ).
- **Precondiciones:** Ninguna (widget disponible para todos).
- **Flujo principal:**
  1. El usuario abre el widget de Ramon.
  2. Ramon muestra el menú de categorías/preguntas (según `age_mode`).
  3. El usuario selecciona una pregunta o escribe texto libre.
  4. El sistema matchea contra palabras clave de los ítems de FAQ.
  5. Ramon muestra la respuesta curada con un **enlace a contenido relacionado**.
  6. El usuario puede navegar al enlace o continuar la conversación.
- **Flujos alternativos:**
  - 3a. Sin coincidencia: fallback "No entendí" + re-muestra el menú.
  - 5a. El enlace es un filtro de especialistas: se redirige con los parámetros pre-cargados.
- **Postcondiciones:** Interacción registrada; enlace disponible.

### UC-10: Gestión de FAQ (administrador)

- **Actores:** Administrador.
- **Precondiciones:** Rol `ADMIN`.
- **Flujo principal:**
  1. El administrador abre el panel de FAQ.
  2. Crea/edita categorías e ítems (pregunta, respuesta, palabras clave, target de enlace, modo de edad, traducciones).
  3. Guarda; los cambios se reflejan en el widget de Ramon.
- **Postcondiciones:** FAQ actualizada y disponible.

### UC-11: Gestión de disponibilidad (profesional)

- **Actores:** Profesional.
- **Precondiciones:** Perfil profesional `APPROVED`.
- **Flujo principal:**
  1. El profesional abre "Mi agenda".
  2. Crea franjas (fecha, hora, duración, modalidad) o elimina franjas futuras no reservadas.
  3. Revisa reservas entrantes y confirma/rechaza.
- **Postcondiciones:** Agenda actualizada.

### UC-12: Gestión de perfil ciudadano

- **Actores:** Ciudadano, Tutor (para menores).
- **Precondiciones:** Sesión iniciada.
- **Flujo principal:**
  1. El usuario abre "Mi perfil".
  2. Edita nombre, avatar, idioma, teléfono o fecha de nacimiento.
  3. El sistema re-deriva `age_mode` si la edad cambió de rango.
  4. Guarda los cambios.
- **Flujos alternativos:**
  - 3a. Si la re-derivación pasa a `CHILD`, se exige tutor; si sale de `CHILD`, el enlace de tutor se desactiva.
- **Postcondiciones:** Perfil actualizado.

---

## 6. Modelo de Datos Conceptual

> Modelo lógico de entidades y relaciones. El esquema físico (SQL, índices, RLS) está en `docs/SDD.md`.

### 6.1 Entidades

| Entidad | Atributos clave | Relaciones |
|---|---|---|
| `User` (auth) | email, password (hash), verificado | 1:1 con `Profile` |
| `Profile` | id, nombre, `birth_date`, `age_mode` (derivado), avatar, teléfono, idioma, `is_professional` | 1:N a reservas, temas, mensajes; 1:1 a `ProfessionalProfile` |
| `GuardianLink` | tutor, menor, parentesco, `consent_status` | N:1 tutor; N:1 menor |
| `ProfessionalProfile` | perfil, presentación, años de experiencia, ciudad, lat/lng, CV, `status` | 1:1 `Profile`; N:M `Specialty`; N:M `Language`; N:M `Role`; 1:N franjas |
| `ProfessionalRole` | slug, nombre (catálogo multi-profesión) | N:M `ProfessionalProfile` |
| `Specialty` | slug, nombre | N:M `ProfessionalProfile` |
| `Language` | código (es, qu, gn, en, lsa), nombre | N:M `ProfessionalProfile` |
| `AvailabilitySlot` | profesional, `starts_at`, `ends_at`, modalidad, `is_booked` | N:1 `ProfessionalProfile`; 1:0..1 `Booking` |
| `Booking` | cliente, profesional, franja, modalidad, `status` | N:1 perfil; N:1 profesional; 1:1 franja |
| `ForumTopic` | autor, título, cuerpo, `status` | N:1 `Profile`; 1:N `ForumPost` |
| `ForumPost` | tema, autor, cuerpo, `parent` (respuestas anidadas) | N:1 `Profile`; N:1 `ForumTopic` |
| `FaqCategory` | slug, etiqueta i18n, orden | 1:N `FaqItem` |
| `FaqItem` | categoría, pregunta i18n, respuesta i18n, `keywords[]`, `target_type`, `target_id`, `age_mode`, activo | N:1 `FaqCategory` |
| `ChatSession` | usuario | 1:N `ChatMessage` |
| `ChatMessage` | sesión, rol (user/assistant), contenido, `faq_item_id` (nullable) | N:1 `ChatSession` |

### 6.2 Reglas de integridad

- `age_mode` nunca se edita manualmente: se deriva de `birth_date`.
- Un perfil `CHILD` debe tener al menos un `GuardianLink` `APPROVED` para operar.
- `ProfessionalProfile.status ∈ {PENDING, APPROVED, REJECTED}`.
- `Booking.status ∈ {PENDING, CONFIRMED, CANCELLED, COMPLETED}`.
- Una franja `is_booked = true` no puede asociarse a otra reserva.
- `Booking.slot_id` es único (garantiza no doble reserva).

---

## 7. Requisitos No Funcionales

### 7.1 Rendimiento

- **RNF-01:** El bundle inicial comprimido no debe superar **1.5 MB**.
- **RNF-02:** Las respuestas del widget Ramon deben ser **instantáneas y deterministas** (< 100 ms, sin llamadas externas; el matching se hace localmente contra datos en caché).
- **RNF-03:** La carga inicial de mapa/especialistas debe renderizar en < 2 s en 4G.

### 7.2 Seguridad y Privacidad

- **RNF-04 (Privacy-by-Design):** Los datos personales (especialmente de menores) se almacenan en Supabase y solo se accede vía **RLS**; nunca se exponen en el cliente sin política.
- **RNF-05 (Menores):** La data de un perfil `CHILD` es accesible solo para el propio menor, sus tutores aprobados y administradores.
- **RNF-06:** Los currículums (CV) se almacenan en Storage con acceso restringido (solo propietario y administradores).
- **RNF-07:** Contraseñas gestionadas por Supabase Auth (hash, nunca en claro).
- **RNF-08:** Rate limiting en los endpoints de autenticación y reservas.
- **RNF-09:** El chatbot no persiste ni procesa PII más allá del registro de la conversación.

### 7.3 Usabilidad y Accesibilidad

- **RNF-10:** WCAG 2.1 AA (con énfasis en contraste y tamaño de toque ≥ 48px).
- **RNF-11:** Modo `ELDER` con tipografía aumentada y contraste alto; modo `CHILD` con lenguaje sencillo e iconos.
- **RNF-12:** La app debe soportar español, quechua, guaraní e inglés (i18n).

### 7.4 Portabilidad y PWA

- **RNF-13:** La app debe ser instalable como PWA con Service Worker y soporte **offline parcial** (FAQ de Ramon en caché).
- **RNF-14:** Compatible con navegadores móviles actuales (Chrome, Safari, Firefox).

### 7.5 Sostenibilidad y Costos

- **RNF-15:** Costo de infraestructura dentro del free-tier de Supabase y hospedaje estático gratuito; sin costos de LLM.
- **RNF-16:** Todo el contenido normativo es curado y editable por administradores, sin depender de APIs pagadas.

---

## 8. Apéndice: Trazabilidad con bare_ideas.txt

| Idea original (`bare_ideas.txt`) | Cobertura en SRS |
|---|---|
| 3 apps (niños, adultos, mayores) | Modos por edad (RF-1.3, §2.4) |
| Perfil con slider de edad | RF-1.1 |
| Checkbox "soy profesional" | RF-1.2 |
| Redirección a perfil profesional con CV | RF-1.6, RF-2.1 |
| Aprobación por admin | RF-2.4, RF-2.5, UC-03 |
| Geolocalización de profesionales | RF-3.1–3.5, UC-04 |
| Visita, llamada de voz o vídeo | RF-4.x (scheduling), UC-05 |
| Filtros por idiomas/experiencia/especialidad | RF-3.3 |
| Todo en un mapa | RF-3.1, Mapa |
| Profesionales se asignan un rol | RF-2.2, RF-2.3 |
| Botón de alerta (policía/bomberos/médicos) | RF-6.1, UC-08 |
| Nav bar: Inicio, Mapa, Especialistas, Comunidad, Emergencias, Ramon | RF-0.1, RF-0.2 |
| Comunidad = foro | Módulo 5, UC-07 |
| Especialistas = lista de cercanos | RF-3.2 |
| Chatbot que enlaza contenido relacionado | RF-7.1–7.7, UC-09 |
