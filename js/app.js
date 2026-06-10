const STORE_KEY = "ros2-go2-progress-v1";
const NOTES_KEY = "ros2-go2-notes-v1";
const TIMER_KEY = "ros2-go2-timers-v1";
const CONF_KEY  = "ros2-go2-conf-v1";
const LINKS_KEY = "ros2-go2-links-v1";
const CHECK_SVG = '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"></polyline></svg>';
const RING_WK   = 2 * Math.PI * 10;

let state = {}, notes = {}, timers = {}, conf = {}, links = {};
let activePage  = "inicio";
let activeWk    = null;
let activeTimer = { wkId: null, intId: null, startMs: 0 };
let flashState  = { cards: [], idx: 0 };
let saveTimer   = null;
let notesTimer  = null;

// ── Storage ───────────────────────────────────────────────────────────────────
function loadState()  { try { const s = localStorage.getItem(STORE_KEY); if (s) state  = JSON.parse(s); } catch { state  = {}; } }
function loadNotes()  { try { const s = localStorage.getItem(NOTES_KEY); if (s) notes  = JSON.parse(s); } catch { notes  = {}; } }
function loadTimers() { try { const s = localStorage.getItem(TIMER_KEY); if (s) timers = JSON.parse(s); } catch { timers = {}; } }
function loadConf()   { try { const s = localStorage.getItem(CONF_KEY);  if (s) conf   = JSON.parse(s); } catch { conf   = {}; } }
function loadLinks()  { try { const s = localStorage.getItem(LINKS_KEY); if (s) links  = JSON.parse(s); } catch { links  = {}; } }

function saveState()  { try { localStorage.setItem(STORE_KEY, JSON.stringify(state));  } catch(e){} showToast(); }
function saveNotes()  { try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes));  } catch(e){} }
function saveTimers() { try { localStorage.setItem(TIMER_KEY, JSON.stringify(timers)); } catch(e){} }
function saveConf()   { try { localStorage.setItem(CONF_KEY,  JSON.stringify(conf));   } catch(e){} }
function saveLinks()  { try { localStorage.setItem(LINKS_KEY, JSON.stringify(links));  } catch(e){} }

function showToast() {
  clearTimeout(saveTimer);
  const el = document.getElementById("flash");
  el.classList.add("show");
  saveTimer = setTimeout(() => el.classList.remove("show"), 1100);
}

// ── ID helpers ────────────────────────────────────────────────────────────────
function allIds() {
  const ids = [];
  WEEKS.forEach(w => ids.push(...weekIds(w)));
  FINAL.forEach(g => g.items.forEach(i => ids.push(i.id)));
  return ids;
}

function weekIds(w) {
  const ids = [];
  w.labs.forEach(i => ids.push(i.id));
  w.videos.forEach(i => ids.push(i.id));
  w.forts.forEach((_, i) => ids.push(`${w.id}_f${i}`));
  w.defensa.forEach((_, i) => ids.push(`${w.id}_d${i}`));
  return ids;
}

function weekPct(w) {
  const ids = weekIds(w);
  const done = ids.filter(id => state[id]).length;
  return ids.length ? Math.round((done / ids.length) * 100) : 0;
}

// ── HTML builders ─────────────────────────────────────────────────────────────
function itemHTML(item) {
  const detail = item.s ? `<small>${item.s}</small>` : "";
  return `<div class="item" data-id="${item.id}"><span class="box">${CHECK_SVG}</span><span class="lbl">${item.l}${detail}</span></div>`;
}

function labItemHTML(item) {
  const detail = item.s ? `<small>${item.s}</small>` : "";
  const link   = links[item.id] || "";
  const badge  = link
    ? `<a class="lab-link-badge" href="${link}" target="_blank" rel="noopener noreferrer">🔗 Ver trabajo</a>
       <button class="lab-link-clear" data-lid="${item.id}" title="Quitar enlace">✕</button>`
    : `<button class="lab-attach-btn" data-lid="${item.id}">📎 Adjuntar enlace</button>`;
  return `<div class="item lab-item" data-id="${item.id}">
    <span class="box">${CHECK_SVG}</span>
    <div class="lab-content">
      <span class="lbl">${item.l}${detail}</span>
      <div class="lab-foot">${badge}</div>
      <div class="lab-input-wrap" id="linput-${item.id}" style="display:none">
        <input class="lab-link-input" data-lid="${item.id}" type="text"
               placeholder="URL de GitHub, Drive, Notion, YouTube..." value="${link}"/>
        <button class="lab-link-save" data-lid="${item.id}">✓ Guardar</button>
      </div>
    </div>
  </div>`;
}

function videoHTML(item) {
  const link = item.url ? `<a class="vid-link" href="${item.url}" target="_blank" rel="noopener noreferrer">▶</a>` : "";
  return `<div class="item" data-id="${item.id}"><span class="box">${CHECK_SVG}</span><span class="lbl">${item.l}</span>${link}</div>`;
}

function defensaHTML(q, id) {
  return `<div class="defensa-item item" data-id="${id}"><span class="box">${CHECK_SVG}</span><span class="lbl">${q}</span></div>`;
}

function conceptosHTML(w) {
  if (!w.conceptos || !w.conceptos.length) return "";
  const cards = w.conceptos.map(c =>
    `<div class="concepto-card"><div class="concepto-t">${c.t}</div><div class="concepto-d">${c.d}</div></div>`
  ).join("");
  return `<div class="block"><div class="block-h">Conceptos clave</div><div class="conceptos-grid">${cards}</div></div>`;
}

function snippetHTML(w) {
  if (!w.snippet) return "";
  const escaped = w.snippet.c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return `<div class="block"><div class="block-h">Ejemplo de código</div>
    <div class="snippet-block">
      <div class="snippet-header"><span class="snippet-label">${w.snippet.l}</span><button class="copy-btn snippet-copy" title="Copiar código">⎘</button></div>
      <pre class="snippet-pre">${escaped}</pre>
    </div></div>`;
}

function notesBlockHTML(id) {
  const good = notes[`${id}_good`] || "", hard = notes[`${id}_hard`] || "", q = notes[`${id}_q`] || "";
  const has  = good || hard || q;
  return `<div class="block"><div class="block-h">Reporte semanal ${has ? '<span class="notes-saved-badge">✓ con notas</span>' : ""}</div>
    <div class="notes-grid">
      <div class="note-group"><label class="note-lbl">Qué entendí bien</label><textarea class="note-ta" data-note="${id}_good" placeholder="Escribe aquí tu reflexión...">${good}</textarea></div>
      <div class="note-group"><label class="note-lbl">Qué me costó trabajo</label><textarea class="note-ta" data-note="${id}_hard" placeholder="Obstáculos, dudas, errores...">${hard}</textarea></div>
      <div class="note-group note-full"><label class="note-lbl">Preguntas abiertas</label><textarea class="note-ta" data-note="${id}_q" placeholder="Lo que queda sin resolver...">${q}</textarea></div>
    </div></div>`;
}

function fmtTime(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function timerBlockHTML(wkId, estHours) {
  const secs = timers[wkId] || 0;
  return `<div class="block"><div class="block-h">Tiempo de estudio <span class="timer-est">est. ${estHours}h</span></div>
    <div class="timer-row"><span class="timer-display" data-wk="${wkId}">${fmtTime(secs)}</span>
    <button class="timer-btn start-btn" data-wk="${wkId}">▶ Iniciar</button>
    <button class="timer-btn reset-btn" data-wk="${wkId}">↺</button></div></div>`;
}

// ── Page HTML generators ──────────────────────────────────────────────────────
function pageInicioHTML() {
  const ids  = allIds();
  const pct  = ids.length ? Math.round(ids.filter(id => state[id]).length / ids.length * 100) : 0;
  const hrs  = WEEKS.reduce((s, w) => s + w.hours, 0);
  const labs = WEEKS.reduce((s, w) => s + w.labs.length, 0);

  const weekCards = WEEKS.map(w => {
    const p = weekPct(w), off = RING_WK - (RING_WK * p) / 100;
    return `<button class="iw-card" data-page="wk-${w.id}">
      <div class="iw-ring">
        <svg width="44" height="44" style="overflow:visible">
          <circle cx="22" cy="22" r="10" stroke="#1e2a35" stroke-width="2.5" fill="none"/>
          <circle cx="22" cy="22" r="10" stroke="#36dc84" stroke-width="2.5" fill="none"
            stroke-linecap="round" stroke-dasharray="${RING_WK.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
            style="transform:rotate(-90deg);transform-origin:22px 22px"/>
        </svg>
        <span class="iw-pct">${p === 100 ? "✓" : `${p}%`}</span>
      </div>
      <div class="iw-info">
        <div class="iw-tag">${w.tag}</div>
        <div class="iw-title">${w.t1}</div>
        <div class="iw-sub">${w.t2}</div>
      </div>
      <span class="iw-arrow">→</span>
    </button>`;
  }).join("");

  return `<header class="hero">
    <div class="kicker">Plan de estudios autogestionable · ${WEEKS.length} semanas</div>
    <h1>Robótica<br>Fundamental con <span class="em">ROS2</span></h1>
    <p class="lede">De cero a robot autónomo: domina nodos, tópicos, TF2, SLAM y Nav2 con el cuadrúpedo Unitree Go2 Air en simulación Gazebo.</p>
    <div class="meta-row">
      <span class="chip"><b>Unitree Go2 Air</b> · cuadrúpedo</span>
      <span class="chip"><b>ROS2 Humble</b> / Jazzy</span>
      <span class="chip"><b>Gazebo</b> Classic</span>
      <span class="chip"><b>Python 3</b> + C++17</span>
    </div>
    <div class="stats-strip">
      <div class="stat"><span class="stat-n">${WEEKS.length}</span><span class="stat-l">Semanas</span></div>
      <div class="stat"><span class="stat-n">${hrs}</span><span class="stat-l">Horas est.</span></div>
      <div class="stat"><span class="stat-n">${labs}</span><span class="stat-l">Laboratorios</span></div>
      <div class="stat"><span class="stat-n">${pct}%</span><span class="stat-l">Progreso</span></div>
    </div>
  </header>
  <div class="inicio-weeks">${weekCards}</div>`;
}

function pageArchHTML() {
  return `<div class="sec-head"><span class="sec-num">ARCH</span><h2>Arquitectura del Software</h2></div>
  <div class="arch-grid">
    <div class="card">
      <h3><span class="dot"></span>Pila de Software ROS2</h3>
      <p class="sub">Cómo se comunican los componentes</p>
      <div class="flow">
        <div class="flow-step"><span class="flow-ico">01</span><div class="flow-txt"><b>ROS2 Core</b><span>Middleware DDS/RTPS · descubrimiento automático</span></div></div>
        <div class="flow-step"><span class="flow-ico">02</span><div class="flow-txt"><b>rclpy / rclcpp</b><span>APIs de Python 3 y C++17 para nodos, tópicos, servicios</span></div></div>
        <div class="flow-step"><span class="flow-ico">03</span><div class="flow-txt"><b>TF2 + Nav2</b><span>Transformaciones de coordenadas y navegación autónoma</span></div></div>
        <div class="flow-step"><span class="flow-ico">04</span><div class="flow-txt"><b>Gazebo Sim</b><span>Simulación física con sensores virtuales y URDF</span></div></div>
      </div>
    </div>
    <div class="card">
      <h3><span class="dot"></span>Stack Tecnológico</h3>
      <p class="sub">Entorno de desarrollo y ejecución</p>
      <div class="stack">
        <div class="node">Ubuntu 22.04<small>S.O.</small></div><span class="arrow">→</span>
        <div class="node">ROS2 Humble<small>Middleware</small></div><span class="arrow">→</span>
        <div class="node">Gazebo Classic<small>Simulador</small></div><span class="arrow">→</span>
        <div class="node">Python 3 / C++17<small>Lenguajes</small></div><span class="arrow">→</span>
        <div class="node">MoveIt2 + Nav2<small>Planning</small></div>
      </div>
    </div>
    <div class="card arch-full">
      <h3><span class="dot"></span>Capas del Sistema</h3>
      <p class="sub">Desde hardware hasta comportamiento autónomo</p>
      <div class="layers">
        <div class="layer"><div class="lt">Hardware · Unitree Go2 Air</div><div class="ld">Motores, IMU, LiDAR, cámara depth</div><div class="lmap">ros2_unitree_sdk · SDK bridge</div></div>
        <div class="layer"><div class="lt">ROS2 Core · Topics &amp; Services</div><div class="ld">Nodos productores/consumidores · QoS policies · DDS</div><div class="lmap">/cmd_vel · /joint_states · /scan · /odom</div></div>
        <div class="layer"><div class="lt">Percepción · TF2 + Sensores</div><div class="ld">Árbol de transformaciones · fusión sensorial · mapas de costo</div><div class="lmap">map → odom → base_link → camera_link</div></div>
        <div class="layer"><div class="lt">Navegación · SLAM + Nav2</div><div class="ld">Cartographer / SLAM Toolbox · planeación BT</div><div class="lmap">slam_toolbox · nav2_bringup · behavior_tree</div></div>
      </div>
    </div>
  </div>`;
}

function pageChecklistHTML() {
  return `<div class="sec-head"><span class="sec-num">CHK</span><h2>Checklist Final</h2></div>
  <div class="final">
    <p class="sub" style="margin-bottom:16px;font-size:.88rem;color:var(--dim)">Las 12 competencias clave que debes dominar al terminar el curso.</p>
    <div class="final-grid" id="finalGrid"></div>
    <div class="seal" id="seal">
      <div class="lock" id="sealIcon">🔒</div>
      <h3 id="sealTitle">Sello de completado bloqueado</h3>
      <p id="sealMsg">Completa el checklist para desbloquear el sello.</p>
    </div>
  </div>`;
}

function pageEvalHTML() {
  return `<div class="sec-head"><span class="sec-num">EVAL</span><h2>Evaluación y Rúbrica</h2></div>
  <div class="eval-grid">
    <div class="eval-card">
      <div class="eval-h">📊 Distribución de notas</div>
      <div class="eval-row"><span class="eval-comp">Laboratorios semanales</span><span class="eval-pct pct-50">50%</span></div>
      <div class="eval-row"><span class="eval-comp">Calidad del código</span><span class="eval-pct pct-30">30%</span></div>
      <div class="eval-row"><span class="eval-comp">Proyecto capstone</span><span class="eval-pct pct-20">20%</span></div>
    </div>
    <div class="eval-card">
      <div class="eval-h">🎯 Escala de calificación</div>
      <div class="eval-scale">
        <div class="scale-row"><span class="scale-range green-t">90–100</span><span class="scale-label">Excepcional — listo para producción</span></div>
        <div class="scale-row"><span class="scale-range green-t">80–89</span><span class="scale-label">Sólido — manejo confiable</span></div>
        <div class="scale-row"><span class="scale-range amber-t">70–79</span><span class="scale-label">Aprobado — base suficiente</span></div>
        <div class="scale-row"><span class="scale-range red-t">&lt;70</span><span class="scale-label">Necesita trabajo adicional</span></div>
      </div>
    </div>
    <div class="eval-card eval-full">
      <div class="eval-h">📋 Política de evaluación</div>
      <p class="eval-note">
        <strong>Laboratorios:</strong> Cada semana incluye 3–5 entregables técnicos (código funcional, screenshots de Rviz/Gazebo, logs de terminal). Se evalúa funcionamiento, claridad del código y documentación breve.<br><br>
        <strong>Código:</strong> El repositorio personal debe mostrar commits regulares, mensajes descriptivos y estructuras de paquete ROS2 correctas (package.xml, CMakeLists.txt / setup.py).<br><br>
        <strong>Capstone:</strong> Demostración en Gazebo de un robot Go2 navegando de forma autónoma, evitando obstáculos dinámicos con Nav2 y publicando su trayectoria en Rviz.
      </p>
    </div>
  </div>`;
}

function pageCommandsHTML() {
  return `<div class="sec-head"><span class="sec-num">CMD</span><h2>Referencia de Comandos</h2></div>
  <div id="cmdGrid" class="cmd-grid"></div>`;
}

function renderWeekContent(wkId) {
  const w = WEEKS.find(x => x.id === wkId);
  const idx = WEEKS.indexOf(w);
  const pct = weekPct(w);
  const topics  = w.topics.map(t => `<button class="topic" data-wk="${w.id}" data-topic="${t}">${t}</button>`).join("");
  const labs    = w.labs.map(labItemHTML).join("");
  const vids    = w.videos.map(videoHTML).join("");
  const forts   = w.forts.map((f, i) => `<div class="fort" data-id="${w.id}_f${i}"><span class="led"></span>${f}</div>`).join("");
  const defensa = w.defensa.map((q, i) => defensaHTML(q, `${w.id}_d${i}`)).join("");
  const prevId  = idx > 0 ? WEEKS[idx-1].id : "";
  const nextId  = idx < WEEKS.length-1 ? WEEKS[idx+1].id : "";

  return `<div class="lesson-header">
    <div class="lh-top">
      <span class="lh-tag">${w.tag}</span>
      <span class="lh-hrs">${w.hours}h</span>
      <span class="lh-pct" id="lhPct">${pct === 100 ? "✓ Completado" : `${pct}% completado`}</span>
    </div>
    <h2 class="lh-title">${w.t1}</h2>
    <p class="lh-subtitle">${w.t2}</p>
    <p class="lh-obj">${w.obj}</p>
  </div>
  <div class="lesson-body">
    ${conceptosHTML(w)}
    <div class="block"><div class="block-h">Temas de la semana</div><div class="topics">${topics}</div></div>
    <div class="block"><div class="block-h">Laboratorio · Entregables</div>${labs}</div>
    <div class="block"><div class="block-h">Videos verificados</div>${vids}</div>
    ${snippetHTML(w)}
    <div class="block"><div class="block-h">Fortalezas que ganas</div><div class="forts">${forts}</div></div>
    <div class="block"><div class="block-h">Preguntas de defensa <span class="defensa-hint">— respóndelas sin mirar notas</span></div>${defensa}</div>
    ${timerBlockHTML(w.id, w.hours)}
    ${notesBlockHTML(w.id)}
  </div>
  <div class="lesson-footer">
    <button class="lf-btn" data-go="${prevId}" ${!prevId ? "disabled" : ""}>← Semana anterior</button>
    <button class="lf-btn" data-go="${nextId}" ${!nextId ? "disabled" : ""}>Semana siguiente →</button>
  </div>`;
}

// ── Global sidebar ────────────────────────────────────────────────────────────
function renderGlobalSidebar() {
  const allDone   = allIds().filter(id => state[id]).length;
  const globalPct = allIds().length ? Math.round(allDone / allIds().length * 100) : 0;

  function navItem(pageId, icon, label) {
    const cls = activePage === pageId ? "gs-item active" : "gs-item";
    return `<button class="${cls}" data-page="${pageId}"><span class="gs-icon">${icon}</span><span class="gs-label">${label}</span></button>`;
  }

  const weekItems = WEEKS.map(w => {
    const p = weekPct(w), r = 10;
    const C = 2 * Math.PI * r;
    const off = C - (C * p) / 100;
    const cls = activePage === `wk-${w.id}` ? "gs-item gs-week-item active" : "gs-item gs-week-item";
    return `<button class="${cls}" data-page="wk-${w.id}">
      <div class="gs-ring">
        <svg width="28" height="28"><circle cx="14" cy="14" r="${r}" stroke="#1e2a35" stroke-width="2.5" fill="none"/>
        <circle cx="14" cy="14" r="${r}" stroke="#36dc84" stroke-width="2.5" fill="none" stroke-linecap="round"
          stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
          style="transform:rotate(-90deg);transform-origin:14px 14px"/></svg>
        <span class="gs-rpct">${p === 100 ? "✓" : `${p}%`}</span>
      </div>
      <div class="gs-wk-info">
        <div class="gs-wk-tag">${w.tag}</div>
        <div class="gs-wk-title">${w.t1}</div>
      </div>
    </button>`;
  }).join("");

  document.getElementById("gSidebar").innerHTML = `
    <div class="gs-head">
      <div class="gs-logo">ROS2<span>//</span>GO2</div>
      <div class="gs-subtitle">Robótica Fundamental</div>
      <div class="gs-prog-row">
        <div class="gs-prog-track"><div class="gs-prog-fill" style="width:${globalPct}%"></div></div>
        <span class="gs-prog-pct">${globalPct}%</span>
      </div>
    </div>
    <nav class="gs-nav">
      <div class="gs-section">OVERVIEW</div>
      ${navItem("inicio", "🏠", "Inicio")}
      ${navItem("arch",   "🏗", "Arquitectura")}
      <div class="gs-section">SEMANAS</div>
      ${weekItems}
      <div class="gs-section">RECURSOS</div>
      ${navItem("checklist", "✅", "Checklist final")}
      ${navItem("eval",      "📊", "Evaluación")}
      ${navItem("commands",  "⌨",  "Comandos")}
    </nav>`;

  document.getElementById("gSidebar").querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      showPage(btn.dataset.page);
      document.getElementById("gSidebar").classList.remove("open");
    });
  });
}

// ── Page navigation ───────────────────────────────────────────────────────────
function showPage(pageId) {
  if (activeTimer.wkId && pageId !== `wk-${activeTimer.wkId}`) pauseTimer();

  activePage = pageId;
  const content = document.getElementById("pageContent");
  content.className = "page-content";

  if (pageId === "inicio") {
    content.innerHTML = pageInicioHTML();
    content.querySelectorAll("[data-page]").forEach(btn =>
      btn.addEventListener("click", () => showPage(btn.dataset.page))
    );
  } else if (pageId === "arch") {
    content.innerHTML = pageArchHTML();
  } else if (pageId.startsWith("wk-")) {
    const wkId = pageId.replace("wk-", "");
    activeWk = wkId;
    content.classList.add("page-week");
    content.innerHTML = renderWeekContent(wkId);
    applyWeekState(wkId);
  } else if (pageId === "checklist") {
    content.innerHTML = pageChecklistHTML();
    renderFinal();
    applyFinalState();
  } else if (pageId === "eval") {
    content.innerHTML = pageEvalHTML();
  } else if (pageId === "commands") {
    content.innerHTML = pageCommandsHTML();
    renderCommands();
  }

  renderGlobalSidebar();
  window.scrollTo(0, 0);
}

// ── Apply state ───────────────────────────────────────────────────────────────
function applyWeekState(wkId) {
  const w = WEEKS.find(x => x.id === wkId);
  weekIds(w).forEach(applyOne);
  w.forts.forEach((_, i) => applyOne(`${w.id}_f${i}`));
}

function applyOne(id) {
  const done = !!state[id];
  document.querySelectorAll(`.item[data-id="${id}"]`).forEach(e => e.classList.toggle("done", done));
  document.querySelectorAll(`.fort[data-id="${id}"]`).forEach(e => e.classList.toggle("on", done));
}

function applyFinalState() {
  FINAL.flatMap(g => g.items).forEach(i => applyOne(i.id));
}

// ── Render helpers ────────────────────────────────────────────────────────────
function renderFinal() {
  const grid = document.getElementById("finalGrid");
  if (!grid) return;
  grid.innerHTML = "";
  FINAL.forEach(grp => {
    const col = document.createElement("div");
    col.innerHTML = `<div class="fc-week">${grp.w}</div>` + grp.items.map(itemHTML).join("");
    grid.appendChild(col);
  });
}

function renderCommands() {
  const root = document.getElementById("cmdGrid");
  if (!root) return;
  root.innerHTML = COMMANDS.map(grp => `<div class="cmd-group">
    <div class="cmd-group-h">${grp.group}</div>
    ${grp.cmds.map(cmd => `<div class="cmd-row">
      <div class="cmd-content"><code class="cmd-code">${cmd.c}</code><span class="cmd-desc">${cmd.d}</span></div>
      <button class="copy-btn" title="Copiar">⎘</button>
    </div>`).join("")}
  </div>`).join("");
}

// ── Progress refresh ──────────────────────────────────────────────────────────
function refreshProgress() {
  const ids = allIds();
  const pct = ids.length ? Math.round(ids.filter(id => state[id]).length / ids.length * 100) : 0;
  document.getElementById("tbFill").style.width = `${pct}%`;
  document.getElementById("tbPct").textContent  = `${pct}%`;

  renderGlobalSidebar();

  if (activePage && activePage.startsWith("wk-")) {
    const lhPct = document.getElementById("lhPct");
    if (lhPct) {
      const p = weekPct(WEEKS.find(w => w.id === activeWk));
      lhPct.textContent = p === 100 ? "✓ Completado" : `${p}% completado`;
    }
  }

  const seal = document.getElementById("seal");
  if (seal) {
    const finalIds  = FINAL.flatMap(g => g.items.map(i => i.id));
    const allDone   = finalIds.every(id => state[id]);
    const remaining = finalIds.filter(id => !state[id]).length;
    seal.classList.toggle("unlocked", allDone);
    document.getElementById("sealIcon").textContent  = allDone ? "🎓" : "🔒";
    document.getElementById("sealTitle").textContent = allDone ? "¡Sello de completado desbloqueado!" : "Sello de completado bloqueado";
    document.getElementById("sealMsg").textContent   = allDone
      ? "Tienes las bases para trabajar con cualquier robot que use ROS2. Felicitaciones."
      : `Te faltan ${remaining} competencia${remaining !== 1 ? "s" : ""} del checklist final.`;
  }
}

// ── Lab attachment DOM update ─────────────────────────────────────────────────
function updateLabItemDOM(lid) {
  const item = document.querySelector(`.lab-item[data-id="${lid}"]`);
  if (!item) return;
  const link = links[lid] || "";
  const foot = item.querySelector(".lab-foot");
  if (foot) {
    foot.innerHTML = link
      ? `<a class="lab-link-badge" href="${link}" target="_blank" rel="noopener noreferrer">🔗 Ver trabajo</a>
         <button class="lab-link-clear" data-lid="${lid}" title="Quitar enlace">✕</button>`
      : `<button class="lab-attach-btn" data-lid="${lid}">📎 Adjuntar enlace</button>`;
  }
  const wrap = document.getElementById(`linput-${lid}`);
  if (wrap) wrap.style.display = "none";
}

// ── Event delegation ──────────────────────────────────────────────────────────
function bindPageContent() {
  const content = document.getElementById("pageContent");

  content.addEventListener("click", e => {
    // Topic chips — must come first so nothing else can swallow the click
    const topicBtn = e.target.closest(".topic[data-topic]");
    if (topicBtn) {
      openTopicModal(topicBtn.dataset.wk, topicBtn.dataset.topic);
      return;
    }

    // Lab attachment buttons (before item handler so they don't toggle checkbox)
    const attachBtn = e.target.closest(".lab-attach-btn");
    if (attachBtn) {
      const lid = attachBtn.dataset.lid;
      const wrap = document.getElementById(`linput-${lid}`);
      if (wrap) { wrap.style.display = "flex"; wrap.querySelector("input")?.focus(); }
      return;
    }
    const saveBtn = e.target.closest(".lab-link-save");
    if (saveBtn) {
      const lid = saveBtn.dataset.lid;
      const inp = document.querySelector(`.lab-link-input[data-lid="${lid}"]`);
      if (inp) { links[lid] = inp.value.trim(); saveLinks(); updateLabItemDOM(lid); }
      return;
    }
    const clearBtn = e.target.closest(".lab-link-clear");
    if (clearBtn) {
      const lid = clearBtn.dataset.lid;
      links[lid] = ""; saveLinks(); updateLabItemDOM(lid);
      return;
    }

    const item = e.target.closest(".item");
    if (item && !e.target.closest(".vid-link") && !e.target.closest(".lab-foot") && !e.target.closest(".lab-input-wrap")) {
      const id = item.dataset.id;
      state[id] = !state[id];
      applyOne(id); refreshProgress(); saveState();
      return;
    }
    const fort = e.target.closest(".fort");
    if (fort) {
      const id = fort.dataset.id;
      state[id] = !state[id];
      applyOne(id); refreshProgress(); saveState();
      return;
    }
    const startBtn = e.target.closest(".start-btn");
    if (startBtn) {
      const wkId = startBtn.dataset.wk;
      activeTimer.wkId === wkId ? pauseTimer() : (activeTimer.wkId && pauseTimer(), startTimer(wkId));
      return;
    }
    const resetBtn = e.target.closest(".reset-btn");
    if (resetBtn) {
      const wkId = resetBtn.dataset.wk;
      if (activeTimer.wkId === wkId) pauseTimer();
      timers[wkId] = 0; saveTimers(); updateTimerDisplay(wkId);
      return;
    }
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const code = copyBtn.closest(".cmd-row")?.querySelector(".cmd-code")?.textContent
        ?? copyBtn.closest(".snippet-header")?.nextElementSibling?.textContent ?? "";
      navigator.clipboard.writeText(code.trim()).then(() => {
        copyBtn.textContent = "✓"; copyBtn.classList.add("copied");
        setTimeout(() => { copyBtn.textContent = "⎘"; copyBtn.classList.remove("copied"); }, 1400);
      });
      return;
    }
    const goBtn = e.target.closest("[data-go]");
    if (goBtn && goBtn.dataset.go) {
      showPage(`wk-${goBtn.dataset.go}`);
      return;
    }
  });

  content.addEventListener("input", e => {
    const ta = e.target.closest(".note-ta");
    if (!ta) return;
    const key = ta.dataset.note;
    notes[key] = ta.value;
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      saveNotes();
      const wkId = key.replace(/_good|_hard|_q$/, "");
      const hasContent = Object.keys(notes).some(k => k.startsWith(wkId) && notes[k].trim());
      if (hasContent && !content.querySelector(".notes-saved-badge")) {
        const blockH = ta.closest(".block")?.querySelector(".block-h");
        if (blockH) { const s = document.createElement("span"); s.className = "notes-saved-badge"; s.textContent = "✓ con notas"; blockH.appendChild(s); }
      }
    }, 600);
  });
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function startTimer(wkId) {
  activeTimer = { wkId, startMs: Date.now(), intId: setInterval(() => {
    updateTimerDisplay(wkId, (timers[wkId] || 0) + Math.floor((Date.now() - activeTimer.startMs) / 1000));
  }, 1000) };
  const btn = document.querySelector(`.start-btn[data-wk="${wkId}"]`);
  if (btn) { btn.textContent = "⏸ Pausar"; btn.classList.add("running"); }
}

function pauseTimer() {
  if (!activeTimer.wkId) return;
  clearInterval(activeTimer.intId);
  timers[activeTimer.wkId] = (timers[activeTimer.wkId] || 0) + Math.floor((Date.now() - activeTimer.startMs) / 1000);
  saveTimers(); updateTimerDisplay(activeTimer.wkId);
  const btn = document.querySelector(`.start-btn[data-wk="${activeTimer.wkId}"]`);
  if (btn) { btn.textContent = "▶ Iniciar"; btn.classList.remove("running"); }
  activeTimer = { wkId: null, intId: null, startMs: 0 };
}

function updateTimerDisplay(wkId, secs) {
  const el = document.querySelector(`.timer-display[data-wk="${wkId}"]`);
  if (el) el.textContent = fmtTime(secs !== undefined ? secs : (timers[wkId] || 0));
}

// ── Export / Import ───────────────────────────────────────────────────────────
function exportProgress() {
  const blob = new Blob([JSON.stringify({ state, notes, timers, conf, links }, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `ros2-progreso-${new Date().toISOString().slice(0,10)}.json` });
  a.click(); URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      if (d.state)  localStorage.setItem(STORE_KEY, JSON.stringify(d.state));
      if (d.notes)  localStorage.setItem(NOTES_KEY, JSON.stringify(d.notes));
      if (d.timers) localStorage.setItem(TIMER_KEY, JSON.stringify(d.timers));
      if (d.conf)   localStorage.setItem(CONF_KEY,  JSON.stringify(d.conf));
      if (d.links)  localStorage.setItem(LINKS_KEY, JSON.stringify(d.links));
      location.reload();
    } catch { alert("Archivo inválido."); }
  };
  reader.readAsText(file);
}

function bindExport() {
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  const input = document.getElementById("importInput");
  document.getElementById("importBtn").addEventListener("click", () => input.click());
  input.addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;
    if (confirm("¿Importar este archivo? Reemplazará tu progreso actual.")) importProgress(file);
    input.value = "";
  });
}

// ── Flashcards ────────────────────────────────────────────────────────────────
function confKey(idx) { return `${flashState.cards[idx].week}_${idx}`; }

function openFlashcards() {
  const cards = [];
  WEEKS.forEach(w => w.defensa.forEach(q => cards.push({ week: w.tag, q })));
  flashState = { cards, idx: 0 };
  renderFlashcard();
  document.getElementById("flashModal").classList.add("open");
}

function renderFlashcard() {
  const { cards, idx } = flashState; if (!cards.length) return;
  const cur = conf[confKey(idx)] || 0;
  document.getElementById("flashWeek").textContent    = cards[idx].week;
  document.getElementById("flashCounter").textContent = `${idx + 1} de ${cards.length}`;
  document.getElementById("flashQ").textContent       = cards[idx].q;
  document.getElementById("flashPrev").disabled = idx === 0;
  document.getElementById("flashNext").disabled = idx === cards.length - 1;
  document.querySelectorAll(".conf-btn").forEach(btn =>
    btn.classList.toggle("active", parseInt(btn.dataset.conf) === cur)
  );
}

function bindFlashcards() {
  const modal = document.getElementById("flashModal");
  document.getElementById("flashBtn").addEventListener("click", openFlashcards);
  document.getElementById("flashClose").addEventListener("click", () => modal.classList.remove("open"));
  document.getElementById("flashPrev").addEventListener("click", () => { if (flashState.idx > 0) { flashState.idx--; renderFlashcard(); } });
  document.getElementById("flashNext").addEventListener("click", () => { if (flashState.idx < flashState.cards.length-1) { flashState.idx++; renderFlashcard(); } });
  document.querySelectorAll(".conf-btn").forEach(btn => btn.addEventListener("click", () => {
    conf[confKey(flashState.idx)] = parseInt(btn.dataset.conf); saveConf(); renderFlashcard();
  }));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });
  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { if (flashState.idx < flashState.cards.length-1) { flashState.idx++; renderFlashcard(); } }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { if (flashState.idx > 0) { flashState.idx--; renderFlashcard(); } }
    else if (e.key === "Escape") modal.classList.remove("open");
  });
}

// ── Topic modal ───────────────────────────────────────────────────────────────
function openTopicModal(wkId, topicName) {
  const w = WEEKS.find(x => x.id === wkId);
  if (!w) return;
  const detail = w.topicDetails && w.topicDetails[topicName];

  document.getElementById("tmWeek").textContent  = w.tag;
  document.getElementById("tmTitle").textContent = topicName;

  if (detail) {
    document.getElementById("tmDesc").textContent = detail.desc;
    const codeEl = document.getElementById("tmCode");
    if (detail.code) {
      const escaped = detail.code
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      document.getElementById("tmCodeLabel").textContent = detail.codeLabel || "Ejemplo";
      document.getElementById("tmCodePre").innerHTML = escaped;
      codeEl.style.display = "block";
    } else {
      codeEl.style.display = "none";
    }
  } else {
    document.getElementById("tmDesc").textContent = "Contenido en desarrollo.";
    document.getElementById("tmCode").style.display = "none";
  }

  document.getElementById("topicModal").classList.add("open");
}

function bindTopicModal() {
  const modal = document.getElementById("topicModal");
  document.getElementById("tmClose").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });
  document.getElementById("tmCopyBtn").addEventListener("click", () => {
    const code = document.getElementById("tmCodePre").textContent;
    navigator.clipboard.writeText(code.trim()).then(() => {
      const btn = document.getElementById("tmCopyBtn");
      btn.textContent = "✓"; btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "⎘"; btn.classList.remove("copied"); }, 1400);
    });
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) modal.classList.remove("open");
  });
}

// ── Reset & mobile toggle ─────────────────────────────────────────────────────
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("¿Reiniciar todo el progreso? Esta acción no se puede deshacer.")) {
    state = {}; saveState(); showPage(activePage); refreshProgress();
  }
});

document.getElementById("gsToggle").addEventListener("click", () => {
  document.getElementById("gSidebar").classList.toggle("open");
});

document.addEventListener("click", e => {
  const sidebar = document.getElementById("gSidebar");
  if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && !e.target.closest("#gsToggle")) {
    sidebar.classList.remove("open");
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
  loadState(); loadNotes(); loadTimers(); loadConf(); loadLinks();
  activeWk = WEEKS[0].id;
  showPage("inicio");
  bindPageContent();
  bindExport();
  bindFlashcards();
  bindTopicModal();
  refreshProgress();
  window.addEventListener("beforeunload", () => { if (activeTimer.wkId) pauseTimer(); });
})();
