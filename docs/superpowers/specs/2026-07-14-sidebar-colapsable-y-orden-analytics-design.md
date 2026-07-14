# Sidebar colapsable y reordenamiento de Analytics

## Contexto

El portal es HTML/JS puro, sin framework — cada página es un `.html` independiente
que carga `js/sidebar.js` para inyectar el sidebar vía `renderSidebar(paginaActiva)`.
El problema motivador: el sidebar fijo le quita ancho horizontal a los gráficos de
`analytics.html`, y el orden actual de las secciones no sigue una jerarquía clara
para gerencia (mezcla temas de plata, tiempo, contrato, geografía e ítems sin
agrupar).

## 1. Sidebar colapsable

### Alcance
El toggle vive en `sidebar.js`, por lo tanto queda disponible en las 6 páginas que
lo usan: `dashboard.html`, `analytics.html`, `upload.html`, `historial.html`,
`items.html`, `admin.html`.

### Comportamiento
- **Expandido (default):** como hoy — logo + texto, íconos + labels de navegación,
  info de usuario con nombre/rol visibles.
- **Colapsado:** franja angosta (~60px). Solo íconos de navegación, sin labels.
  Cada ítem muestra un `title` (tooltip nativo del navegador) con el label
  completo al hacer hover. El logo se reduce a solo el ícono/inicial. El footer
  de usuario se reduce al avatar (sin nombre/rol), el botón "Cerrar sesión" se
  reduce a un ícono.
- **Toggle:** un botón (ícono de flecha/hamburguesa) en la parte superior del
  sidebar, junto al logo, alterna entre estados.

### Persistencia
Cada página es una carga completa del navegador (no SPA), así que el estado se
guarda en `localStorage` bajo la clave `sidebar_colapsado` (`"true"`/`"false"`).
`renderSidebar()` lee esa clave al inyectar el sidebar y aplica la clase
`.sidebar-colapsado` si corresponde, **antes** de que se note un salto visual.
Sin valor guardado → default expandido.

### Layout
El contenido principal (`.main-content`) usa el ancho del sidebar como variable
CSS o clase condicional para no quedar con un hueco cuando el sidebar colapsa;
la transición de ancho se anima con `transition` en `width`/`margin-left` (~200ms)
para que el cambio no se sienta abrupto.

## 2. Reordenamiento de analytics.html

### Problema
El orden actual — KPIs → Presupuesto Naturgy → Evolución mensual → Barras por
contrato → Por provincia → Interanual → Top ítems → Estado de cargas — no agrupa
por tipo de pregunta que responde cada sección, y el bloque de Presupuesto
Naturgy (la señal de riesgo/cumplimiento más relevante para gerencia) queda
enterrado antes de varios gráficos.

### Nuevo orden, agrupado en 4 secciones con subtítulo visual

1. **Resumen** — Barra de filtros, KPIs generales, Presupuesto Naturgy por
   contrato (sube desde su posición actual a inmediatamente después de los KPIs).
2. **Tendencia** — Evolución mensual + Análisis interanual (agrupados: ambos
   responden "¿cómo venimos en el tiempo?").
3. **Desagregado por** — Certificado por contrato y período → Por provincia →
   Top ítems (de lo más agregado a lo más granular).
4. **Seguimiento operativo** — Estado de cargas (queda última: es una tabla de
   auditoría/checklist, no un análisis).

Cada agrupación lleva un subtítulo de sección (texto simple, mismo tratamiento
tipográfico que ya usan los `chart-title`, sin caja ni fondo — una etiqueta
liviana tipo "eyebrow") para reforzar la jerarquía sin agregar peso visual.

No cambia ningún endpoint, cálculo ni componente existente — es puramente
reordenamiento de bloques ya construidos en el DOM más los subtítulos nuevos.

## Fuera de alcance

- Tabs/acordeones colapsables por sección (Opción C evaluada y descartada por
  ahora — se puede revisar más adelante si el scroll sigue siendo un problema
  una vez que el sidebar colapsable dé más aire horizontal).
- Cambios al sidebar en mobile/responsive — no se pidió y no hay breakpoints
  mobile definidos en el proyecto hoy.
- Cambios a `dashboard.html` (vista del jefe) — el pedido fue puntualmente sobre
  `analytics.html`.

## Testing

- Verificar visualmente el toggle en las 6 páginas (no solo analytics).
- Verificar que el estado persiste al navegar entre páginas y al recargar.
- Verificar que el layout no rompe en el ancho mínimo soportado hoy (sin
  breakpoints mobile nuevos, mismo soporte que ya existe).
- Verificar que el reordenamiento de analytics.html no rompe ningún `id` que
  el JS referencia (los charts se re-renderizan por `id`, no por posición en
  el DOM, así que mover bloques es seguro).
