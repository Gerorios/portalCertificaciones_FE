/* ================================================
   Serytec — api.js
   Cliente HTTP centralizado + helpers de auth
================================================ */

const API = "http://localhost:8000";  // cambiar por la URL de Render en producción

/* ── Helpers de token ── */
const Auth = {
  getToken:  () => localStorage.getItem("token"),
  getUser:   () => JSON.parse(localStorage.getItem("user") || "null"),
  setSession: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  isAdmin: () => {
    const u = Auth.getUser();
    return u && u.rol === "admin";
  },
  isLoggedIn: () => !!Auth.getToken(),
  requireLogin: () => {
    if (!Auth.isLoggedIn()) {
      window.location.href = "/index.html";
    }
  },
  requireAdmin: () => {
    if (!Auth.isAdmin()) {
      window.location.href = "/pages/dashboard.html";
    }
  },
};

/* ── Cliente HTTP ── */
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { ...(options.headers || {}) };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Si no es FormData agregar Content-Type JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    if (options.body && typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    Auth.clear();
    window.location.href = "/index.html";
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Error ${res.status}`);
  }

  return data;
}

/* ── Atajos ── */
const get  = (path)         => apiFetch(path, { method: "GET" });
const post = (path, body)   => apiFetch(path, { method: "POST", body });
const patch= (path, body)   => apiFetch(path, { method: "PATCH", body });
const del  = (path)         => apiFetch(path, { method: "DELETE" });

/* ── Utilidades UI ── */
function showAlert(contenedor, mensaje, tipo = "err") {
  const iconos = { err: "⚠️", ok: "✅", warn: "⚠️" };
  contenedor.innerHTML = `
    <div class="alert alert-${tipo}">
      <span>${iconos[tipo]}</span>
      <span>${mensaje}</span>
    </div>`;
}

function clearAlert(contenedor) {
  contenedor.innerHTML = "";
}

function formatMonto(num) {
  if (num == null) return "—";
  return "$" + Number(num).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatFecha(str) {
  if (!str) return "—";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function initUserUI() {
  const user = Auth.getUser();
  if (!user) return;
  const el = document.getElementById("user-name");
  const av = document.getElementById("user-avatar");
  if (el) el.textContent = user.nombre;
  if (av) {
    av.textContent = user.nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
    if (user.rol === "admin") av.classList.add("admin");
  }
  // Mostrar menú admin solo si corresponde
  const adminLink = document.getElementById("admin-link");
  if (adminLink && user.rol !== "admin") adminLink.style.display = "none";
}

function logout() {
  Auth.clear();
  window.location.href = "/index.html";
}
