# Informe de Proyecto y Despliegue
## Plan de estudios interactivo — ROS2 & Robótica Fundamental con Unitree Go2 Air

---

## 1. Visión general del proyecto

### ¿Qué es?

Una aplicación web estática que convierte un plan de estudios de 6 semanas en un tracker de progreso interactivo para aprender robótica autónoma con ROS2. El horizonte práctico es el cuadrúpedo Unitree Go2 Air en simulación con Gazebo.

### Problema que resuelve

Los planes de estudio en PDF son pasivos — el estudiante no puede marcar avance, escribir reflexiones ni saber qué porcentaje del curso lleva completado. Esta aplicación convierte ese PDF en una herramienta activa.

### Usuarios objetivo

Ingenieros de software sin experiencia en robótica que quieren dominar ROS2 de forma autogestionada, a su propio ritmo, sin fechas fijas.

---

## 2. Stack tecnológico

| Capa | Tecnología | Decisión |
|---|---|---|
| Markup | HTML5 semántico | Sin framework — carga instantánea |
| Estilos | CSS custom properties | Variables globales, sin preprocesador |
| Lógica | JavaScript ES2020 vanilla | Sin bundler, sin dependencias |
| Fuentes | Google Fonts (Chakra Petch · IBM Plex Mono · Sora) | CDN externo |
| Persistencia | `localStorage` del navegador | Sin backend, sin cuenta |
| Hosting | Firebase Hosting | CDN global, SSL automático, gratis |
| Repositorio | GitHub | Control de versiones y colaboración |

**Sin dependencias en tiempo de ejecución. Sin build step. Sin base de datos.**

---

## 3. Arquitectura del código

```
curso-ros2/
├── index.html        ← Estructura HTML y secciones estáticas
├── 404.html          ← Página de error (Firebase)
├── css/
│   └── main.css      ← Todos los estilos (dark theme, variables CSS)
├── js/
│   ├── data.js       ← Todo el contenido: semanas, labs, videos, comandos
│   └── app.js        ← Lógica: render, estado, progreso, notas, clipboard
├── firebase.json     ← Configuración de Firebase Hosting
├── .firebaserc       ← Proyecto Firebase activo
├── .gitignore        ← Exclusiones de git
└── README.md         ← Documentación del proyecto
```

### Separación de responsabilidades

- **`data.js`** — solo datos. Contiene los arrays `WEEKS`, `FINAL` y `COMMANDS`. Para cambiar el contenido del curso, solo se edita este archivo.
- **`app.js`** — solo lógica. Renderiza el DOM, gestiona el estado en `localStorage`, calcula el progreso y maneja los eventos.
- **`main.css`** — solo presentación. Variables CSS en `:root` para theming consistente.

---

## 4. Funcionalidades implementadas

### Tracker de progreso
- Cada ítem de laboratorio, video y pregunta de defensa es marcable (hecho / pendiente)
- El estado se persiste en `localStorage` con la clave `ros2-go2-progress-v1`
- Barra de progreso global en la barra superior (sticky)
- Anillo de porcentaje SVG animado por semana

### Acordeones por semana
- Cada semana es un panel colapsable con animación suave
- Muestra: temas, laboratorios, videos con link a YouTube, fortalezas, preguntas de defensa, y reporte semanal

### Reporte semanal (notas de reflexión)
- Tres áreas de texto por semana: *Qué entendí bien*, *Qué me costó trabajo*, *Preguntas abiertas*
- Se guardan automáticamente en `localStorage` con debounce de 600ms
- Badge `✓ con notas` aparece cuando la semana tiene contenido escrito

### Referencia rápida de comandos (Sección E)
- 6 grupos de comandos ROS2: Nodos/tópicos, Servicios/acciones, TF2, Launch/params, SLAM+Nav2, Workspace
- Botón ⎘ copia el comando al clipboard directamente
- Confirmación visual ✓ por 1.4 segundos tras copiar

### Checklist final y sello de completado
- 12 competencias clave del curso
- Cuando todas están marcadas: sello desbloqueado con animación

### Evaluación y rúbrica
- Distribución de notas: laboratorios 50%, código 30%, capstone 20%
- Escala de calificación con rangos de color

---

## 5. Despliegue — paso a paso

### 5.1 Preparación del entorno

El proyecto ya estaba desarrollado como archivos estáticos. No requería build ni compilación.

**Herramientas usadas:**
- Firebase CLI (ya instalado globalmente con `npm install -g firebase-tools`)
- Cuenta de Firebase con el proyecto `quantum-odyssey-922b7` (Personal)

---

### 5.2 Identificar el proyecto Firebase

```powershell
firebase projects:list
```

**Salida:**
```
┌────────────────────────────┬────────────────────────────┬────────────────┐
│ Project Display Name       │ Project ID                 │ Project Number │
├────────────────────────────┼────────────────────────────┼────────────────┤
│ Desarrollo-Investigaciones │ desarrollo-investigaciones │ 293865702055   │
├────────────────────────────┼────────────────────────────┼────────────────┤
│ Personal                   │ quantum-odyssey-922b7      │ 52049046016    │
├────────────────────────────┼────────────────────────────┼────────────────┤
│ Sapiolab                   │ sapiolab-48252             │ 497175897227   │
└────────────────────────────┴────────────────────────────┴────────────────┘
```

El proyecto objetivo: **`quantum-odyssey-922b7`** (Personal).

> **Nota:** `firebase use` requiere estar dentro de un directorio con `.firebaserc`. Sin él, falla con *"must be run from a Firebase project directory"*.

---

### 5.3 Inicializar Firebase en el proyecto

```powershell
firebase init
```

**Respuestas al asistente interactivo:**

| Pregunta | Respuesta elegida | Razón |
|---|---|---|
| Which features? | **Hosting** | Solo se necesita hosting estático |
| Project setup | **Use an existing project** | El proyecto ya existía en Firebase |
| Select project | **quantum-odyssey-922b7 (Personal)** | Proyecto personal |
| Public directory | **`.`** (punto) | `index.html` está en la raíz, no en `/public` |
| Single-page app? | **No** | No es SPA — el servidor no necesita redirigir todo a index.html |
| GitHub Actions? | **No** | Deploy manual por ahora |
| Overwrite index.html? | **No** | Ya existe el archivo del proyecto |
| Install agent skills? | **No** | No requerido |

**Archivos generados por Firebase init:**
- `firebase.json` — configuración de hosting
- `.firebaserc` — proyecto Firebase activo
- `404.html` — página de error
- `.gitignore` — actualizado con exclusiones de Firebase

---

### 5.4 Configurar el sitio de destino

Firebase tiene un sitio específico dentro del proyecto llamado `curso-ros-ia`. Se agregó `"site"` al `firebase.json` para apuntar a él:

```json
{
  "hosting": {
    "site": "curso-ros-ia",
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

Sin `"site"`, Firebase despliega al sitio por defecto del proyecto, no al sitio específico `curso-ros-ia.web.app`.

---

### 5.5 Ejecutar el deploy

```powershell
firebase deploy
```

Firebase subió todos los archivos estáticos al CDN y el sitio quedó disponible en:

- **https://curso-ros-ia.web.app** ✓
- **https://curso-ros-ia.firebaseapp.com** ✓

---

### 5.6 Inicializar el repositorio de GitHub

```powershell
git init
git add .
git commit -m "Initial commit: plan de estudios ROS2 interactivo"
git remote add origin https://github.com/Diegojedap/Rob-tica-Ros2.git
git branch -M main
git push -u origin main
```

**Archivos subidos al repositorio (12 archivos, 2158 líneas):**

```
.firebaserc
.gitignore
404.html
README.md
css/main.css
firebase.json
index.html
js/app.js
js/data.js
netlify.toml
package.json
vercel.json
```

**Repositorio:** https://github.com/Diegojedap/Rob-tica-Ros2

---

## 6. URLs finales

| Recurso | URL |
|---|---|
| Sitio en producción | https://curso-ros-ia.web.app |
| Repositorio GitHub | https://github.com/Diegojedap/Rob-tica-Ros2 |
| Firebase Console | https://console.firebase.google.com/project/quantum-odyssey-922b7/hosting |

---

## 7. Flujo de actualización futura

Para publicar cambios después de editar el código:

```powershell
# 1. Subir cambios a GitHub
git add .
git commit -m "descripción del cambio"
git push

# 2. Desplegar a Firebase Hosting
firebase deploy
```

Ambos pasos son independientes — GitHub guarda el historial, Firebase sirve el sitio.

---

*Informe generado el 2026-06-04*
