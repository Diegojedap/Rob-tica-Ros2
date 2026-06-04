const STORE_KEY  = "ros2-go2-progress-v1";
const NOTES_KEY  = "ros2-go2-notes-v1";
const CHECK_SVG  = '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"></polyline></svg>';
const RING_CIRCUMFERENCE = 119.4;

let state = {};
let notes = {};
let saveTimer   = null;
let notesTimer  = null;

// ── Storage ──────────────────────────────────────────────────────────────────

function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) state = JSON.parse(saved);
  } catch { state = {}; }
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  showToast();
}

function loadNotes() {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    if (saved) notes = JSON.parse(saved);
  } catch { notes = {}; }
}

function saveNotes() {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch (e) {}
}

function showToast() {
  clearTimeout(saveTimer);
  const el = document.getElementById("flash");
  el.classList.add("show");
  saveTimer = setTimeout(() => el.classList.remove("show"), 1100);
}

// ── ID helpers ───────────────────────────────────────────────────────────────

function allIds() {
  const ids = [];
  WEEKS.forEach((w) => ids.push(...weekIds(w)));
  FINAL.forEach((g) => g.items.forEach((i) => ids.push(i.id)));
  return ids;
}

function weekIds(w) {
  const ids = [];
  w.labs.forEach((i) => ids.push(i.id));
  w.videos.forEach((i) => ids.push(i.id));
  w.forts.forEach((_, i) => ids.push(`${w.id}_f${i}`));
  w.defensa.forEach((_, i) => ids.push(`${w.id}_d${i}`));
  return ids;
}

// ── Render ───────────────────────────────────────────────────────────────────

function itemHTML(item) {
  const detail = item.s ? `<small>${item.s}</small>` : "";
  return `<div class="item" data-id="${item.id}">
    <span class="box">${CHECK_SVG}</span>
    <span class="lbl">${item.l}${detail}</span>
  </div>`;
}

function videoHTML(item) {
  const link = item.url
    ? `<a class="vid-link" href="${item.url}" target="_blank" rel="noopener noreferrer" title="Abrir en YouTube">▶</a>`
    : "";
  return `<div class="item" data-id="${item.id}">
    <span class="box">${CHECK_SVG}</span>
    <span class="lbl">${item.l}</span>
    ${link}
  </div>`;
}

function defensaHTML(question, id) {
  return `<div class="defensa-item item" data-id="${id}">
    <span class="box">${CHECK_SVG}</span>
    <span class="lbl">${question}</span>
  </div>`;
}

function notesBlockHTML(id) {
  const good = notes[`${id}_good`] || "";
  const hard = notes[`${id}_hard`] || "";
  const q    = notes[`${id}_q`]    || "";
  const hasNotes = good || hard || q;
  return `
    <div class="block">
      <div class="block-h">
        Reporte semanal
        ${hasNotes ? '<span class="notes-saved-badge">✓ con notas</span>' : ""}
      </div>
      <div class="notes-grid">
        <div class="note-group">
          <label class="note-lbl">Qué entendí bien</label>
          <textarea class="note-ta" data-note="${id}_good" placeholder="Escribe aquí tu reflexión...">${good}</textarea>
        </div>
        <div class="note-group">
          <label class="note-lbl">Qué me costó trabajo</label>
          <textarea class="note-ta" data-note="${id}_hard" placeholder="Obstáculos, dudas, errores...">${hard}</textarea>
        </div>
        <div class="note-group note-full">
          <label class="note-lbl">Preguntas abiertas</label>
          <textarea class="note-ta" data-note="${id}_q" placeholder="Lo que queda sin resolver para investigar...">${q}</textarea>
        </div>
      </div>
    </div>`;
}

function renderWeeks() {
  const root = document.getElementById("weeks");
  root.innerHTML = "";

  WEEKS.forEach((w) => {
    const el = document.createElement("div");
    el.className = "week";
    el.dataset.wk = w.id;

    const topics  = w.topics.map((t) => `<span class="topic">${t}</span>`).join("");
    const labs    = w.labs.map(itemHTML).join("");
    const vids    = w.videos.map(videoHTML).join("");
    const forts   = w.forts.map((f, i) => `<div class="fort" data-id="${w.id}_f${i}"><span class="led"></span>${f}</div>`).join("");
    const defensa = w.defensa.map((q, i) => defensaHTML(q, `${w.id}_d${i}`)).join("");

    el.innerHTML = `
      <div class="week-bar">
        <span class="wk-tag">${w.tag}</span>
        <span class="wk-hrs">${w.hours}h</span>
        <div class="wk-titles">
          <div class="t1">${w.t1}</div>
          <div class="t2">${w.t2}</div>
        </div>
        <div class="wk-ring">
          <svg width="46" height="46">
            <circle cx="23" cy="23" r="19" stroke="#1e2a35" stroke-width="4" fill="none"/>
            <circle class="ringfill" cx="23" cy="23" r="19" stroke="#36dc84" stroke-width="4"
              fill="none" stroke-linecap="round"
              stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${RING_CIRCUMFERENCE}"/>
          </svg>
          <span class="pct">0%</span>
        </div>
        <span class="chev">›</span>
      </div>
      <div class="week-body">
        <div class="wb-inner">
          <p class="week-obj">${w.obj}</p>
          <div class="block"><div class="block-h">Temas</div><div class="topics">${topics}</div></div>
          <div class="block"><div class="block-h">Laboratorio · Entregables</div>${labs}</div>
          <div class="block"><div class="block-h">Videos verificados</div>${vids}</div>
          <div class="block"><div class="block-h">Fortalezas que ganas</div><div class="forts">${forts}</div></div>
          <div class="block">
            <div class="block-h">Preguntas de defensa <span class="defensa-hint">— respóndelas sin mirar notas</span></div>
            ${defensa}
          </div>
          ${notesBlockHTML(w.id)}
        </div>
      </div>`;

    el.querySelector(".week-bar").addEventListener("click", () => {
      const open = el.classList.toggle("open");
      const body = el.querySelector(".week-body");
      body.style.maxHeight = open ? `${body.scrollHeight}px` : "0";
    });

    root.appendChild(el);
  });
}

function renderFinal() {
  const grid = document.getElementById("finalGrid");
  grid.innerHTML = "";
  FINAL.forEach((grp) => {
    const col = document.createElement("div");
    col.innerHTML = `<div class="fc-week">${grp.w}</div>` + grp.items.map(itemHTML).join("");
    grid.appendChild(col);
  });
}

// ── Interaction ───────────────────────────────────────────────────────────────

function bindChecks() {
  document.querySelectorAll(".item").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".vid-link")) return;
      const id = el.dataset.id;
      state[id] = !state[id];
      applyOne(id);
      refreshAll();
      saveState();
    });
  });

  document.querySelectorAll(".fort").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      state[id] = !state[id];
      applyOne(id);
      refreshAll();
      saveState();
    });
  });
}

function bindNotes() {
  document.querySelectorAll(".note-ta").forEach((ta) => {
    ta.addEventListener("input", () => {
      const key = ta.dataset.note;
      notes[key] = ta.value;
      clearTimeout(notesTimer);
      notesTimer = setTimeout(() => {
        saveNotes();
        // refresh badge inside the same week panel
        const wkId = key.replace(/_good|_hard|_q$/, "");
        const badge = document.querySelector(`.week[data-wk="${wkId}"] .notes-saved-badge`);
        const hasContent = Object.keys(notes).some((k) => k.startsWith(wkId) && notes[k].trim());
        if (hasContent && !badge) {
          const blockH = ta.closest(".block").querySelector(".block-h");
          const span = document.createElement("span");
          span.className = "notes-saved-badge";
          span.textContent = "✓ con notas";
          blockH.appendChild(span);
        }
        // keep accordion open height correct after textarea resize
        const wkEl = document.querySelector(`.week[data-wk="${wkId}"]`);
        if (wkEl && wkEl.classList.contains("open")) {
          const body = wkEl.querySelector(".week-body");
          body.style.maxHeight = `${body.scrollHeight}px`;
        }
      }, 600);
    });
  });
}

function applyOne(id) {
  const done = !!state[id];
  document.querySelectorAll(`.item[data-id="${id}"]`).forEach((e) => e.classList.toggle("done", done));
  document.querySelectorAll(`.fort[data-id="${id}"]`).forEach((e) => e.classList.toggle("on", done));
}

function applyAll() {
  allIds().forEach(applyOne);
}

// ── Progress refresh ──────────────────────────────────────────────────────────

function refreshAll() {
  WEEKS.forEach((w) => {
    const ids = weekIds(w);
    const doneCount = ids.filter((id) => state[id]).length;
    const pct = ids.length ? Math.round((doneCount / ids.length) * 100) : 0;

    const wkEl = document.querySelector(`.week[data-wk="${w.id}"]`);
    wkEl.querySelector(".pct").textContent = `${pct}%`;
    wkEl.querySelector(".ringfill").style.strokeDashoffset =
      RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * pct) / 100;

    if (wkEl.classList.contains("open")) {
      const body = wkEl.querySelector(".week-body");
      body.style.maxHeight = `${body.scrollHeight}px`;
    }
  });

  const ids = allIds();
  const doneCount = ids.filter((id) => state[id]).length;
  const pct = ids.length ? Math.round((doneCount / ids.length) * 100) : 0;
  document.getElementById("tbFill").style.width = `${pct}%`;
  document.getElementById("tbPct").textContent = `${pct}%`;

  const finalIds = FINAL.flatMap((g) => g.items.map((i) => i.id));
  const allDone = finalIds.every((id) => state[id]);
  const remaining = finalIds.filter((id) => !state[id]).length;

  document.getElementById("seal").classList.toggle("unlocked", allDone);
  document.getElementById("sealIcon").textContent = allDone ? "🎓" : "🔒";
  document.getElementById("sealTitle").textContent = allDone
    ? "¡Sello de completado desbloqueado!"
    : "Sello de completado bloqueado";
  document.getElementById("sealMsg").textContent = allDone
    ? "Tienes las bases para trabajar con cualquier robot que use ROS2. Felicitaciones."
    : `Te faltan ${remaining} competencia${remaining !== 1 ? "s" : ""} del checklist final.`;
}

// ── Command reference ─────────────────────────────────────────────────────────

function renderCommands() {
  const root = document.getElementById("cmdGrid");
  root.innerHTML = COMMANDS.map((grp) => `
    <div class="cmd-group">
      <div class="cmd-group-h">${grp.group}</div>
      ${grp.cmds.map((cmd) => `
        <div class="cmd-row">
          <div class="cmd-content">
            <code class="cmd-code">${cmd.c}</code>
            <span class="cmd-desc">${cmd.d}</span>
          </div>
          <button class="copy-btn" title="Copiar">⎘</button>
        </div>`).join("")}
    </div>`).join("");
}

// ── Copy to clipboard ─────────────────────────────────────────────────────────

function bindCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.closest(".cmd-row")?.querySelector(".cmd-code")?.textContent
        ?? btn.previousElementSibling?.textContent ?? "";
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "✓";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "⎘"; btn.classList.remove("copied"); }, 1400);
      });
    });
  });
}

// ── Reset ─────────────────────────────────────────────────────────────────────

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("¿Reiniciar todo el progreso? Esta acción no se puede deshacer.")) {
    state = {};
    applyAll();
    refreshAll();
    saveState();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

(function init() {
  loadState();
  loadNotes();
  renderWeeks();
  renderFinal();
  renderCommands();
  bindChecks();
  bindNotes();
  bindCopyButtons();
  applyAll();
  refreshAll();
})();
