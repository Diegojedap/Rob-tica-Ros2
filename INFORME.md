# Informe de Proyecto y Despliegue
## Plan de estudios interactivo — ROS2 & Robótica Fundamental con Unitree Go2 Air

---

## 1. Visión general del proyecto

### ¿Qué es?

Una aplicación web estática de página única (SPA) que convierte un plan de estudios de 6 semanas en un tracker de progreso interactivo para aprender robótica autónoma con ROS2. El horizonte práctico es el cuadrúpedo Unitree Go2 Air en simulación con Gazebo.

### Problema que resuelve

Los planes de estudio en PDF son pasivos — el estudiante no puede marcar avance, tomar notas, cronometrar su tiempo ni navegar entre secciones con contexto. Esta aplicación convierte ese documento en una herramienta activa con navegación real entre "páginas", similar a una plataforma de cursos profesional.

### URLs de producción

| Recurso | URL |
|---|---|
| Sitio en producción | https://curso-ros-ia.web.app |
| Repositorio GitHub | https://github.com/Diegojedap/Rob-tica-Ros2 |
| Firebase Console | https://console.firebase.google.com/project/quantum-odyssey-922b7/hosting |

---

## 2. Stack tecnológico

| Capa | Tecnología | Decisión |
|---|---|---|
| Markup | HTML5 semántico | Shell mínimo — contenido generado por JS |
| Estilos | CSS custom properties | Variables globales, sin preprocesador |
| Lógica | JavaScript ES2020 vanilla | Sin bundler, sin dependencias |
| Fuentes | Google Fonts (Chakra Petch · IBM Plex Mono · Sora) | CDN externo |
| Persistencia | `localStorage` del navegador | Sin backend, sin cuenta |
| Hosting | Firebase Hosting | CDN global, SSL automático, gratuito |
| Repositorio | GitHub | Control de versiones |

**Sin dependencias en tiempo de ejecución. Sin build step. Sin base de datos.**

---

## 3. Arquitectura del código

```
curso-ros2/
├── index.html        ← Shell HTML (sidebar, topbar, #pageContent, modal)
├── 404.html          ← Página de error (Firebase)
├── css/
│   └── main.css      ← Todos los estilos (~600 líneas, variables CSS)
├── js/
│   ├── data.js       ← Datos: WEEKS (6), FINAL (12 items), COMMANDS (6 grupos)
│   └── app.js        ← Lógica SPA (~650 líneas)
├── firebase.json     ← Configuración de Firebase Hosting
├── .firebaserc       ← Proyecto Firebase activo
└── README.md         ← Documentación del proyecto
```

### Separación de responsabilidades

- **`index.html`** — solo estructura. El único contenido HTML estático es el shell de layout (sidebar vacío, topbar, contenedor de página, modal de flashcards, footer). Todo el contenido visible se genera por JS en tiempo de ejecución.
- **`data.js`** — solo datos. Arrays `WEEKS`, `FINAL` y `COMMANDS`. Para cambiar el contenido del curso, solo se edita este archivo.
- **`app.js`** — solo lógica. Renderiza páginas, gestiona estado en `localStorage`, calcula progreso y maneja todos los eventos.
- **`main.css`** — solo presentación. Variables CSS en `:root` para un theming consistente y sin magia.

---

## 4. Arquitectura SPA — Sistema de navegación por páginas

### Concepto

La aplicación usa el patrón de **Single Page Application sin router externo**. El estado de navegación vive en la variable `activePage` y el contenido se renderiza bajo demanda en `#pageContent`.

### Páginas disponibles

| ID | Sección | Contenido |
|---|---|---|
| `inicio` | Inicio | Hero, estadísticas de progreso, acceso rápido a semanas |
| `arch` | Arquitectura | Pila ROS2, stack tecnológico, capas del sistema |
| `wk-s1` … `wk-s6` | Semanas 1–6 | Labs, videos, conceptos, snippet, timer, notas, defensa |
| `checklist` | Checklist final | 12 competencias clave + sello de completado |
| `eval` | Evaluación | Distribución de notas y rúbrica |
| `commands` | Comandos | Referencia rápida de comandos ROS2 con copy |

### Flujo de navegación

```
Usuario hace clic en sidebar
    ↓
showPage(pageId)
    ├── Pausa el timer si hay uno activo
    ├── Genera HTML de la página (función específica por página)
    ├── Inyecta en #pageContent
    ├── Aplica estado guardado (checkboxes, forts)
    ├── Llama renderGlobalSidebar() → actualiza activo + anillos
    └── window.scrollTo(0, 0)
```

### Sidebar global

El sidebar se regenera cada vez que cambia la página o el progreso. Contiene:
- Cabecera con logo, subtítulo y barra de progreso global
- Sección OVERVIEW: Inicio, Arquitectura
- Sección SEMANAS: S1–S6 con anillo SVG de progreso individual
- Sección RECURSOS: Checklist, Evaluación, Comandos

---

## 5. Funcionalidades implementadas

### Navegación SPA con sidebar global
- Sidebar fija izquierda (255px) visible en todas las páginas
- 10 destinos navegables sin recarga de página
- El ítem activo se resalta con borde verde izquierdo
- Mobile: sidebar oculto por defecto, se abre con botón ☰
- Cierre automático del sidebar mobile al navegar o al hacer clic fuera

### Tracker de progreso
- Cada ítem de laboratorio, video, fortaleza y pregunta de defensa es marcable
- Estado persistido en `localStorage` bajo `ros2-go2-progress-v1`
- Barra de progreso global en el topbar (sticky)
- Anillos SVG de porcentaje animados por semana en el sidebar
- Porcentaje de completado en el header de cada semana

### Notas de reflexión por semana
- Tres áreas de texto por semana: *Qué entendí bien*, *Qué me costó trabajo*, *Preguntas abiertas*
- Guardado automático con debounce de 600ms
- Badge `✓ con notas` aparece cuando hay contenido escrito
- Persistidas en `localStorage` bajo `ros2-go2-notes-v1`

### Timer de estudio
- Timer cronómetro por semana con start/pause/reset
- Tiempo estimado de la semana visible como referencia
- Acumula segundos incluso al pausar y reanudar
- Se pausa automáticamente al cambiar de semana o de página
- Persistido en `localStorage` bajo `ros2-go2-timers-v1`

### Modo repaso — Flashcards
- Modal con todas las preguntas de defensa de las 6 semanas (navegación por teclado ← →)
- Seguimiento de confianza por tarjeta: ✗ No lo sé / ~ Más o menos / ✓ Lo domino
- Confianza persistida en `localStorage` bajo `ros2-go2-conf-v1`
- Se abre con el botón ⚡ Repaso en el topbar

### Exportar / Importar progreso
- Botón Exportar: descarga un `.json` con todo el estado (progreso, notas, timers, confianza)
- Botón Importar: carga un `.json` y recarga la página aplicando el estado
- Permite migrar el progreso entre dispositivos o hacer backups

### Referencia rápida de comandos
- 6 grupos de comandos ROS2: nodos/tópicos, servicios/acciones, TF2, launch/params, SLAM+Nav2, workspace
- Botón ⎘ copia el comando al clipboard con confirmación visual ✓

### Checklist final y sello
- 12 competencias clave agrupadas por semana
- Al completar todas: sello desbloqueado con ícono 🎓 y animación

### Conceptos clave y snippets por semana
- Cards de conceptos técnicos (término + definición)
- Bloque de código con syntax highlighting y copia directa

---

## 6. Diseño y estilos

### Sistema de colores (dark theme)

```css
:root {
  --bg:     #0a0e12;   /* fondo base */
  --bg2:    #0e141b;   /* fondo sidebar */
  --panel:  #11181f;   /* cards y paneles */
  --green:  #36dc84;   /* acento principal */
  --amber:  #ffb454;   /* flashcards / warnings */
  --cyan:   #39d4d4;   /* código / conceptos */
  --red:    #e8604c;   /* acciones destructivas */
}
```

### Layout

El layout usa CSS Flexbox con el patrón app-shell:

```
┌─────────────────┬──────────────────────────────────┐
│                 │ TOPBAR (sticky, 58px)             │
│  SIDEBAR GLOBAL │──────────────────────────────────│
│  (fixed 255px)  │                                  │
│                 │  #pageContent                    │
│  - Logo + barra │  (contenido de la página activa) │
│  - OVERVIEW     │                                  │
│  - SEMANAS      │──────────────────────────────────│
│  - RECURSOS     │ FOOTER (export/import/reset)     │
└─────────────────┴──────────────────────────────────┘
```

### Tipografía

| Familia | Uso |
|---|---|
| Chakra Petch | Títulos, logo, tags de semana |
| IBM Plex Mono | Código, etiquetas, porcentajes, comandos |
| Sora | Texto corrido, párrafos, notas |

---

## 7. Persistencia de datos

El progreso se guarda sin backend usando `localStorage`:

| Clave | Tipo | Contenido |
|---|---|---|
| `ros2-go2-progress-v1` | `object` | `{ "s1l1": true, "s1v1": false, ... }` |
| `ros2-go2-notes-v1` | `object` | `{ "s1_good": "...", "s1_hard": "..." }` |
| `ros2-go2-timers-v1` | `object` | `{ "s1": 3620, "s2": 0, ... }` (segundos) |
| `ros2-go2-conf-v1` | `object` | `{ "SEM 1/6_0": 3, ... }` (1, 2 ó 3) |

---

## 8. Despliegue — Firebase Hosting

### Configuración

**`firebase.json`:**
```json
{
  "hosting": {
    "site": "curso-ros-ia",
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

**`.firebaserc`:**
```json
{
  "projects": { "default": "quantum-odyssey-922b7" }
}
```

### Flujo de actualización

```powershell
# 1. Guardar cambios en Git
git add .
git commit -m "descripción del cambio"
git push

# 2. Desplegar a Firebase Hosting
firebase deploy
```

Ambos pasos son independientes — Git guarda el historial, Firebase sirve el sitio.

---

## 9. Historial de versiones principales

| Versión | Descripción |
|---|---|
| v1 — Inicial | Tracker básico con acordeones por semana, progreso en topbar |
| v2 — Contenido rico | Conceptos clave, snippets de código, layout Platzi (sidebar + main) |
| v3 — Interactividad | Timer de estudio, exportar/importar progreso, flashcards con confianza |
| v4 — Sidebar global | Navegación SPA completa: sidebar fijo, 10 páginas, mobile responsive |

---

## 10. Decisiones técnicas relevantes

### ¿Por qué vanilla JS sin framework?
- Carga instantánea — 0 KB de JavaScript de terceros
- Sin proceso de build — editar y abrir en el navegador es suficiente
- La complejidad del proyecto no justifica la overhead de un framework SPA

### ¿Por qué localStorage y no IndexedDB o backend?
- El usuario no necesita cuenta — privacidad total
- Los datos son pequeños (< 50 KB incluso con todas las notas)
- La exportación/importación JSON cubre la necesidad de backup y migración

### ¿Por qué renderizado bajo demanda?
- Evita tener 10 secciones en el DOM al mismo tiempo
- El HTML se genera fresh cada vez que se navega, garantizando que el estado se refleje correctamente sin necesidad de reconciliar el DOM

### ¿Por qué event delegation en lugar de listeners individuales?
- El contenido de `#pageContent` se reemplaza en cada navegación
- Con delegation, un solo listener en el contenedor captura todos los eventos sin importar cuántas veces se regenere el HTML interno

---

*Informe actualizado el 2026-06-10 — v4 Sidebar Global*
