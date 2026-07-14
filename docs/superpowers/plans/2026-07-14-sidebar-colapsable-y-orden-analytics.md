# Sidebar Colapsable y Reordenamiento de Analytics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un toggle para colapsar el sidebar a una franja de solo íconos (persistido en localStorage, disponible en las 6 páginas del portal) y reordenar `analytics.html` en 4 secciones con subtítulos según la jerarquía Resumen → Tendencia → Desagregado por → Seguimiento operativo.

**Architecture:** Portal HTML/JS puro sin build step. El sidebar es un componente compartido inyectado por `js/sidebar.js` vía `renderSidebar(paginaActiva)`, invocado desde un `<script>` inline al final de cada página. El estado colapsado/expandido se modela como una clase `sidebar-colapsado` en `<body>`, controlada por CSS (ancho del sidebar, `margin-left` del contenido, ocultar labels) y persistida en `localStorage`. El reordenamiento de `analytics.html` es un movimiento de bloques `<div class="chart-card">` ya existentes en el DOM — ningún `id` referenciado por JS cambia de nombre, así que el JS que puebla los gráficos no requiere cambios.

**Tech Stack:** HTML5, CSS3 (custom properties), JavaScript vanilla (ES6+), Chart.js 4.4 (sin cambios). Sin framework, sin bundler, sin test runner instalado en el repo.

## Global Constraints

- No existe test runner (Jest/Playwright/etc.) en `PortalCertificaciones_frontend` — la verificación es manual en navegador, no TDD automatizado. Cada tarea igual sigue el ciclo "cambio mínimo → verificar → commit".
- No modificar ningún `id` de elementos referenciados por `analytics.html`'s `<script>` (ej. `chart-linea`, `chart-barras`, `kpis`, `card-presupuesto`) — el JS los busca por `id`, no por posición en el DOM.
- Paleta y componentes existentes en `css/styles.css` (`--primario`, `--secundario`, `--gris-texto`, `--gris-borde`, `.btn`, `.card`) — reusar, no crear un sistema de diseño paralelo.
- `sidebar.js` es consumido sin cambios por las 6 páginas (`dashboard.html`, `analytics.html`, `upload.html`, `historial.html`, `items.html`, `admin.html`) — un solo cambio en `sidebar.js` + `styles.css` alcanza para las 6; **no hay que tocar los 6 archivos `.html` individualmente** para el toggle.
- Backend en Render solo permite CORS desde `https://portalcertificaciones.netlify.app` (`ALLOWED_ORIGINS`) — un login real contra el backend no funciona desde `localhost` ni desde un deploy-preview de Netlify. La verificación funcional con login real se hace después de mergear a `main` (producción). Antes de eso, la verificación visual del toggle se hace inyectando una sesión falsa en `localStorage` (ver Task 1, paso de verificación) para no depender del backend.

---

## File Structure

- **Modificar:** `css/styles.css` — agrega transición al sidebar/main-content, estilos del botón toggle, reglas del estado colapsado, y la clase `.seccion-titulo` para los subtítulos de analytics.
- **Modificar:** `js/sidebar.js` — agrega `toggleSidebar()`, lectura del estado inicial desde `localStorage`, y ajusta la plantilla HTML de `renderSidebar()` (botón toggle, `<span class="label">` en cada ítem de nav, wrapper `.user-text`, ícono en el botón de logout).
- **Modificar:** `pages/analytics.html` — reordena los `<div class="chart-card">` existentes y agrega 3 divs `.seccion-titulo` nuevos. No se tocan los `<script>` ni los `id` existentes.
- **Sin cambios:** `js/api.js`, y los `.html` de `dashboard`, `upload`, `historial`, `items`, `admin` (heredan el toggle gratis vía `sidebar.js`).

---

### Task 1: Sidebar colapsable (CSS + sidebar.js)

**Files:**
- Modify: `css/styles.css:220-234` (regla `.sidebar`), `css/styles.css:313-318` (regla `.main-content`), agregar bloque nuevo al final del archivo.
- Modify: `js/sidebar.js` (archivo completo, es corto).

**Interfaces:**
- Consumes: nada de tareas anteriores (es la primera tarea).
- Produces: clase global `body.sidebar-colapsado` que la Task 2 no usa pero que queda disponible para cualquier página; función global `toggleSidebar()`; clave de `localStorage` `"sidebar_colapsado"` (`"true"`/`"false"`).

- [ ] **Step 1: Agregar transición a `.sidebar` y `.main-content` en `css/styles.css`**

Ubicar el bloque actual (líneas 223-233):

```css
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--secundario);
  border-right: none;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}
```

Reemplazar por:

```css
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--secundario);
  border-right: none;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: width .2s ease;
}
```

Ubicar el bloque actual (líneas 313-318):

```css
.main-content {
  margin-left: 220px;
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
}
```

Reemplazar por:

```css
.main-content {
  margin-left: 220px;
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  transition: margin-left .2s ease;
}
```

- [ ] **Step 2: Agregar el botón toggle y las reglas del estado colapsado al final de `css/styles.css`**

Agregar al final del archivo (después del bloque `/* ── Responsive ── */` existente):

```css
/* ── Sidebar toggle ── */
.sidebar-toggle-btn {
  background: rgba(255,255,255,.08);
  border: none;
  color: rgba(255,255,255,.8);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  transition: background .15s;
}
.sidebar-toggle-btn:hover { background: rgba(255,255,255,.18); color: var(--blanco); }

.nav-item .label { white-space: nowrap; overflow: hidden; }
.sidebar-footer .btn .label { margin-left: 4px; }

/* ── Sidebar colapsado ── */
body.sidebar-colapsado .sidebar { width: 60px; }
body.sidebar-colapsado .main-content { margin-left: 60px; }
body.sidebar-colapsado .sidebar-logo { justify-content: center; padding: 1rem .5rem; }
body.sidebar-colapsado .sidebar-logo img,
body.sidebar-colapsado .sidebar-logo-text,
body.sidebar-colapsado .nav-item .label,
body.sidebar-colapsado .user-text,
body.sidebar-colapsado .sidebar-footer .btn .label {
  display: none;
}
body.sidebar-colapsado .nav-item { justify-content: center; padding: .6rem; }
body.sidebar-colapsado .user-info { justify-content: center; }
body.sidebar-colapsado .sidebar-footer .btn { justify-content: center; padding: 8px; }

/* ── Subtítulos de sección (analytics.html) ── */
.seccion-titulo {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--gris-texto);
  margin: 1.75rem 0 .5rem;
  padding-bottom: .35rem;
  border-bottom: 1px solid var(--gris-borde);
}
.seccion-titulo:first-of-type { margin-top: 0; }
```

- [ ] **Step 3: Verificar visualmente el CSS agregado no tiene errores de sintaxis**

Run: `node -e "require('fs').readFileSync('css/styles.css','utf8')" && echo "archivo legible"` (chequeo mínimo de que el archivo no quedó corrupto — no hay linter CSS instalado en el repo).

Expected: `archivo legible`

Abrir `css/styles.css` y confirmar visualmente que las llaves `{` `}` de los bloques nuevos están balanceadas (no hay linter automático disponible).

- [ ] **Step 4: Reescribir `js/sidebar.js` completo con el toggle**

Reemplazar el contenido completo del archivo (hoy 57 líneas) por:

```javascript
/* ================================================
   sidebar.js — inyecta el sidebar en todas las páginas
================================================ */
function renderSidebar(paginaActiva) {
  const user = Auth.getUser();
  if (!user) return;

  const esAdmin   = user.rol === "admin";
  const esGerente = user.rol === "gerente";

  const nav = [
    { id: "dashboard",  icon: "📊", label: "Dashboard",           href: "dashboard.html",  roles: ["admin","jefe"] },
    { id: "analytics",  icon: "📈", label: "Analytics",            href: "analytics.html",  roles: ["admin","gerente"] },
    { id: "upload",     icon: "📤", label: "Subir certificación",  href: "upload.html",     roles: ["admin","jefe"] },
    { id: "historial",  icon: "🗂️",  label: "Historial",            href: "historial.html",  roles: ["admin","jefe","gerente"] },
    { id: "items",      icon: "📋", label: "Maestro de ítems",     href: "items.html",      roles: ["admin"] },
    { id: "admin",      icon: "⚙️",  label: "Administración",       href: "admin.html",      roles: ["admin"] },
  ];

  const items = nav
    .filter(n => n.roles.includes(user.rol))
    .map(n => `
      <a href="${n.href}" class="nav-item ${paginaActiva === n.id ? "active" : ""}" title="${n.label}">
        <span class="icon">${n.icon}</span>
        <span class="label">${n.label}</span>
      </a>
    `).join("");

  const iniciales = user.nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const rolLabel  = { admin: "Administrador", gerente: "Gerencia", jefe: (user.contratos || []).join(", ") };

  aplicarEstadoSidebar();

  document.getElementById("sidebar-mount").innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <button class="sidebar-toggle-btn" onclick="toggleSidebar()" title="Colapsar/expandir menú">☰</button>
        <img src="../img/logo.png" alt="Serytec logo"
             onerror="this.style.display='none'">
        <div class="sidebar-logo-text">
          Serytec
          <span>Certificaciones Naturgy</span>
        </div>
      </div>

      <nav class="sidebar-nav">${items}</nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar ${user.rol === "admin" ? "admin" : ""}">${iniciales}</div>
          <div class="user-text">
            <div class="user-name">${user.nombre}</div>
            <div class="user-role">${rolLabel[user.rol] || user.rol}</div>
          </div>
        </div>
        <button class="btn btn-sm" onclick="logout()" title="Cerrar sesión">
          <span class="footer-icon">🚪</span><span class="label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  `;
}

// ── Colapsar / expandir ──────────────────────────────────────
function aplicarEstadoSidebar() {
  const colapsado = localStorage.getItem("sidebar_colapsado") === "true";
  document.body.classList.toggle("sidebar-colapsado", colapsado);
}

function toggleSidebar() {
  const colapsado = !document.body.classList.contains("sidebar-colapsado");
  document.body.classList.toggle("sidebar-colapsado", colapsado);
  localStorage.setItem("sidebar_colapsado", colapsado ? "true" : "false");
}
```

Nota: `aplicarEstadoSidebar()` se llama al principio de `renderSidebar()` (antes de inyectar el HTML) para que la clase en `<body>` ya esté puesta cuando el sidebar aparece — evita un parpadeo de "se ve expandido y de golpe se achica".

- [ ] **Step 5: Verificar que `js/sidebar.js` no tiene errores de sintaxis**

Run: `node --check js/sidebar.js`

Expected: sin output (exit code 0 = sintaxis válida).

- [ ] **Step 6: Verificación visual manual (sin depender del backend)**

El login real no funciona en local por CORS (ver Global Constraints), así que se verifica inyectando una sesión falsa:

1. Levantar un server estático desde la raíz del repo: `python -m http.server 8080` (o `npx serve .`).
2. Abrir `http://localhost:8080/pages/admin.html` en el navegador.
3. Abrir la consola de DevTools y ejecutar:
   ```js
   localStorage.setItem("token", "fake");
   localStorage.setItem("user", JSON.stringify({nombre:"Test Admin", rol:"admin", contratos:[]}));
   location.reload();
   ```
4. Confirmar que el sidebar se ve expandido (comportamiento default) con labels de texto visibles.
5. Click en el botón ☰ arriba del logo. Confirmar que el sidebar se reduce a una franja angosta, solo íconos, y `.main-content` se corre a la izquierda ocupando el espacio liberado (con una transición suave, no un salto).
6. Hacer hover sobre un ícono de nav colapsado — confirmar que aparece el tooltip nativo con el label completo.
7. Recargar la página (F5). Confirmar que el sidebar sigue colapsado (persistencia en localStorage funcionando).
8. Click en ☰ de nuevo — confirmar que vuelve a expandirse y que, tras recargar, sigue expandido.
9. Repetir los pasos 2-8 en `pages/analytics.html` para confirmar que el mismo toggle funciona ahí también (sidebar.js es compartido, no hace falta probar las 6 páginas una por una, pero sí al menos dos para confirmar que no es específico de una).

Expected: en todos los casos el sidebar colapsa/expande, persiste al recargar, y el layout de `.main-content` se ajusta sin overlaps ni huecos.

- [ ] **Step 7: Commit**

```bash
git add css/styles.css js/sidebar.js
git commit -m "feat: sidebar colapsable con persistencia en localStorage"
```

---

### Task 2: Reordenar analytics.html en 4 secciones con subtítulos

**Files:**
- Modify: `pages/analytics.html:317-373` (bloque de KPIs hasta Top ítems — la sección de Estado de cargas que sigue no se toca, ya queda al final).

**Interfaces:**
- Consumes: clase CSS `.seccion-titulo` producida en Task 1, Step 2.
- Produces: nada que otra tarea consuma (es la última tarea del plan).

- [ ] **Step 1: Reemplazar el bloque de secciones de gráficos**

Ubicar en `pages/analytics.html` el bloque que va desde el comentario `<!-- KPIs -->` hasta el cierre del `<!-- Top ítems -->` (líneas 317-373 al momento de escribir este plan — verificar contra el archivo real, pudo moverse una línea por ediciones previas). El contenido actual es:

```html
    <!-- KPIs -->
    <div class="kpi-grid" id="kpis">
      <div class="kpi"><div class="kpi-label">Cargando...</div><div class="kpi-val">—</div></div>
    </div>

    <!-- Presupuesto Naturgy por contrato -->
    <div class="chart-card" id="card-presupuesto" style="display:none">
      <div class="chart-title">Presupuesto Naturgy por contrato</div>
      <div class="chart-sub">Consumo en $ certificado contra el presupuesto asignado por ciclo</div>
      <div class="kpi-grid" id="kpis-presupuesto" style="margin-bottom:1.1rem"></div>
      <div id="medidores-presupuesto"></div>
      <button class="btn btn-sm" onclick="toggleTablaPresupuesto()" style="margin-top:1rem">Ver como tabla</button>
      <div class="tabla-wrap" id="tabla-presupuesto-wrap" style="display:none;margin-top:.75rem">
        <table style="font-size:13px">
          <thead>
            <tr><th>Contrato</th><th>Período</th><th style="text-align:right">Presupuesto</th><th style="text-align:right">Consumido</th><th style="text-align:right">%</th></tr>
          </thead>
          <tbody id="body-tabla-presupuesto"></tbody>
        </table>
      </div>
    </div>

    <!-- Evolución mensual -->
    <div class="chart-card">
      <div class="chart-title" id="linea-title">Evolución mensual del total certificado</div>
      <div class="chart-sub">Total mes a mes en el período seleccionado</div>
      <div class="chart-wrap tall"><canvas id="chart-linea"></canvas></div>
    </div>

    <!-- Barras por contrato -->
    <div class="chart-card">
      <div class="chart-title" id="barras-title">Certificado por contrato y período</div>
      <div class="chart-sub">Comparación entre contratos K</div>
      <div class="chart-wrap tall"><canvas id="chart-barras"></canvas></div>
    </div>

    <!-- Por provincia -->
    <div class="chart-card">
      <div class="chart-title" id="prov-title">Certificado por provincia</div>
      <div class="chart-sub">Distribución geográfica en el período</div>
      <div class="chart-wrap"><canvas id="chart-provincia"></canvas></div>
    </div>

    <!-- Interanual -->
    <div class="chart-card">
      <div class="chart-title">Análisis interanual</div>
      <div class="chart-sub" id="interanual-sub">Comparación año actual vs anterior</div>
      <div class="leyenda" id="interanual-leyenda"></div>
      <div class="chart-wrap tall"><canvas id="chart-interanual"></canvas></div>
    </div>

    <!-- Top ítems -->
    <div class="chart-card">
      <div class="chart-title" id="items-title">Top 10 ítems por monto certificado</div>
      <div class="chart-sub">Ítems con mayor valor en el período seleccionado</div>
      <div class="chart-wrap" style="height:320px"><canvas id="chart-items"></canvas></div>
    </div>
```

Reemplazar por (mismos bloques, reordenados, con subtítulos nuevos):

```html
    <!-- ═══ RESUMEN ═══ -->
    <div class="seccion-titulo">Resumen</div>

    <!-- KPIs -->
    <div class="kpi-grid" id="kpis">
      <div class="kpi"><div class="kpi-label">Cargando...</div><div class="kpi-val">—</div></div>
    </div>

    <!-- Presupuesto Naturgy por contrato -->
    <div class="chart-card" id="card-presupuesto" style="display:none">
      <div class="chart-title">Presupuesto Naturgy por contrato</div>
      <div class="chart-sub">Consumo en $ certificado contra el presupuesto asignado por ciclo</div>
      <div class="kpi-grid" id="kpis-presupuesto" style="margin-bottom:1.1rem"></div>
      <div id="medidores-presupuesto"></div>
      <button class="btn btn-sm" onclick="toggleTablaPresupuesto()" style="margin-top:1rem">Ver como tabla</button>
      <div class="tabla-wrap" id="tabla-presupuesto-wrap" style="display:none;margin-top:.75rem">
        <table style="font-size:13px">
          <thead>
            <tr><th>Contrato</th><th>Período</th><th style="text-align:right">Presupuesto</th><th style="text-align:right">Consumido</th><th style="text-align:right">%</th></tr>
          </thead>
          <tbody id="body-tabla-presupuesto"></tbody>
        </table>
      </div>
    </div>

    <!-- ═══ TENDENCIA ═══ -->
    <div class="seccion-titulo">Tendencia</div>

    <!-- Evolución mensual -->
    <div class="chart-card">
      <div class="chart-title" id="linea-title">Evolución mensual del total certificado</div>
      <div class="chart-sub">Total mes a mes en el período seleccionado</div>
      <div class="chart-wrap tall"><canvas id="chart-linea"></canvas></div>
    </div>

    <!-- Interanual -->
    <div class="chart-card">
      <div class="chart-title">Análisis interanual</div>
      <div class="chart-sub" id="interanual-sub">Comparación año actual vs anterior</div>
      <div class="leyenda" id="interanual-leyenda"></div>
      <div class="chart-wrap tall"><canvas id="chart-interanual"></canvas></div>
    </div>

    <!-- ═══ DESAGREGADO POR ═══ -->
    <div class="seccion-titulo">Desagregado por</div>

    <!-- Barras por contrato -->
    <div class="chart-card">
      <div class="chart-title" id="barras-title">Certificado por contrato y período</div>
      <div class="chart-sub">Comparación entre contratos K</div>
      <div class="chart-wrap tall"><canvas id="chart-barras"></canvas></div>
    </div>

    <!-- Por provincia -->
    <div class="chart-card">
      <div class="chart-title" id="prov-title">Certificado por provincia</div>
      <div class="chart-sub">Distribución geográfica en el período</div>
      <div class="chart-wrap"><canvas id="chart-provincia"></canvas></div>
    </div>

    <!-- Top ítems -->
    <div class="chart-card">
      <div class="chart-title" id="items-title">Top 10 ítems por monto certificado</div>
      <div class="chart-sub">Ítems con mayor valor en el período seleccionado</div>
      <div class="chart-wrap" style="height:320px"><canvas id="chart-items"></canvas></div>
    </div>
```

El bloque `<!-- Estado de cargas -->` que sigue inmediatamente después (sin cambios) queda como la sección "Seguimiento operativo". Agregar el subtítulo justo antes de su comentario existente:

Ubicar:
```html
    <!-- Estado de cargas -->
    <div class="chart-card">
```

Reemplazar por:
```html
    <!-- ═══ SEGUIMIENTO OPERATIVO ═══ -->
    <div class="seccion-titulo">Seguimiento operativo</div>

    <!-- Estado de cargas -->
    <div class="chart-card">
```

- [ ] **Step 2: Verificar que no se rompió ningún `id` referenciado por el `<script>`**

Run (desde la raíz de `PortalCertificaciones_frontend`):
```bash
for id in kpis card-presupuesto kpis-presupuesto medidores-presupuesto tabla-presupuesto-wrap body-tabla-presupuesto chart-linea linea-title chart-barras barras-title chart-provincia prov-title chart-interanual interanual-sub interanual-leyenda chart-items items-title; do
  count=$(grep -o "id=\"$id\"" pages/analytics.html | wc -l)
  echo "$id: $count"
done
```

Expected: cada `id` aparece exactamente `1` vez (ninguno se duplicó ni se borró al reordenar).

- [ ] **Step 3: Verificar sintaxis HTML básica**

Run: `node -e "const fs=require('fs'); const html=fs.readFileSync('pages/analytics.html','utf8'); const open=(html.match(/<div/g)||[]).length; const close=(html.match(/<\/div>/g)||[]).length; console.log('div abiertos:', open, '| div cerrados:', close);"`

Expected: el conteo de `<div` y `</div>` debe ser igual al que daba ANTES del cambio (correr el mismo comando con `git show HEAD:pages/analytics.html` para comparar, ya que no se agregó ni quitó ningún div de chart, solo se agregaron 4 `<div class="seccion-titulo">` con su cierre correspondiente — el delta esperado es exactamente +4 abiertos y +4 cerrados).

- [ ] **Step 4: Verificación visual manual**

1. Con el mismo server estático de Task 1 corriendo, abrir `http://localhost:8080/pages/analytics.html` (con la sesión falsa ya en localStorage del Step 6 de Task 1, rol `admin` para ver la sección de Presupuesto).
2. Como las llamadas a la API van a fallar por CORS en local, los gráficos van a quedar en su estado de carga/vacío — esto es esperable, lo que se verifica acá es el **orden visual de los bloques y los subtítulos**, no los datos.
3. Confirmar de arriba a abajo: barra de filtros → KPIs → "Resumen" (label) ya cubierto arriba de KPIs → tarjeta de Presupuesto Naturgy → subtítulo "Tendencia" → Evolución mensual → Interanual → subtítulo "Desagregado por" → Barras por contrato → Por provincia → Top ítems → subtítulo "Seguimiento operativo" → Estado de cargas.
4. Confirmar que cada `.seccion-titulo` se ve como una etiqueta chica en mayúsculas con una línea debajo, sin quitarle protagonismo a los gráficos.

Expected: el orden coincide exactamente con el descripto arriba, sin bloques duplicados ni faltantes.

- [ ] **Step 5: Commit**

```bash
git add pages/analytics.html
git commit -m "feat: reordenar analytics.html en 4 secciones (Resumen/Tendencia/Desagregado/Operativo)"
```

---

## Post-implementación (fuera de las tareas, a cargo del usuario)

- Verificación funcional completa con login real: solo posible después de pushear la rama y abrir el deploy preview de Netlify, o después de mergear a `main` (producción) — el backend en Render no acepta CORS desde `localhost`.
- Confirmar en producción que el toggle funciona igual para roles `jefe` y `gerente`, no solo `admin` (el Step 6 de Task 1 solo probó con un usuario `admin` simulado).
