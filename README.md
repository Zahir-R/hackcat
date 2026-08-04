# Especificación de Requisitos del Sistema (SRS)

**Proyecto:** Plataforma de Simplificación Legal, Generación Determinista de Documentos y Asistente RAG Conversacional

**Estándar de Referencia:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018

**Dominio:** Acceso a la Justicia / LegalTech

**Entorno de Despliegue Target:** Web Progresiva (PWA) CSR + Microservicio Backend RAG

---

## 1. Introducción

### 1.1 Propósito

El presente documento especifica los requisitos funcionales, no funcionales, de arquitectura e interfaz para la **Plataforma de Simplificación Legal, Generación Determinista de Documentos y Asistente RAG Conversacional**. El objetivo es guiar la implementación de un prototipo navegable y ejecutable durante las dos medias jornadas de la hackathon, garantizando una arquitectura híbrida que combina **ejecución determinista de documentos** en cliente con **asistencia conversacional grounding-based** vía backend.

### 1.2 Alcance del Sistema

La plataforma es un sistema web híbrido orientado al acceso universal a la justicia que convierte normativas e información legal en:

1. Rutas procedimentales simplificadas en lenguaje natural mediante grafos dirigidos.
2. Inyección determinista de variables sobre plantillas de documentos judiciales (memoriales/cartas) en formatos `.pdf` y `.docx` procesados en cliente (*Client-Side*).
3. Directorios de geolocalización e instrucciones institucionales según el municipio (foco inicial: Sucre, Chuquisaca).
4. **Agente Conversacional / Chatbot RAG (Retrieval-Augmented Generation):** Un asistente de orientación jurídica alimentado exclusivamente por una base de conocimiento normativo boliviano acotada (Código de las Familias, Ley 348, Ley General del Trabajo, etc.) para resolver dudas puntuales de ciudadanos en lenguaje natural antes o durante la navegación del árbol.

**Exclusiones explícitas del alcance:**

* La IA conversacional **no genera memoriales directamente** (previene alucinaciones); los documentos legales se compilan únicamente a través del motor determinista validado.
* No incluye firma digital ni autenticación mediante pasarelas estatales (ej. Ciudadanía Digital), enfocándose en la etapa pre-procesal y de recepción por ventanilla.

### 1.3 Definiciones, Acrónimos y Abreviaturas

* **AST (Abstract Syntax Tree):** Estructura jerárquica de nodos que representa el flujo de un árbol de decisión legal.
* **Client-Side Rendering (CSR):** Procesamiento y renderizado de la interfaz y archivos directamente en el motor JavaScript del navegador del cliente.
* **Deterministic Template Engine:** Motor de procesamiento de plantillas que, dadas las mismas entradas de datos ($X$), produce exactamente el mismo documento de salida ($Y$).
* **JSON Schema:** Formato de declaración de estructuras de datos usado para validar los árboles de decisión y formularios.
* **PWA (Progressive Web App):** Aplicación web que utiliza Service Workers para almacenamiento en caché local y funcionamiento offline.
* **RAG (Retrieval-Augmented Generation):** Patrón arquitectónico donde el modelo de lenguaje (LLM) consulta primero una base de datos vectorial con documentos oficiales antes de generar una respuesta, evitando alucinaciones.
* **Vector Store / DB:** Base de datos optimizada para búsqueda por similitud semántica mediante embeddings.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto

El sistema combina procesamiento autónomo en el cliente para la compilación segura de documentos con una arquitectura de microservicio backend para el Agente RAG:

```text
+-----------------------------------------------------------------------------------+
|                               CAPA DE PRESENTACIÓN                                |
|  [PWA / UI Framework (React/Vue/Svelte)] <--> [Agente Chatbot UI / Audio Player]  |
+-----------------------------------------------------------------------------------+
                                         |
                   +---------------------+---------------------+
                   | (Navegación / PDF)                        | (Consultas IA)
                   v                                           v
+------------------------------------+       +------------------------------------+
|           CAPA DE LÓGICA           |       |         AGENTE RAG BACKEND         |
| [Decision Tree Engine (JSON)]      |       | [FastAPI / LangChain / LlamaIndex] |
|              |                     |       |                 |                  |
|              v                     |       |                 v                  |
| [Dynamic Form & Validator (Zod)]   |       | [Vector DB (Chroma/FAISS/Qdrant)]  |
+------------------------------------+       |                 |                  |
                   |                         |                 v                  |
                   v                         |  [LLM Engine (Ollama / OpenAI)]    |
+------------------------------------+       +------------------------------------+
|        CAPA DE COMPILACIÓN         |
| [PDF/DOCX Generator (Client-Side)] |
+------------------------------------+

```

### 2.2 Funciones del Producto

* **Motor de Arborescencia:** Navegación por grafos de decisión $G = (V, E)$ donde cada nodo $V$ representa una pregunta o aclaración jurídica y cada arista $E$ representa una elección condicional.
* **Compilador de Documentos:** Inyección de pares clave-valor (obtenidos del formulario) en expresiones de plantilla (*placeholders*).
* **Agente Conversacional Legal (RAG):** Chatbot capaz de interpretar consultas informales en texto plano, buscar los artículos específicos en las leyes bolivianas indexadas en la base vectorial y responder en lenguaje sencillo con citas normativas explícitas.
* **Localización y Recursos:** Mapeo de coordenadas y metadatos de sedes judiciales (SLIM, FELCV, Fiscalía, Juzgados de Familia).
* **Reproducción de Contenido Multilingüe:** Reproductor de audios locales vinculados al identificador del nodo activo para soporte en Quechua/Aymara.

### 2.3 Características de los Usuarios

* **Usuario Final (Ciudadano):** No requiere conocimientos técnicos ni legales. Acceso mediante dispositivos móviles con navegadores estándar (Chrome, Safari, Firefox).
* **Administrador / Mantenedor Legal (Desarrollador / Abogado):** Capacidad para editar archivos JSON estructurados de los árboles y actualizar el corpus normativo indexado en el vector store del agente.

---

## 3. Requisitos de Interfaces Externas

### 3.1 Interfaz de Usuario (UI/UX)

* **UI-01:** La interfaz debe ser *Mobile-First*, responsiva a resoluciones desde $320\text{px}$ (viewport mínimo) hasta $4\text{K}$.
* **UI-02:** Los componentes de entrada deben utilizar patrones de interacción por toque (*touch-friendly*), con un área mínima de toque de $48\times 48\text{px}$ por botón.
* **UI-03:** Widget de Chat Flotante / Embebido: El agente conversacional estará disponible mediante una pestaña accesible desde cualquier punto del flujo sin perder el estado del árbol.

### 3.2 Interfaz de Software

* **SW-01 (Generación PDF):** Integración con motores de renderizado vectorial en cliente (ej. `pdfmake` o `jsPDF`).
* **SW-02 (Generación DOCX):** Integración con bibliotecas de manipulación de estructuras OpenXML en JavaScript (ej. `docx.js`).
* **SW-03 (API Agente Conversacional):** Endpoint REST/WebSocket para envío de prompts de usuario y recepción de streaming de texto (*Server-Sent Events / SSE*) desde el backend RAG.
* **SW-04 (Mapas):** Integración mediante componentes de mapas livianos libres de API key obligatoria o renderizado estático con *Leaflet* / *OpenStreetMap Embed*.

---

## 4. Requisitos Funcionales (RF)

### 4.1 Módulo 1: Engine de Navegación y Grafos de Decisión

#### RF-1.1: Carga y Parsing del Grafo Legal

* **Descripción:** El sistema debe cargar asíncronamente desde un archivo `.json` la estructura del árbol legal activo.
* **Entrada:** Identificador del flujo (ej. `familia-pension-alimentos.json`).
* **Procesamiento:** Validar el JSON contra un *JSON Schema* antes de montar el estado global.
* **Salida:** Grafo procesado en memoria.

#### RF-1.2: Transición de Nodos

* **Descripción:** Al seleccionar una opción en el nodo actual $V_i$, el sistema debe evaluar el puntero del nodo destino $V_{i+1}$ (atributo `nextNodeId`).
* **Estructura del Nodo:**
```json
{
  "nodeId": "STRING",
  "title": "STRING",
  "description": "STRING",
  "legalReference": "STRING",
  "audioUrl": "STRING | NULL",
  "options": [
    {
      "label": "STRING",
      "nextNodeId": "STRING",
      "setVariables": "OBJECT | NULL"
    }
  ],
  "isTerminal": "BOOLEAN"
}

```



#### RF-1.3: Nodos Terminales y Routing a Formulario

* **Descripción:** Cuando $V_i$ contenga `"isTerminal": true`, el sistema debe detener la navegación por el árbol y renderizar el formulario dinámico asociado (`formSchemaId`).

---

### 4.2 Módulo 2: Agente Conversacional e Interacción RAG

#### RF-2.1: Búsqueda Semántica en Corpus Normativo (Retrieval)

* **Descripción:** Ante una consulta libre del usuario (ej. *"¿Qué hago si no me pagan la pensión hace 3 meses?"*), el backend RAG debe generar embeddings del query y realizar una búsqueda semántica de los top-$k$ fragmentos más relevantes ($k=3$) en el Vector Store (Leyes Bolivianas).

#### RF-2.2: Generación Guiada con Citas Explícitas (Augmented Generation)

* **Descripción:** El modelo debe sintetizar una respuesta en lenguaje claro **únicamente basada en los fragmentos recuperados**.
* **Regla de Negocio:** Toda respuesta generada por el chatbot debe incluir la referencia explícita a la norma boliviana correspondiente (ej. *Artículo 112 de la Ley N° 603*). Si la consulta no está cubierta por la base de datos legal indexada, el chatbot debe responder: *"No dispongo de información oficial sobre este trámite específico en mi base legal."*

#### RF-2.3: Enlace entre Chatbot y Árbol Determinista

* **Descripción:** Si el chatbot detecta la intención de iniciar un trámite soportado (ej. Fijación de Pensión Alimenticia), debe incluir en su respuesta un botón/enlace directo que redirija al usuario al nodo correspondiente del **Motor de Navegación Determinista**.

---

### 4.3 Módulo 3: Formularios Dinámicos y Generación de Documentos

#### RF-3.1: Renderizado Dinámico de Formularios

* **Descripción:** El sistema debe construir los campos de entrada de texto, selección y fecha basados en la declaración del esquema del formulario terminal.
* **Validación:** Cada campo debe asociarse a una regla de validación en tiempo real (Expresiones Regulares para Cédula de Identidad boliviana, montos numéricos mayores a cero).

#### RF-3.2: Inyección de Plantillas y Compilación

* **Descripción:** El sistema debe tomar el objeto JSON de respuestas del formulario y reemplazar los *placeholders* de la plantilla.
* **Algoritmo de Inyección:** Reemplazo estricto de subcadenas bajo el patrón `{{variable_name}}`.
* **Proceso de Compilación PDF/DOCX:** Invocación en cliente mediante `pdfmake` o `docx.js` para generar el binario Blob y disparar la descarga directa.

---

### 4.4 Módulo 4: Directorio Institucional y Accesibilidad

#### RF-4.1: Mapeo de Entidades Promotoras de Justicia

* **Descripción:** Según la ruta elegida o la intención detectada por el agente, el sistema debe filtrar un dataset local de sedes judiciales en Sucre (SLIM, FELCV, Fiscalía, Tribunal).

#### RF-4.2: Reproducción de Audios de Acompañamiento

* **Descripción:** Si el nodo activo contiene `"audioUrl" != null`, se debe habilitar un reproductor de audio integrado para soporte en Quechua/Aymara.

---

## 5. Requisitos No Funcionales (RNF)

### 5.1 Rendimiento (Performance)

* **RNF-01 (Bundle Size Frontend):** El tamaño total del bundle inicial comprimido no debe superar los **1.5 MB**.
* **RNF-02 (Latency del Chatbot RAG):** La primera respuesta/stream del agente conversacional debe iniciarse en **$< 2\text{ segundos}$** tras la consulta.
* **RNF-03 (Latency de Compilación de Documento):** La generación y descarga del PDF/DOCX en el cliente debe demorar **$< 800\text{ ms}$**.

### 5.2 Seguridad y Privacidad (Privacy-by-Design)

* **RNF-04 (Zero Server Storage for PII):** Los datos personales introducidos en los formularios para compilar memoriales se procesan exclusivamente en el cliente. El backend RAG solo procesa preguntas conceptuales anónimas del chat sin persistir nombres o números de cédula.
* **RNF-05 (Aislamiento del LLM):** El LLM del chatbot opera en modo estrictamente de solo lectura sobre el Vector Store y no tiene capacidad de ejecutar acciones en el sistema ni modificar plantillas.

### 5.3 Sostenibilidad y Bajos Costos

* **RNF-06 (Optimización del RAG):** El sistema RAG debe utilizar embeddings ligeros (ej. `all-MiniLM-L6-v2` o modelos locales vía Ollama) o APIs de bajo costo para garantizar la sostenibilidad dentro del capital semilla de Bs. 9.500.

---

## 6. Arquitectura de Datos y Estructura de Componentes

### 6.1 Esquema de Configuración del Agente RAG (`ragConfig.json`)

```json
{
  "systemPrompt": "Eres un asistente de orientación legal en Bolivia. Tu único objetivo es explicar normativas en lenguaje sencillo a la ciudadanía. RESPONDE ÚNICAMENTE usando los fragmentos de contexto proveídos. Cita siempre el artículo o ley correspondiente. Si no sabes la respuesta, indícalo claramente.",
  "vectorStore": {
    "collectionName": "leyes_bolivia_v1",
    "embeddingModel": "text-embedding-3-small",
    "topK": 3
  },
  "supportedLaws": [
    "Ley N° 603 - Código de las Familias",
    "Ley N° 348 - Garantizar a las Mujeres una Vida Libre de Violencia",
    "Ley General del Trabajo"
  ]
}

```

---

## 7. Plan de Implementación y Distribución del Equipo (7 Integrantes)

```text
+-----------------------------------------------------------------------------------+
|                             ESTRUCTURA DEL EQUIPO (7)                             |
|  [Dev 1]  [Dev 2]  [Dev 3]  [Dev 4]  |  [UX/UI]  |  [Pitcher]  |  [Diapositivas]  |
+-----------------------------------------------------------------------------------+

```

### Roles y Responsabilidades:

1. **Dev 1 — Engine Determinista & Machine State:**
* Implementación de la máquina de estados en el frontend para recorrer los grafos JSON de decisión.
* Manejo del historial de navegación, retroceso de nodos y preservación del estado.


2. **Dev 2 — Form Engine & Compilador PDF/DOCX Client-Side:**
* Motor de renderizado de formularios dinámicos a partir de esquemas JSON.
* Lógica de inyección de variables e integración con `pdfmake`/`docx.js` para compilación en cliente.


3. **Dev 3 — Backend RAG & Vector Database:**
* Ingesta, chunking e indexación de la legislación boliviana en la base vectorial (Chroma/FAISS).
* Desarrollo de los endpoints REST/SSE en FastAPI para la comunicación con el LLM grounding.


4. **Dev 4 — Frontend Lead, Chatbot Widget & Integración:**
* Construcción del widget flotante del chatbot e integración con la API del backend RAG.
* Módulo de mapas (Leaflet/OpenStreetMap), reproductor de audios locales (Quechua/Aymara) y ensamble general de la PWA.


5. **Diseñador/a UX/UI:**
* Prototipado rápido en Figma de los flujos de navegación mobile-first y el widget conversacional.
* Diseño del sistema de diseño (tokens de color, tipografía accesible, áreas de toque de $48\times 48\text{px}$).
* Exportación y preparación de assets (iconos, mapas vectoriales, audios).


6. **Responsable de Pitch (Speaker):**
* Estructuración de la narrativa del proyecto (Problema, Solución Híbrida, Impacto Social en Sucre, Viabilidad Económica).
* Ensayo de tiempos de exposición, preparación de respuestas para la ronda de preguntas del jurado y coordinación de la demostración en vivo.


7. **Responsable de Presentación & Material Visual:**
* Creación de la diapositiva ejecutiva (PPTX/Google Slides) alineada con la identidad gráfica definida por UX/UI.
* Síntesis visual de la arquitectura técnica, modelo de sostenibilidad financiera (presupuesto Bs. 9.500) y Roadmap post-hackathon.
# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
