# Robótica Fundamental con ROS2 — Plan de estudios interactivo

Aplicación web estática que convierte el plan de estudios de 6 semanas en un tracker de progreso interactivo. Sin frameworks, sin build step, sin base de datos: todo el progreso se guarda en `localStorage` del navegador.

## Qué hace

- Muestra las 6 semanas del curso con sus temas, laboratorios, videos y preguntas de defensa
- Cada ítem es marcable (hecho / pendiente) y el progreso se persiste automáticamente
- Barra de progreso global + anillo de porcentaje por semana
- Videos con link directo a YouTube (verificados)
- Preguntas de defensa — se deben responder sin mirar notas antes de avanzar de semana
- Checklist final con sello de completado al terminar todas las competencias
- Sección de rúbrica y mecánica de evaluación

## Estructura

```
curso-ros2/
├── index.html        # Estructura HTML y secciones estáticas
├── 404.html          # Página de error 404 (generada por Firebase)
├── css/
│   └── main.css      # Todos los estilos (dark theme, variables CSS)
├── js/
│   ├── data.js       # Contenido del curso (semanas, labs, videos, defensa, comandos)
│   └── app.js        # Lógica de render, estado y progreso
├── firebase.json     # Config de despliegue para Firebase Hosting
├── .firebaserc       # Proyecto Firebase activo (curso-ros-ia)
├── package.json
├── netlify.toml      # Config alternativa para Netlify
└── vercel.json       # Config alternativa para Vercel
```

## Correr localmente

No requiere instalación. Cualquier servidor HTTP estático funciona:

```bash
# Con Node (incluido en package.json)
npm run dev

# Con Python
python -m http.server 3000

# Con VS Code: instala la extensión Live Server y abre index.html
```

Luego abre `http://localhost:3000` (o el puerto que use tu servidor).

> Abrir `index.html` directamente como `file://` también funciona porque no hay peticiones de red al backend.

## Despliegue

El sitio es 100 % estático — cualquier CDN o hosting de archivos sirve.

### Firebase Hosting (activo)

El proyecto está configurado para desplegarse en `curso-ros-ia.web.app`.

```bash
firebase deploy
```

Para ver el historial de versiones o revertir a una anterior, entra a [Firebase Console → Hosting](https://console.firebase.google.com/project/quantum-odyssey-922b7/hosting).

### Netlify

```bash
# Conecta el repositorio en app.netlify.com
# Build command: (vacío)
# Publish directory: .
```

O arrastra la carpeta al drop-zone de Netlify.

### Vercel

```bash
npx vercel
# Framework: Other
# Output directory: .
```

### GitHub Pages

1. Sube el repo a GitHub
2. Settings → Pages → Branch: `main`, carpeta: `/` (root)
3. El sitio queda en `https://<usuario>.github.io/<repo>`

## Personalizar el contenido

Todo el contenido del curso vive en `js/data.js`. Para modificar semanas, agregar videos o cambiar preguntas de defensa, edita ese archivo directamente.

### Estructura de una semana

```js
{
  id: "s1",           // identificador único
  tag: "SEM 1/6",     // etiqueta visible
  hours: 10,          // horas estimadas
  t1: "Título",       // título principal
  t2: "Subtítulo",    // temas en una línea
  obj: "Objetivo...", // objetivo pedagógico de la semana

  topics: ["Tema 1", "Tema 2"],   // chips de temas (no marcables)

  labs: [
    { id: "s1l1", l: "Nombre del lab", s: "Descripción del entregable" }
  ],

  videos: [
    { id: "s1v1", l: "Título del video", url: "https://youtube.com/..." }
    // url es opcional; si no se incluye, no aparece el botón ▶
  ],

  forts: ["Habilidad 1", "Habilidad 2"],  // badges de fortalezas

  defensa: [
    "¿Pregunta que debes responder sin notas?",
  ],
}
```

### Agregar una semana

Copia un objeto existente de `WEEKS`, cambia el `id` (debe ser único, ej. `s7`), actualiza el contenido y agrega el entregable correspondiente en el array `FINAL`.

### Cambiar el color de acento

En `css/main.css`, modifica la variable `--green`:

```css
:root {
  --green: #36dc84;    /* color principal */
  --green-d: #1c7a48;  /* variante oscura para bordes y hover */
}
```

## Stack técnico

| Capa | Tecnología |
|---|---|
| Markup | HTML5 semántico |
| Estilos | CSS custom properties, sin preprocesador |
| Lógica | JavaScript ES2020 vanilla |
| Fuentes | Google Fonts (Chakra Petch, IBM Plex Mono, Sora) |
| Persistencia | `localStorage` del navegador |
| Despliegue | Firebase Hosting (`curso-ros-ia.web.app`) |

Sin dependencias en tiempo de ejecución. Sin bundler. Sin framework.

## Clave de localStorage

El progreso se guarda bajo la clave `ros2-go2-progress-v1` como JSON. Para migrar el progreso entre dispositivos, exporta e importa ese valor desde la consola del navegador:

```js
// Exportar
copy(localStorage.getItem('ros2-go2-progress-v1'))

// Importar (pega el JSON copiado)
localStorage.setItem('ros2-go2-progress-v1', '<json>')
location.reload()
```

## Licencia

MIT
