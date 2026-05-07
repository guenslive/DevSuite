# Fase 1 — Foundations: Refactor a Vite + Templates + Lazy-Load + App.history

**Status:** Approved design (brainstorming complete)
**Date:** 2026-05-07
**Owner:** Edgar
**Scope:** Phase 1 only of a multi-phase roadmap. Phases 2–4 are out of scope for this spec.

## Resumen ejecutivo

Refactor de DevTools Suite para introducir un build step (Vite), separar las 18 herramientas en archivos por carpeta (HTML/CSS/JS), implementar carga diferida (lazy-load) y crear un sistema unificado de undo/redo + presets + favoritos (`App.history`).

Esta fase es **foundation-only**: no añade nuevas herramientas ni cambia la UI visible (más allá de un panel de presets reutilizable). Su valor es habilitar las fases siguientes (Command Palette, atajos globales, multi-formato copy, snapshot, mobile UX, PWA, nueva tool Cubic-Bezier).

## Contexto

El proyecto actual:

- 18 herramientas frontend en HTML/CSS/JS vanilla
- `index.html` monolítico de **2039 líneas**
- `js/modules/shadow.js` de **909 líneas** (mayor de los módulos)
- Cache busting manual vía `python3 scripts/fingerprint.py`
- Sin build, sin code-splitting, sin HMR
- Favoritos persistidos solo en flex/grid/shadow, con claves dispersas
- Sin undo/redo
- `urlstate.js` ya implementa serialize/deserialize por tool — base para `App.history`

### Decisiones de scope acordadas con el usuario

| Pregunta | Decisión |
|----------|----------|
| ¿Cobertura de fases? | Solo Fase 1 |
| ¿Build step? | Aceptado (Vite) |
| ¿Cobertura del refactor? | 18 tools completas |

## Sección 1 — Build & Estructura

### Stack

**Vite** como build tool + dev server.

- HMR durante desarrollo
- `import()` dinámico nativo → habilita lazy-load
- Build estático → output deployable plano
- Code-splitting automático por dynamic import

Alternativas descartadas:
- **esbuild** sin envoltorio: requiere config manual para HTML/HMR
- **Parcel**: válido pero menos común
- **Sin build**: bloqueado por imports dinámicos sobre `file://`

### Estructura de carpetas

```
devtools-suite/
├── index.html                    ← solo chrome (header, tabs, search, theme)
├── package.json                  ← scripts: dev, build, preview, test, test:coverage
├── vite.config.js
├── public/                       ← assets estáticos (favicon, manifest futuro)
│
├── src/
│   ├── main.js                   ← entry: bootstrap App.init()
│   │
│   ├── core/
│   │   ├── app.js                ← window.App, state global
│   │   ├── core.js               ← theme, tabs, search, modal
│   │   ├── urlstate.js           ← (existente, ajustes mínimos)
│   │   ├── lazy.js               ← NEW
│   │   ├── templates.js          ← NEW (si se factoriza desde lazy)
│   │   ├── history.js            ← NEW
│   │   ├── presets-ui.js         ← NEW (panel auto-inyectado)
│   │   └── utils.js
│   │
│   ├── css/
│   │   ├── variables.css
│   │   ├── layout.css
│   │   └── tools.css
│   │
│   └── tools/
│       ├── clamp/{clamp.html, clamp.css, clamp.js}
│       ├── ratio/...
│       ├── flex/...
│       ├── grid/...
│       ├── shadow/
│       │   ├── shadow.html
│       │   ├── shadow.css
│       │   ├── shadow.js
│       │   └── sub/              ← split de las 909 líneas (≤400 cada uno)
│       ├── gradient/...
│       ├── filter/...
│       ├── transform/...
│       ├── shape/...
│       ├── contrast/...
│       ├── palette/...
│       ├── converter/...
│       ├── placeholder/...
│       ├── metatags/...
│       ├── keyframes/...
│       ├── typescale/...
│       ├── borderradius/...
│       └── scrollbar/...
│
├── tests/
│   ├── core/
│   │   ├── history.test.js       ← NEW
│   │   ├── lazy.test.js          ← NEW
│   │   └── urlstate.test.js      ← migrado
│   ├── tools/                    ← migrados (rutas actualizadas)
│   └── integration/
│       └── smoke.test.js         ← NEW
│
└── scripts/                      ← scripts/fingerprint.py se elimina
```

### Cambios en filosofía

| Antes | Después |
|-------|---------|
| Abrir `index.html` directo en navegador | `npm run dev` para desarrollar |
| `python3 scripts/fingerprint.py` manual | Vite hashea automáticamente al `build` |
| Edit + refresh | HMR instantáneo |
| Output = archivos fuente | Output = `dist/` (deploy estático plano) |

El usuario final del sitio sigue accediendo a un sitio estático normal — la diferencia es solo el flujo de desarrollo y deploy.

### Scripts npm

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

## Sección 2 — Templates + Lazy-Load

### Concepto

Cada tool se materializa en disco en 3 archivos:

```
tools/clamp/
├── clamp.html      ← fragmento HTML (contenido del antiguo <section>)
├── clamp.css
└── clamp.js        ← registra App.clamp
```

`index.html` queda con solo el chrome y secciones vacías:

```html
<main class="main-content">
  <section id="section-clamp" class="tool-section active" hidden></section>
  <section id="section-ratio" class="tool-section" hidden></section>
  <!-- ... 18 secciones vacías ... -->
</main>
```

Las secciones se llenan **bajo demanda** la primera vez que se abre cada tab.

### Mecanismo (`core/lazy.js`)

```js
const templates = import.meta.glob('../tools/*/*.html', {
  query: '?raw', import: 'default'
});
const styles = import.meta.glob('../tools/*/*.css');
const modules = import.meta.glob('../tools/*/*.js');

App.lazy = {
  _loaded: new Set(),

  async load(tool) {
    if (App.lazy._loaded.has(tool)) return;

    const tplKey = `../tools/${tool}/${tool}.html`;
    const cssKey = `../tools/${tool}/${tool}.css`;
    const jsKey  = `../tools/${tool}/${tool}.js`;

    const [html] = await Promise.all([
      templates[tplKey]?.(),
      styles[cssKey]?.(),       // CSS se aplica automáticamente
      modules[jsKey]?.(),       // JS registra App[tool]
    ]);

    const container = document.getElementById('section-' + tool);
    if (container && html) container.innerHTML = html;

    if (App[tool]?.init) App[tool].init();
    App.lazy._loaded.add(tool);
  },

  preload(tool) {
    if (App.lazy._loaded.has(tool)) return;
    return Promise.all([
      templates[`../tools/${tool}/${tool}.html`]?.(),
      modules[`../tools/${tool}/${tool}.js`]?.(),
    ]);
  }
};
```

### Integración con `switchTab`

```js
async switchTab(tool, event) {
  await App.lazy.load(tool);     // ← NEW
  // ... lógica existente sin cambios ...
}
```

### UX durante carga

- **Cold load**: ~50–200ms típico. Mostrar spinner mínimo en el tab clickeado **solo si tarda >100ms** (evita flicker en cargas rápidas).
- **Hot**: tool en memoria, switch instantáneo.
- **Preload**: en futuras fases, hover sobre tab o apertura del Command Palette dispara `preload()` en background.

### Initial-load optimization

```js
// main.js
document.addEventListener('DOMContentLoaded', async () => {
  App.init();
  const initialTool = location.hash.replace(/^#/, '').split('?')[0] || 'clamp';
  await App.lazy.load(initialTool);
});
```

### Convenciones para `tools/[tool]/[tool].html`

Cada archivo contiene **solo el contenido del `<section>`**, sin wrapper:

```html
<!-- tools/clamp/clamp.html -->
<div class="tool-card">
  <h2>Clamp</h2>
  ...
</div>
```

`onclick`/`oninput` inline se mantienen en Fase 1 (no expandir alcance). Migración a `addEventListener` queda para Fase 2 cuando llegue Command Palette + atajos.

### CSS

Tres niveles:
1. **Global** (`src/css/*.css`) → cargado en `main.js`, siempre presente
2. **Per-tool** (`tools/[tool]/[tool].css`) → importado dentro del JS del tool, Vite lo inyecta cuando carga el chunk
3. **Crítico** (estilos del tool inicial) → import estático en `main.js` para evitar FOUC en primer paint

## Sección 3 — `App.history` (Undo/Redo + Presets + Favoritos)

### Objetivo

| Capacidad | Hoy | Después |
|-----------|-----|---------|
| Undo/Redo | ❌ | ✅ universal |
| Presets nombrados | parcial flex/grid/shadow | ✅ universal |
| Favoritos | parcial flex/grid/shadow | ✅ universal |
| Persistencia | claves dispersas | ✅ unificada |

### Aprovecha `urlstate`

`urlstate.js` ya define `serialize()` / `deserialize()` por tool. `App.history` reutiliza ese contrato — no duplica el mecanismo de captura.

### API pública

```js
App.history = {
  // Undo/Redo
  capture(tool),        // auto vía input listener (debounced 300ms)
  undo(tool),
  redo(tool),
  canUndo(tool),
  canRedo(tool),

  // Presets nombrados
  savePreset(tool, name),     // → id
  loadPreset(tool, id),
  deletePreset(tool, id),
  renamePreset(tool, id, newName),
  listPresets(tool),

  // Favoritos
  toggleFavorite(tool, presetId),
  isFavorite(tool, presetId),
  listFavorites(tool),

  // Import / Export
  exportAll(),
  importAll(json),
};
```

### Persistencia

Claves localStorage:

```json
{
  "devtools.presets.v1": {
    "clamp": [{ "id": "uuid", "name": "Hero h1", "state": {...}, "createdAt": 1715... }]
  },
  "devtools.favorites.v1": {
    "clamp": ["uuid"]
  }
}
```

### Migración legacy

Al boot (en `App.history.init()`, durante Wave 0 setup), si detecta claves antiguas (`flexFavorites`, `gridFavorites`, `shadowFavorites`), las convierte al formato `v1` y las elimina. La lógica vive en `core/history.js`; la **verificación funcional** ocurre cuando se migran flex/grid (Wave 5) y shadow (Wave 6) — sus tests existentes deben seguir pasando con el nuevo formato. Test obligatorio: `tests/core/history.test.js → migrate v0 → v1 reads legacy keys`.

### Capture mechanism (sin tocar tools)

```js
init() {
  App.history._migrate();
  App.history._presets = load('devtools.presets.v1') || {};
  App.history._favorites = load('devtools.favorites.v1') || {};

  document.addEventListener('input', App.history._onChange);
  document.addEventListener('change', App.history._onChange);
},

_onChange(e) {
  const tool = App.urlState._currentTool;
  if (!tool || App.urlState._skipWrite) return;
  if (!e.target.closest('#section-' + tool)) return;

  clearTimeout(App.history._debounceTimer);
  App.history._debounceTimer = setTimeout(() => {
    App.history.capture(tool);
  }, 300);
},

_snapshot(tool) {
  const mod = App[tool];
  return mod?.serialize?.() ?? App.urlState.collectGeneric(tool);
},

_restore(tool, state) {
  App.urlState._skipWrite = true;
  try {
    const params = new URLSearchParams(state);
    if (App[tool]?.deserialize) App[tool].deserialize(params);
    else App.urlState.applyGeneric(tool, params);
  } finally {
    App.urlState._skipWrite = false;
  }
  App.urlState.write(tool, true);
}
```

### UI: panel auto-inyectado (`core/presets-ui.js`)

Inyectado al final del `tool-card` cuando `App.lazy.load(tool)` completa. Tools pueden opt-out añadiendo el atributo `data-no-presets` al `<div class="tool-card">` raíz dentro de `tools/[tool]/[tool].html`.

```
┌─ Tool section ────────────────────────────────────┐
│  ┌─ Tool content ──────────────────────────────┐  │
│  │  inputs, preview, código                    │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─ Presets bar (auto) ────────────────────────┐  │
│  │ ↶ ↷  │  ⭐ Favorites: [Hero h1]             │  │
│  │       │  💾 Save preset...   📋 All         │  │
│  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

### Límites

| Aspecto | Decisión |
|---------|----------|
| Undo stack max | 50 estados por tool |
| Debounce capture | 300ms |
| Presets max | sin límite (localStorage ~5MB total) |
| Conflict resolution | last-write-wins |
| Cross-tab sync | fuera de scope (Fase futura) |
| Schema versioning | `v1` en clave |

### Atajos

`App.history` expone los métodos pero **no registra atajos en Fase 1**. La Fase 2 los conectará a `Ctrl+Z`, `Ctrl+Y`, `Ctrl+S`.

## Sección 4 — Plan de migración + Tests + Definition of Done

### Orden de migración (waves)

Simple → complejo, shadow al final por su tamaño y refactor interno.

| Wave | Tools | Notas |
|------|-------|-------|
| **0** | (setup) Vite, mover `core/`, montar index.html cascarón | sin tools |
| **1** | clamp, ratio, placeholder, filter | <100 líneas, valida patrón |
| **2** | converter, metatags, borderradius, scrollbar, typescale | 75–130 líneas |
| **3** | contrast, palette, gradient | tools de color |
| **4** | keyframes, transform, shape | 200–390 líneas |
| **5** | flex, grid | con migración de favoritos legacy |
| **6** | shadow | split en `tools/shadow/sub/` (≤400 líneas/archivo) |

### Steps por tool

```
[ ] 1. Crear tools/[tool]/ con [tool].html, [tool].css, [tool].js
[ ] 2. Mover el HTML de <section id="section-[tool]"> de index.html → [tool].html
[ ] 3. Mover js/modules/[tool].js → tools/[tool]/[tool].js
[ ] 4. Si hay css/[tool].css, mover → tools/[tool]/[tool].css
[ ] 5. Añadir `import './[tool].css'` al inicio del [tool].js (si aplica)
[ ] 6. En index.html dejar solo: <section id="section-[tool]" hidden></section>
[ ] 7. Verificar: abrir tab → lazy carga → tool funciona idéntico
[ ] 8. Smoke: cambiar inputs, copiar CSS, verificar URL state
[ ] 9. Verificar undo/redo funciona vía App.history
[ ] 10. Si tool tenía favoritos legacy: verificar migración v0→v1
[ ] 11. Migrar/ajustar tests existentes
```

### Tests strategy

Tests existentes (`tests/contrast.test.js`, `tests/urlstate.test.js`) se mantienen y migran rutas de import.

Tests nuevos:

```
tests/core/history.test.js (10 casos):
  ✓ capture creates snapshot on input
  ✓ capture is debounced (300ms)
  ✓ undo/redo navigates correctly
  ✓ redo cleared after new capture
  ✓ savePreset persists to localStorage
  ✓ loadPreset restores state via deserialize
  ✓ toggleFavorite adds/removes id
  ✓ migrate v0 → v1 reads legacy keys
  ✓ snapshot uses tool.serialize when available
  ✓ snapshot falls back to urlstate.collectGeneric

tests/core/lazy.test.js:
  ✓ load() inyecta HTML en el container
  ✓ load() ejecuta init() del tool
  ✓ load() es idempotente (no recarga si ya cargó)
  ✓ preload() carga sin inicializar
  ✓ tools sin CSS no rompen

tests/integration/smoke.test.js:
  ✓ App.init() boots sin errores
  ✓ switchTab para cada uno de los 18 tools sin error
  ✓ urlstate hash → tool deserializa correctamente
  ✓ App.history.savePreset() + loadPreset() ciclo completo
```

Coverage target: **80% en `src/core/`** (objetivo del rule global).

Test runner: **vitest** (ya presente en repo). Cambios necesarios en `vitest.config.js`:

- `test.environment: 'jsdom'` (para simular DOM en core tests)
- `resolve.alias`: `'@'` → `'./src'` (también espejado en `vite.config.js` para producción)

Ejemplo `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: { outDir: 'dist' }
});
```

### Manual smoke checklist

`tests/manual-smoke.md` con:

- Por cada tool: abrir, cambiar 3 inputs, copiar código, recargar URL → estado preservado
- Toggle theme en cada tool, ver tokens aplicados
- Search "shad" → debe sugerir Shadow
- Mobile menu abre/cierra correctamente
- `Cmd+R` con hash → tool inicial es el correcto
- Undo/redo en 3 tools distintas
- Save preset / load preset / delete preset
- Migración: si hay localStorage legacy de flex/grid/shadow, verificar conversión

### Definition of Done

| # | Criterio | Verificación |
|---|----------|--------------|
| 1 | `npm run dev` levanta el sitio con HMR | manual |
| 2 | `npm run build` produce `dist/` deployable | manual + `dist/index.html` válido |
| 3 | `index.html` ≤ 250 líneas | `wc -l index.html` |
| 4 | 18 tools migradas a `src/tools/[tool]/` | listado completo |
| 5 | `shadow.js` partido en archivos ≤ 400 líneas | `wc -l src/tools/shadow/**/*.js` |
| 6 | Lazy-load: en DevTools Network se ve un chunk JS por tool al primer click | manual |
| 7 | `App.history.undo/redo` funciona en cualquier tool | smoke test |
| 8 | `App.history.savePreset/loadPreset` persiste en localStorage | smoke test |
| 9 | Migración legacy ejecuta sin pérdida de datos | test + manual |
| 10 | URL hash deep linking funciona idéntico | tests/urlstate.test.js pasa |
| 11 | `vitest run` pasa al 100% | CI/local |
| 12 | Coverage `src/core/` ≥ 80% | `vitest --coverage` |
| 13 | Manual smoke checklist completado | checklist firmado |
| 14 | Theme toggle, search, mobile menu funcionan | manual |
| 15 | `scripts/fingerprint.py` removido | grep |

### Riesgos + mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Tools usan helpers globales (`App.utils`, `App.core`) | Mantener `window.App` global poblado desde `main.js` |
| `onclick="App.foo()"` inline depende de globales | `main.js` reexporta a `window.App` (igual que hoy) |
| HMR rompe estado de localStorage o URL hash en dev | Documentar; recargar manual si pasa |
| Tools pequeños cargan en <50ms y spinner se ve raro | Mostrar spinner solo si carga >100ms |
| Trabajo en main durante refactor incremental rompe sitio | Trabajar en branch, no merge hasta wave 6 completa |

### Estimación

- Wave 0: 2–4h
- Waves 1–4: ~30–60 min × 13 tools = 8–12h
- Wave 5: 1–2h × 2 tools (migración favoritos)
- Wave 6: 4–6h (split shadow)
- Tests + smoke: 4–6h
- **Total: ~25–35h (~1 semana)**

## Out of scope (Fase 1)

Las siguientes mejoras están aprobadas en el roadmap pero **no se implementan en Fase 1**:

- Command Palette (Cmd+K) — Fase 2
- Atajos globales y por herramienta — Fase 2
- Multi-formato copy (CSS/SCSS/Tailwind/JS) — Fase 2
- Snapshot PNG/SVG — Fase 3
- Mejoras mobile UX más allá del comportamiento actual — Fase 3
- Drag&drop + cheatsheet en Flex/Grid — Fase 3
- PWA (service worker + manifest) — Fase 4
- Cubic-Bezier Editor — Fase 4

## Próximos pasos tras aprobación del spec

1. Invocar `superpowers:writing-plans` para generar plan de implementación detallado por waves.
2. Branch `refactor/fase-1-foundations`.
3. Ejecución por waves con verificación incremental.
