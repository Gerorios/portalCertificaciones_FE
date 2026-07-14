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
