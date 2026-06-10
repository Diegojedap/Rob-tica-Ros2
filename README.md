# Robótica Fundamental con ROS2 — Plan de estudios interactivo

Aplicación web estática tipo SPA que convierte el plan de estudios de 6 semanas en un tracker de progreso interactivo con navegación entre páginas. Sin frameworks, sin build step, sin base de datos.

🌐 **Producción:** [https://curso-ros-ia.web.app](https://curso-ros-ia.web.app)  
📁 **Repositorio:** [https://github.com/Diegojedap/Rob-tica-Ros2](https://github.com/Diegojedap/Rob-tica-Ros2)

---

## Qué hace

- **Sidebar global de navegación** — acceso rápido a todas las secciones desde cualquier punto
- **Navegación entre páginas** sin recarga: Inicio, Arquitectura, 6 semanas, Checklist, Evaluación, Comandos
- Cada ítem de laboratorio, video y defensa es marcable (hecho/pendiente) con persistencia automática
- **Anillos de progreso SVG** por semana en el sidebar, actualizados en tiempo real
- **Timer de estudio** por semana con pausa, reanudación y persistencia
- **Exportar / importar progreso** como JSON para migrar entre dispositivos
- **Modo repaso (flashcards)** con las preguntas de defensa de todas las semanas + seguimiento de confianza
- **Referencia de comandos** ROS2 con copia al clipboard en un clic
- Checklist final de 12 competencias con sello desbloqueado al completar
- Notas de reflexión por semana (qué entendí, qué me costó, preguntas abiertas)
- Diseño responsive: el sidebar colapsa en mobile con botón ☰

---

## Estructura del proyecto

```
curso-ros2/
├── index.html          # Shell HTML (solo estructura, sin contenido inline)
├── 404.html            # Página de error 404
├── css/
│   └── main.css        # Todos los estilos (app-shell, sidebar, páginas, temas)
├── js/
│   ├── data.js         # Contenido del curso: WEEKS, FINAL, COMMANDS
│   └── app.js          # Lógica SPA: navegación, render, estado, progreso
├── firebase.json       # Config de Firebase Hosting (site: curso-ros-ia)
├── .firebaserc         # Proyecto activo: quantum-odyssey-922b7
├── INFORME.md          # Informe técnico detallado del proyecto
├── package.json
├── netlify.toml
└── vercel.json
```

### Separación de responsabilidades

| Archivo | Rol |
|---|---|
| `index.html` | Shell vacío: sidebar, topbar, `#pageContent`, modal |
| `js/data.js` | Solo datos — `WEEKS`, `FINAL`, `COMMANDS` |
| `js/app.js` | Solo lógica — render de páginas, estado, eventos, SPA routing |
| `css/main.css` | Solo presentación — variables CSS, layout, componentes |

---

## Arquitectura SPA (navegación entre páginas)

La app usa un patrón de página única con renderizado bajo demanda. Hay **10 páginas navegables**:

| ID de página | Sección |
|---|---|
| `inicio` | Hero con stats de progreso y acceso rápido a semanas |
| `arch` | Arquitectura del software (pila ROS2, stack, capas) |
| `wk-s1` … `wk-s6` | Contenido completo de cada semana |
| `checklist` | 12 competencias + sello de completado |
| `eval` | Distribución de notas y rúbrica |
| `commands` | Referencia rápida de comandos ROS2 |

El estado activo se guarda en `activePage`. La función `showPage(pageId)` reemplaza el contenido de `#pageContent` y actualiza el sidebar con la nueva selección activa.

---

## Correr localmente

No requiere instalación. Cualquier servidor HTTP estático funciona:

```bash
# Con Python
python -m http.server 3000

# Con Node (incluido en package.json)
npm run dev

# Con VS Code: extensión "Live Server" → clic derecho en index.html → Open with Live Server
```

Luego abre `http://localhost:3000`.

> `index.html` directamente como `file://` también funciona (no hay peticiones al backend).

---

## Despliegue

### Firebase Hosting (activo)

```bash
firebase deploy
```

El sitio queda en `https://curso-ros-ia.web.app`. Para ver historial de versiones o revertir:  
[Firebase Console → Hosting](https://console.firebase.google.com/project/quantum-odyssey-922b7/hosting)

### Netlify / Vercel / GitHub Pages

El sitio es 100 % estático — cualquier hosting sirve:

```bash
# Vercel
npx vercel   # Framework: Other · Output directory: .

# GitHub Pages
# Settings → Pages → Branch: main · Folder: / (root)
```

---

## Personalizar el contenido

Todo el contenido vive en `js/data.js`. Para cambiar semanas, agregar videos o modificar preguntas de defensa, solo edita ese archivo.

### Estructura de una semana

```js
{
  id: "s1",           // identificador único (usado como clave en localStorage)
  tag: "SEM 1/6",     // etiqueta visible en el sidebar
  hours: 10,          // horas estimadas de estudio
  t1: "Título principal",
  t2: "Subtítulo — temas en una línea",
  obj: "Objetivo pedagógico de la semana",

  conceptos: [
    { t: "Término", d: "Definición breve" }
  ],

  snippet: {
    l: "Nombre del ejemplo",  // etiqueta del bloque de código
    c: `...código...`
  },

  topics:  ["Tema 1", "Tema 2"],  // chips de temas (no marcables)

  labs: [
    { id: "s1l1", l: "Nombre del lab", s: "Descripción del entregable" }
  ],

  videos: [
    { id: "s1v1", l: "Título", url: "https://youtube.com/..." }
    // url es opcional — si no se incluye, no aparece el botón ▶
  ],

  forts:   ["Habilidad que ganas 1"],  // badges de fortalezas

  defensa: ["¿Pregunta que debes responder sin notas?"],
}
```

### Cambiar el color de acento

```css
/* css/main.css → :root */
--green:   #36dc84;  /* color principal */
--green-d: #1c7a48;  /* variante oscura para bordes */
```

---

## Persistencia (localStorage)

| Clave | Contenido |
|---|---|
| `ros2-go2-progress-v1` | Estado de ítems marcados (labs, videos, fortalezas, defensa, checklist) |
| `ros2-go2-notes-v1` | Notas de reflexión por semana |
| `ros2-go2-timers-v1` | Segundos acumulados por semana |
| `ros2-go2-conf-v1` | Nivel de confianza en flashcards (1=no sé, 2=más o menos, 3=domino) |

Para migrar progreso entre dispositivos, usa los botones **Exportar / Importar** del footer, o manualmente desde la consola:

```js
// Exportar todo
JSON.stringify({
  state:  JSON.parse(localStorage.getItem('ros2-go2-progress-v1')),
  notes:  JSON.parse(localStorage.getItem('ros2-go2-notes-v1')),
  timers: JSON.parse(localStorage.getItem('ros2-go2-timers-v1')),
  conf:   JSON.parse(localStorage.getItem('ros2-go2-conf-v1')),
})
```

---

## Stack técnico

| Capa | Tecnología | Nota |
|---|---|---|
| Markup | HTML5 semántico | Shell vacío — contenido generado por JS |
| Estilos | CSS custom properties | Sin preprocesador, variables en `:root` |
| Lógica | JavaScript ES2020 vanilla | Sin bundler, sin framework, sin dependencias |
| Fuentes | Google Fonts | Chakra Petch · IBM Plex Mono · Sora |
| Persistencia | `localStorage` | Sin backend, sin cuenta |
| Hosting | Firebase Hosting | CDN global, SSL automático |

**Sin dependencias en tiempo de ejecución. Sin build step. Carga instantánea.**

---

## Licencia

MIT
