# Especificación de Requisitos del Sistema (SRS)
**Proyecto:** Plataforma de Simplificación Legal y Generación Determinista de Documentos Judiciales  
**Estándar de Referencia:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018  
**Dominio:** Acceso a la Justicia / LegalTech  
**Entorno de Despliegue Target:** Web Progresiva (PWA) Client-Side Rendered (CSR)  

---

## 1. Introducción

### 1.1 Propósito
El presente documento especifica los requisitos funcionales, no funcionales, de arquitectura e interfaz para la **Plataforma de Simplificación Legal y Generación Determinista de Documentos Judiciales**. El objetivo es guiar la implementación de un prototipo navegable y ejecutable durante las dos medias jornadas de la hackathon, garantizando un desarrollo desacoplado, mantenible y de costo operativo nulo en el procesamiento de datos.

### 1.2 Alcance del Sistema
La plataforma es un sistema web sin estado (*stateless*) orientado a la ejecución en cliente (*client-side*). Resuelve la brecha de acceso a la justicia convirtiendo grafos dirigidos de decisión legal en:
1. Rutas procedimentales simplificadas en lenguaje natural.
2. Inyección determinista de variables sobre plantillas de documentos judiciales (memoriales/cartas) en formatos `.pdf` y `.docx`.
3. Directorios de geolocalización e instrucciones institucionales según el municipio (foco inicial: Sucre, Chuquisaca).

**Exclusiones explícitas del alcance:**
* No utiliza motores de Inteligencia Artificial Generativa ni arquitecturas LLM (evitando no-determinismo y costos de API).
* No incluye persistencia de datos sensibles en bases de datos remotas (Backend Serverless o inexistente para la compilación de documentos).
* No incluye firma digital ni autenticación mediante pasarelas estatales (ej. Ciudadanía Digital), enfocándose en la etapa pre-procesal y de recepción por ventanilla.

### 1.3 Definiciones, Acrónimos y Abreviaturas
* **AST (Abstract Syntax Tree):** Estructura jerárquica de nodos que representa el flujo de un árbol de decisión legal.
* **Client-Side Rendering (CSR):** Procesamiento y renderizado de la interfaz y archivos directamente en el motor JavaScript del navegador del cliente.
* **Deterministic Template Engine:** Motor de procesamiento de plantillas que, dadas las mismas entradas de datos ($X$), produce exactamente el mismo documento de salida ($Y$).
* **JSON Schema:** Formato de declaración de estructuras de datos usado para validar los árboles de decisión y formularios.
* **PWA (Progressive Web App):** Aplicación web que utiliza Service Workers para almacenamiento en caché local y funcionamiento offline.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El sistema funciona de forma autónoma en el navegador web del usuario. La arquitectura está desacoplada en tres capas principales:

```text
+-----------------------------------------------------------------------+
|                            CAPA DE PRESENTACIÓN                       |
|  [PWA / UI Framework (React/Vue/Svelte)] <--> [Audio HTML5 Player]   |
+-----------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                            CAPA DE LÓGICA                             |
|  [Decision Tree Engine (JSON)] <--> [Dynamic Form & Validator (Zod)]  |
+-----------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                          CAPA DE COMPILACIÓN                          |
|  [PDF/DOCX Generator (Client-Side)] --> [Blob / Native File Saver]    |
+-----------------------------------------------------------------------+
