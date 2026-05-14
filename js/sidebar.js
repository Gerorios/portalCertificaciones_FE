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
      <a href="${n.href}" class="nav-item ${paginaActiva === n.id ? "active" : ""}">
        <span class="icon">${n.icon}</span>
        ${n.label}
      </a>
    `).join("");

  const iniciales = user.nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const rolLabel  = { admin: "Administrador", gerente: "Gerencia", jefe: (user.contratos || []).join(", ") };

  document.getElementById("sidebar-mount").innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
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
          <div>
            <div class="user-name">${user.nombre}</div>
            <div class="user-role">${rolLabel[user.rol] || user.rol}</div>
          </div>
        </div>
        <button class="btn btn-sm" onclick="logout()">Cerrar sesión</button>
      </div>
    </aside>
  `;
}