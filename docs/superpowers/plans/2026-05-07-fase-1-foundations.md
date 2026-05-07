# Fase 1 Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor DevTools Suite to Vite + per-tool folder structure + lazy-load + unified `App.history` (undo/redo + presets + favorites) so future phases can build on a clean foundation.

**Architecture:** Adopt Vite as build/dev server. Split `index.html` (2039 LOC) into one cascarón + 18 per-tool HTML/CSS/JS folders under `src/tools/[tool]/`. Implement `App.lazy` to load templates+CSS+JS on first tab open via `import.meta.glob`. Implement `App.history` reusing `urlstate.js` serialize/deserialize contracts. Auto-inject a presets bar UI per tool via `App.lazy`. Migrate legacy localStorage favorites (`flexFavorites`, `gridFavorites`, `shadowFavorites`) to v1 schema.

**Tech Stack:** Vite 5, Vitest 1.6 (already installed), jsdom, vanilla JS (no framework), CSS variables (existing).

**Spec:** `docs/superpowers/specs/2026-05-07-fase-1-foundations-design.md`

---

## Pre-flight: Branch & worktree

- [ ] **Step 0.0.1: Create feature branch**

Run:
```bash
git checkout -b refactor/fase-1-foundations
```

Expected: `Switched to a new branch 'refactor/fase-1-foundations'`

> User has stated they will review changes before merging to production. Do not push or merge without explicit user approval.

---

## Wave 0 — Setup (Vite, structure, core modules, history, lazy)

### Task 0.1: Install Vite

**Files:**
- Modify: `package.json`

- [ ] **Step 0.1.1: Install vite as devDependency**

Run:
```bash
npm install --save-dev vite@^5.4.0
```

Expected: vite added to `devDependencies` in package.json. `node_modules/vite` exists.

- [ ] **Step 0.1.2: Add dev/build/preview scripts**

Modify `package.json` `scripts` block. Final shape:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage",
    "design:lint": "design.md lint DESIGN.md",
    "design:export:tailwind": "design.md export --format tailwind DESIGN.md > tokens.tailwind.json",
    "design:export:dtcg": "design.md export --format dtcg DESIGN.md > tokens.dtcg.json",
    "design:spec": "design.md spec"
  }
}
```

- [ ] **Step 0.1.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(build): install vite and add dev/build/preview scripts"
```

### Task 0.2: Create `vite.config.js`

**Files:**
- Create: `vite.config.js`

- [ ] **Step 0.2.1: Create vite config with `@/` alias and `dist` output**

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 5173,
    open: false
  }
});
```

- [ ] **Step 0.2.2: Update `vitest.config.js` to mirror the alias**

Replace `vitest.config.js` contents with:

```js
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/core/**/*.js', 'src/tools/**/*.js']
    }
  }
});
```

- [ ] **Step 0.2.3: Commit**

```bash
git add vite.config.js vitest.config.js
git commit -m "chore(build): add vite.config.js and update vitest alias to src/"
```

### Task 0.3: Create skeleton folder structure

**Files:**
- Create: `src/`, `src/core/`, `src/css/`, `src/tools/`, `public/`

- [ ] **Step 0.3.1: Create directories**

Run:
```bash
mkdir -p src/core src/css src/tools public tests/core tests/integration
```

Expected: directories created (silent on success).

- [ ] **Step 0.3.2: Move existing CSS into `src/css/`**

Run:
```bash
git mv css/variables.css src/css/variables.css
git mv css/layout.css src/css/layout.css
git mv css/tools.css src/css/tools.css
```

Expected: 3 files moved. `git status` shows renames.

- [ ] **Step 0.3.3: Commit**

```bash
git commit -m "chore(refactor): create src/ scaffolding and move global css"
```

### Task 0.4: Move and reorganize existing core modules

**Files:**
- Modify path: `js/core/core.js` → `src/core/core.js`
- Modify path: `js/core/urlstate.js` → `src/core/urlstate.js`
- Modify path: `js/utils/utils.js` → `src/core/utils.js`
- Modify path: `js/app.js` → `src/core/app.js` (if it exists; otherwise create per Step 0.4.3)

- [ ] **Step 0.4.1: Move core files**

Run:
```bash
git mv js/core/core.js src/core/core.js
git mv js/core/urlstate.js src/core/urlstate.js
[ -f js/utils/utils.js ] && git mv js/utils/utils.js src/core/utils.js || true
[ -f js/app.js ] && git mv js/app.js src/core/app.js || true
```

Expected: files moved.

- [ ] **Step 0.4.2: Read `src/core/core.js` and confirm `App.core.history` exists**

Run:
```bash
grep -n "App.core.history" src/core/core.js | head -5
```

Expected: at least one match (legacy color history).

- [ ] **Step 0.4.3: Rename legacy color history `App.core.history` → `App.core.colorHistory`**

This avoids name collision with the new `App.history` (undo/redo) introduced later.

In `src/core/core.js`, find every occurrence of `App.core.history` and `core.history` (within the core module). Replace with `App.core.colorHistory` / `colorHistory`. Use `grep` to verify:

```bash
grep -rn "core\.history" src/ tests/ js/ 2>/dev/null
```

Update each occurrence found in `src/core/core.js`. Do NOT touch references in `js/main.js` yet (handled in Step 0.6.x).

- [ ] **Step 0.4.4: Create `src/core/app.js` if it doesn't exist**

If Step 0.4.1 didn't move an existing `app.js`, create `src/core/app.js`:

```js
window.App = window.App || { state: {} };
export default window.App;
```

If it already exists, ensure the first lines match the above (the existing file may already define `window.App = { state: {...} }` — keep that, just make sure it's importable).

- [ ] **Step 0.4.5: Commit**

```bash
git add src/ js/
git commit -m "refactor(core): move core modules to src/core and rename legacy color history"
```

### Task 0.5: Write tests for `App.lazy`

**Files:**
- Create: `tests/core/lazy.test.js`

- [ ] **Step 0.5.1: Write failing tests for lazy loader**

Create `tests/core/lazy.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = `
    <section id="section-foo" class="tool-section" hidden></section>
    <section id="section-bar" class="tool-section" hidden></section>
  `;
  window.App = { state: {} };
});

describe('App.lazy', () => {
  it('exposes load and preload functions', async () => {
    const { default: createLazy } = await import('@/core/lazy.js');
    const lazy = createLazy({
      templates: {},
      styles: {},
      modules: {}
    });
    expect(typeof lazy.load).toBe('function');
    expect(typeof lazy.preload).toBe('function');
  });

  it('load() injects HTML and runs init()', async () => {
    const initSpy = vi.fn();
    window.App.foo = { init: initSpy };
    const { default: createLazy } = await import('@/core/lazy.js');
    const lazy = createLazy({
      templates: { '../tools/foo/foo.html': () => Promise.resolve('<div class="tool-card">FOO</div>') },
      styles: {},
      modules: { '../tools/foo/foo.js': () => Promise.resolve({}) }
    });
    await lazy.load('foo');
    expect(document.getElementById('section-foo').innerHTML).toContain('FOO');
    expect(initSpy).toHaveBeenCalledOnce();
  });

  it('load() is idempotent', async () => {
    const initSpy = vi.fn();
    window.App.foo = { init: initSpy };
    const { default: createLazy } = await import('@/core/lazy.js');
    const moduleSpy = vi.fn(() => Promise.resolve({}));
    const lazy = createLazy({
      templates: { '../tools/foo/foo.html': () => Promise.resolve('<div>FOO</div>') },
      styles: {},
      modules: { '../tools/foo/foo.js': moduleSpy }
    });
    await lazy.load('foo');
    await lazy.load('foo');
    expect(moduleSpy).toHaveBeenCalledOnce();
    expect(initSpy).toHaveBeenCalledOnce();
  });

  it('preload() loads template+module without calling init()', async () => {
    const initSpy = vi.fn();
    window.App.bar = { init: initSpy };
    const { default: createLazy } = await import('@/core/lazy.js');
    const lazy = createLazy({
      templates: { '../tools/bar/bar.html': () => Promise.resolve('<div>BAR</div>') },
      styles: {},
      modules: { '../tools/bar/bar.js': () => Promise.resolve({}) }
    });
    await lazy.preload('bar');
    expect(initSpy).not.toHaveBeenCalled();
  });

  it('tools without CSS do not throw', async () => {
    window.App.foo = { init: () => {} };
    const { default: createLazy } = await import('@/core/lazy.js');
    const lazy = createLazy({
      templates: { '../tools/foo/foo.html': () => Promise.resolve('<div>F</div>') },
      styles: {},  // no CSS
      modules: { '../tools/foo/foo.js': () => Promise.resolve({}) }
    });
    await expect(lazy.load('foo')).resolves.not.toThrow();
  });
});
```

- [ ] **Step 0.5.2: Run tests — must FAIL**

Run: `npx vitest run tests/core/lazy.test.js`
Expected: FAIL with "Cannot find module '@/core/lazy.js'" or similar.

### Task 0.6: Implement `App.lazy`

**Files:**
- Create: `src/core/lazy.js`

- [ ] **Step 0.6.1: Implement minimal lazy loader (factory pattern for testability)**

Create `src/core/lazy.js`:

```js
// core/lazy.js
// Factory exists for testability (we inject template/style/module maps).
// Production usage uses the singleton at the bottom.

export default function createLazy({ templates, styles, modules }) {
  const _loaded = new Set();

  async function load(tool) {
    if (_loaded.has(tool)) return;

    const tplKey = `../tools/${tool}/${tool}.html`;
    const cssKey = `../tools/${tool}/${tool}.css`;
    const jsKey = `../tools/${tool}/${tool}.js`;

    const tplLoader = templates[tplKey];
    const cssLoader = styles[cssKey];
    const jsLoader = modules[jsKey];

    const [html] = await Promise.all([
      tplLoader ? tplLoader() : Promise.resolve(null),
      cssLoader ? cssLoader() : Promise.resolve(null),
      jsLoader ? jsLoader() : Promise.resolve(null)
    ]);

    const container = document.getElementById('section-' + tool);
    if (container && html) container.innerHTML = html;

    const mod = window.App && window.App[tool];
    if (mod && typeof mod.init === 'function') mod.init();

    _loaded.add(tool);
  }

  async function preload(tool) {
    if (_loaded.has(tool)) return;
    const tplKey = `../tools/${tool}/${tool}.html`;
    const jsKey = `../tools/${tool}/${tool}.js`;
    await Promise.all([
      templates[tplKey] ? templates[tplKey]() : null,
      modules[jsKey] ? modules[jsKey]() : null
    ].filter(Boolean));
  }

  function isLoaded(tool) {
    return _loaded.has(tool);
  }

  return { load, preload, isLoaded };
}

// Production singleton — wires up real Vite globs.
export function installLazy() {
  const templates = import.meta.glob('../tools/*/*.html', { query: '?raw', import: 'default' });
  const styles = import.meta.glob('../tools/*/*.css');
  const modules = import.meta.glob('../tools/*/*.js');
  const lazy = createLazy({ templates, styles, modules });
  window.App = window.App || { state: {} };
  window.App.lazy = lazy;
  return lazy;
}
```

- [ ] **Step 0.6.2: Run lazy tests — must PASS**

Run: `npx vitest run tests/core/lazy.test.js`
Expected: 5 tests passing.

- [ ] **Step 0.6.3: Commit**

```bash
git add src/core/lazy.js tests/core/lazy.test.js
git commit -m "feat(core): add App.lazy with template/css/js dynamic loading"
```

### Task 0.7: Write tests for `App.history`

**Files:**
- Create: `tests/core/history.test.js`

- [ ] **Step 0.7.1: Write failing tests for history**

Create `tests/core/history.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

let history;

beforeEach(async () => {
  localStorage.clear();
  document.body.innerHTML = `<section id="section-foo" class="tool-section"><input id="x" /></section>`;
  window.App = {
    state: {},
    foo: {
      serialize: () => 'a=1&b=2',
      deserialize: vi.fn()
    },
    urlState: {
      _currentTool: 'foo',
      _skipWrite: false,
      collectGeneric: () => ({ a: '1' }),
      applyGeneric: vi.fn(),
      write: vi.fn()
    }
  };
  vi.useFakeTimers();
  const mod = await import('@/core/history.js?t=' + Date.now());
  history = mod.default || mod.installHistory();
});

describe('App.history', () => {
  it('savePreset persists to localStorage', () => {
    const id = history.savePreset('foo', 'My Preset');
    expect(id).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem('devtools.presets.v1'));
    expect(stored.foo).toHaveLength(1);
    expect(stored.foo[0].name).toBe('My Preset');
  });

  it('loadPreset calls tool.deserialize with stored state', () => {
    const id = history.savePreset('foo', 'P');
    history.loadPreset('foo', id);
    expect(window.App.foo.deserialize).toHaveBeenCalled();
  });

  it('deletePreset removes the preset', () => {
    const id = history.savePreset('foo', 'P');
    history.deletePreset('foo', id);
    expect(history.listPresets('foo')).toHaveLength(0);
  });

  it('renamePreset updates name', () => {
    const id = history.savePreset('foo', 'Old');
    history.renamePreset('foo', id, 'New');
    expect(history.listPresets('foo')[0].name).toBe('New');
  });

  it('toggleFavorite adds and removes id', () => {
    const id = history.savePreset('foo', 'P');
    history.toggleFavorite('foo', id);
    expect(history.isFavorite('foo', id)).toBe(true);
    history.toggleFavorite('foo', id);
    expect(history.isFavorite('foo', id)).toBe(false);
  });

  it('listFavorites returns presets that are favorite', () => {
    const a = history.savePreset('foo', 'A');
    const b = history.savePreset('foo', 'B');
    history.toggleFavorite('foo', b);
    const favs = history.listFavorites('foo');
    expect(favs).toHaveLength(1);
    expect(favs[0].id).toBe(b);
  });

  it('capture creates a snapshot in undo stack', () => {
    history.capture('foo');
    history.capture('foo');
    // first capture sets current; second pushes prev to undo
    expect(history.canUndo('foo')).toBe(true);
  });

  it('undo restores previous snapshot', () => {
    history.capture('foo');
    // simulate state change by changing serialize result
    window.App.foo.serialize = () => 'a=2&b=3';
    history.capture('foo');
    history.undo('foo');
    expect(window.App.foo.deserialize).toHaveBeenCalled();
  });

  it('redo cleared after a fresh capture', () => {
    history.capture('foo');
    window.App.foo.serialize = () => 'a=2';
    history.capture('foo');
    history.undo('foo');
    expect(history.canRedo('foo')).toBe(true);
    window.App.foo.serialize = () => 'a=3';
    history.capture('foo');
    expect(history.canRedo('foo')).toBe(false);
  });

  it('migrate v0 legacy keys to v1 (flexFavorites)', async () => {
    localStorage.setItem('flexFavorites', JSON.stringify([{ name: 'L', state: 'k=1' }]));
    // re-import after seeding legacy
    vi.resetModules();
    const mod = await import('@/core/history.js?t=' + Date.now());
    const h = mod.default || mod.installHistory();
    const presets = h.listPresets('flex');
    expect(presets.length).toBeGreaterThan(0);
    expect(localStorage.getItem('flexFavorites')).toBeNull();
  });
});
```

- [ ] **Step 0.7.2: Run tests — must FAIL**

Run: `npx vitest run tests/core/history.test.js`
Expected: FAIL — module not found.

### Task 0.8: Implement `App.history`

**Files:**
- Create: `src/core/history.js`

- [ ] **Step 0.8.1: Implement history module**

Create `src/core/history.js`:

```js
// core/history.js
// Unified undo/redo + presets + favorites for all tools.
// Reuses App[tool].serialize / deserialize when present, otherwise App.urlState generic helpers.

const PRESETS_KEY = 'devtools.presets.v1';
const FAVS_KEY = 'devtools.favorites.v1';
const MAX_UNDO = 50;
const DEBOUNCE_MS = 300;

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

function persist(state) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(state.presets));
  localStorage.setItem(FAVS_KEY, JSON.stringify(state.favorites));
}

function migrateLegacy(state) {
  const legacyMap = {
    flexFavorites: 'flex',
    gridFavorites: 'grid',
    shadowFavorites: 'shadow'
  };
  for (const [key, tool] of Object.entries(legacyMap)) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) continue;
      state.presets[tool] = state.presets[tool] || [];
      for (const entry of arr) {
        const name = entry.name || `Migrated ${state.presets[tool].length + 1}`;
        const stateData = entry.state || entry.data || entry;
        state.presets[tool].push({
          id: cryptoId(),
          name,
          state: typeof stateData === 'string' ? Object.fromEntries(new URLSearchParams(stateData)) : stateData,
          createdAt: Date.now()
        });
      }
      localStorage.removeItem(key);
    } catch (e) {
      // skip malformed legacy data
    }
  }
}

function cryptoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createHistory() {
  const state = {
    presets: load(PRESETS_KEY) || {},
    favorites: load(FAVS_KEY) || {},
    stacks: {},          // tool -> { undo: [], redo: [], current }
    debounceTimer: null
  };

  migrateLegacy(state);
  persist(state);

  function snapshot(tool) {
    const App = window.App;
    const mod = App && App[tool];
    if (mod && typeof mod.serialize === 'function') {
      const data = mod.serialize();
      if (typeof data === 'string') return Object.fromEntries(new URLSearchParams(data));
      if (data instanceof URLSearchParams) return Object.fromEntries(data);
      return { ...data };
    }
    if (App && App.urlState && typeof App.urlState.collectGeneric === 'function') {
      return App.urlState.collectGeneric(tool);
    }
    return {};
  }

  function restore(tool, stateObj) {
    const App = window.App;
    if (!App) return;
    if (App.urlState) App.urlState._skipWrite = true;
    try {
      const params = new URLSearchParams(stateObj);
      const mod = App[tool];
      if (mod && typeof mod.deserialize === 'function') {
        mod.deserialize(params);
      } else if (App.urlState && typeof App.urlState.applyGeneric === 'function') {
        App.urlState.applyGeneric(tool, params);
      }
    } finally {
      if (App.urlState) App.urlState._skipWrite = false;
    }
    if (App.urlState && typeof App.urlState.write === 'function') {
      App.urlState.write(tool, true);
    }
  }

  function capture(tool) {
    const cur = snapshot(tool);
    const stack = state.stacks[tool] || (state.stacks[tool] = { undo: [], redo: [], current: null });
    if (stack.current && JSON.stringify(stack.current) === JSON.stringify(cur)) return;
    if (stack.current) {
      stack.undo.push(stack.current);
      if (stack.undo.length > MAX_UNDO) stack.undo.shift();
    }
    stack.current = cur;
    stack.redo = [];
  }

  function undo(tool) {
    const stack = state.stacks[tool];
    if (!stack || stack.undo.length === 0) return;
    const prev = stack.undo.pop();
    if (stack.current) stack.redo.push(stack.current);
    stack.current = prev;
    restore(tool, prev);
  }

  function redo(tool) {
    const stack = state.stacks[tool];
    if (!stack || stack.redo.length === 0) return;
    const next = stack.redo.pop();
    if (stack.current) stack.undo.push(stack.current);
    stack.current = next;
    restore(tool, next);
  }

  function canUndo(tool) {
    return !!(state.stacks[tool] && state.stacks[tool].undo.length > 0);
  }

  function canRedo(tool) {
    return !!(state.stacks[tool] && state.stacks[tool].redo.length > 0);
  }

  function savePreset(tool, name) {
    const data = snapshot(tool);
    const id = cryptoId();
    state.presets[tool] = state.presets[tool] || [];
    state.presets[tool].push({ id, name, state: data, createdAt: Date.now() });
    persist(state);
    return id;
  }

  function loadPreset(tool, id) {
    const preset = (state.presets[tool] || []).find(p => p.id === id);
    if (!preset) return;
    restore(tool, preset.state);
  }

  function deletePreset(tool, id) {
    state.presets[tool] = (state.presets[tool] || []).filter(p => p.id !== id);
    state.favorites[tool] = (state.favorites[tool] || []).filter(fid => fid !== id);
    persist(state);
  }

  function renamePreset(tool, id, newName) {
    const preset = (state.presets[tool] || []).find(p => p.id === id);
    if (!preset) return;
    preset.name = newName;
    persist(state);
  }

  function listPresets(tool) {
    return (state.presets[tool] || []).slice();
  }

  function toggleFavorite(tool, id) {
    state.favorites[tool] = state.favorites[tool] || [];
    const idx = state.favorites[tool].indexOf(id);
    if (idx >= 0) state.favorites[tool].splice(idx, 1);
    else state.favorites[tool].push(id);
    persist(state);
  }

  function isFavorite(tool, id) {
    return !!(state.favorites[tool] && state.favorites[tool].includes(id));
  }

  function listFavorites(tool) {
    const ids = state.favorites[tool] || [];
    const presets = state.presets[tool] || [];
    return presets.filter(p => ids.includes(p.id));
  }

  function exportAll() {
    return JSON.stringify({ presets: state.presets, favorites: state.favorites });
  }

  function importAll(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (parsed.presets) state.presets = { ...state.presets, ...parsed.presets };
    if (parsed.favorites) state.favorites = { ...state.favorites, ...parsed.favorites };
    persist(state);
  }

  function onChange(e) {
    const App = window.App;
    if (!App || !App.urlState) return;
    const tool = App.urlState._currentTool;
    if (!tool || App.urlState._skipWrite) return;
    if (!e.target.closest('#section-' + tool)) return;
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => capture(tool), DEBOUNCE_MS);
  }

  function init() {
    document.addEventListener('input', onChange);
    document.addEventListener('change', onChange);
  }

  return {
    init, capture, undo, redo, canUndo, canRedo,
    savePreset, loadPreset, deletePreset, renamePreset, listPresets,
    toggleFavorite, isFavorite, listFavorites,
    exportAll, importAll
  };
}

export function installHistory() {
  const history = createHistory();
  window.App = window.App || { state: {} };
  window.App.history = history;
  return history;
}

export default installHistory();
```

- [ ] **Step 0.8.2: Run tests — must PASS**

Run: `npx vitest run tests/core/history.test.js`
Expected: 10 tests passing.

- [ ] **Step 0.8.3: Commit**

```bash
git add src/core/history.js tests/core/history.test.js
git commit -m "feat(core): add App.history with undo/redo, presets, favorites, legacy migration"
```

### Task 0.9: Create `core/presets-ui.js` (auto-injected presets bar)

**Files:**
- Create: `src/core/presets-ui.js`
- Create: `src/css/presets-ui.css`

- [ ] **Step 0.9.1: Create presets-ui module**

Create `src/core/presets-ui.js`:

```js
// core/presets-ui.js
// Injects a presets bar at the bottom of every loaded tool unless data-no-presets is set.

function buildBar(tool) {
  const wrapper = document.createElement('div');
  wrapper.className = 'presets-bar';
  wrapper.dataset.tool = tool;
  wrapper.innerHTML = `
    <div class="presets-bar__group">
      <button type="button" class="presets-btn" data-action="undo" aria-label="Undo">↶</button>
      <button type="button" class="presets-btn" data-action="redo" aria-label="Redo">↷</button>
    </div>
    <div class="presets-bar__group presets-bar__favs"></div>
    <div class="presets-bar__group presets-bar__actions">
      <button type="button" class="presets-btn" data-action="save">💾 Save preset</button>
      <button type="button" class="presets-btn" data-action="list">📋 All</button>
    </div>
  `;
  return wrapper;
}

function renderFavs(bar, tool) {
  const favs = window.App.history.listFavorites(tool);
  const container = bar.querySelector('.presets-bar__favs');
  container.innerHTML = '';
  if (!favs.length) {
    container.textContent = '—';
    return;
  }
  for (const preset of favs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'presets-btn presets-btn--fav';
    btn.textContent = '⭐ ' + preset.name;
    btn.addEventListener('click', () => window.App.history.loadPreset(tool, preset.id));
    container.appendChild(btn);
  }
}

function attachHandlers(bar, tool) {
  bar.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    const h = window.App.history;
    if (action === 'undo') h.undo(tool);
    else if (action === 'redo') h.redo(tool);
    else if (action === 'save') {
      const name = window.prompt('Preset name?');
      if (name) {
        h.savePreset(tool, name);
        renderFavs(bar, tool);
      }
    } else if (action === 'list') {
      window.dispatchEvent(new CustomEvent('presets:list', { detail: { tool } }));
    }
  });
}

export function injectPresetsBar(tool) {
  const section = document.getElementById('section-' + tool);
  if (!section) return;
  const card = section.querySelector('.tool-card') || section.firstElementChild;
  if (!card) return;
  if (card.hasAttribute('data-no-presets')) return;
  if (section.querySelector('.presets-bar')) return; // already injected

  const bar = buildBar(tool);
  attachHandlers(bar, tool);
  renderFavs(bar, tool);
  card.appendChild(bar);
}
```

- [ ] **Step 0.9.2: Create CSS for presets bar**

Create `src/css/presets-ui.css`:

```css
.presets-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md, 16px);
  align-items: center;
  margin-top: var(--space-md, 16px);
  padding-top: var(--space-md, 16px);
  border-top: 1px solid var(--color-border, #E5E5EA);
}

.presets-bar__group {
  display: flex;
  gap: var(--space-xs, 4px);
  align-items: center;
}

.presets-bar__favs {
  flex: 1;
  flex-wrap: wrap;
  color: var(--color-text-secondary, #8E8E93);
  font-size: 0.85rem;
}

.presets-btn {
  background: var(--color-surface-alt, #F2F2F7);
  color: var(--color-text-primary, #1C1C1E);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.presets-btn:hover { border-color: var(--color-border, #E5E5EA); }
.presets-btn:focus-visible { outline: 2px solid var(--color-primary, #007AFF); outline-offset: 2px; }
.presets-btn--fav { background: transparent; }
```

- [ ] **Step 0.9.3: Commit**

```bash
git add src/core/presets-ui.js src/css/presets-ui.css
git commit -m "feat(core): add auto-injected presets bar UI"
```

### Task 0.10: Create new `index.html` cascarón

**Files:**
- Modify: `index.html`

- [ ] **Step 0.10.1: Read current index.html structure to extract chrome-only HTML**

Read `index.html` lines 1-160 (header, search, tabs, theme switch, loader). This is the chrome to keep. Everything below the closing `</div>` of the header row up to the closing `</body>` contains the 18 tool sections — those move to `tools/[tool]/[tool].html` later. Replace tool sections with empty `<section>` placeholders.

- [ ] **Step 0.10.2: Replace `index.html` contents**

Overwrite `index.html` with cascarón structure. Keep:
- HTML head with theme bootstrap script
- `<link>` tags only for global CSS (`src/css/variables.css`, `layout.css`, `tools.css`, `presets-ui.css`)
- Existing chrome (loader, header-row, search, tabs container, theme switch — copy verbatim from existing index.html)
- Empty `<section id="section-[tool]" class="tool-section" hidden></section>` × 18, with the first one (`section-clamp`) marked `class="tool-section active"` and not hidden
- Single `<script type="module" src="/src/main.js"></script>` at the end

The tools list (in tab order from the existing index): clamp, ratio, flex, grid, shadow, gradient, filter, transform, blob, contrast, palette, converter, placeholder, metatags, keyframes, typescale, borderradius, scrollbar.

Concrete cascarón target structure:

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>DevTools Suite</title>
    <script>
      (function() {
        const s = localStorage.getItem("theme") ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", s);
      })();
    </script>
    <link rel="stylesheet" href="/src/css/variables.css">
    <link rel="stylesheet" href="/src/css/layout.css">
    <link rel="stylesheet" href="/src/css/tools.css">
    <link rel="stylesheet" href="/src/css/presets-ui.css">
  </head>
  <body>
    <!-- COPY VERBATIM the loader + header-row + search + tabs + theme switch from current index.html -->
    <div class="app-container">
      <!-- ... chrome here ... -->

      <main class="main-content">
        <section id="section-clamp" class="tool-section active"></section>
        <section id="section-ratio" class="tool-section" hidden></section>
        <section id="section-flex" class="tool-section" hidden></section>
        <section id="section-grid" class="tool-section" hidden></section>
        <section id="section-shadow" class="tool-section" hidden></section>
        <section id="section-gradient" class="tool-section" hidden></section>
        <section id="section-filter" class="tool-section" hidden></section>
        <section id="section-transform" class="tool-section" hidden></section>
        <section id="section-blob" class="tool-section" hidden></section>
        <section id="section-contrast" class="tool-section" hidden></section>
        <section id="section-palette" class="tool-section" hidden></section>
        <section id="section-converter" class="tool-section" hidden></section>
        <section id="section-placeholder" class="tool-section" hidden></section>
        <section id="section-metatags" class="tool-section" hidden></section>
        <section id="section-keyframes" class="tool-section" hidden></section>
        <section id="section-typescale" class="tool-section" hidden></section>
        <section id="section-borderradius" class="tool-section" hidden></section>
        <section id="section-scrollbar" class="tool-section" hidden></section>
      </main>
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

> **Important:** copy the exact chrome HTML from current index.html verbatim (loader-overlay, header-row, search-wrapper, tabs-wrapper, theme switch). Do NOT rewrite it from memory — there are SVG assets that must be preserved.

- [ ] **Step 0.10.3: Verify file ≤ 250 lines**

Run: `wc -l index.html`
Expected: ≤ 250 lines.

- [ ] **Step 0.10.4: Commit**

```bash
git add index.html
git commit -m "refactor(index): convert index.html to chrome-only cascarón"
```

### Task 0.11: Create `src/main.js` entry

**Files:**
- Create: `src/main.js`

- [ ] **Step 0.11.1: Move and rewrite main.js**

Move existing `js/main.js` to keep version control history, then rewrite:

```bash
git mv js/main.js src/main.js
```

Then replace contents with:

```js
// src/main.js — entry point. Wires up core modules and lazy-loads the initial tool.

import './core/utils.js';      // attaches App.utils
import './core/core.js';       // attaches App.core
import './core/urlstate.js';   // attaches App.urlState
import { installLazy } from './core/lazy.js';
import { installHistory } from './core/history.js';
import { injectPresetsBar } from './core/presets-ui.js';

window.App = window.App || { state: {} };

// Make presets-ui injectable from any tool init (and from lazy after load).
window.App._injectPresetsBar = injectPresetsBar;

// Install lazy + history singletons (each attaches itself to window.App).
const lazy = installLazy();
const history = installHistory();

// Wrap the existing switchTab to await lazy.load() before showing the tool.
const originalSwitchTab = window.App.core && window.App.core.switchTab;
if (originalSwitchTab) {
  window.App.core.switchTab = async function(tool, event) {
    await lazy.load(tool);
    injectPresetsBar(tool);
    return originalSwitchTab.call(this, tool, event);
  };
}

// Compatibility shims for inline onclick="..." handlers (kept for Phase 1).
window.toggleTheme = (e) => window.App.core.toggleTheme(e);
window.switchTab = (tool, event) => window.App.core.switchTab(tool, event);
window.copyText = (...args) => window.App.utils.copyText(...args);
window.syncProPicker = (prefix, value) => window.App.syncProPicker?.(prefix, value);

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize core (theme, search, scroll buttons, etc.)
  if (window.App.core?.initTheme) window.App.core.initTheme();
  if (window.App.core?.colorHistory?.init) window.App.core.colorHistory.init();
  history.init();

  // Determine the initial tool (from URL hash or default to clamp)
  const hash = location.hash.slice(1).split('?')[0];
  const initialTool = hash && document.getElementById('section-' + hash) ? hash : 'clamp';

  await lazy.load(initialTool);
  injectPresetsBar(initialTool);

  // Set the initial tool active in tabs UI
  if (window.App.core?.switchTab && initialTool !== 'clamp') {
    // already loaded; just trigger the UI swap without re-loading
    const originalState = lazy.isLoaded(initialTool);
    if (!originalState) await lazy.load(initialTool);
  }

  if (window.App.urlState?.init) window.App.urlState.init();

  // Hide loader (preserve original UX)
  const loader = document.getElementById('loader-overlay');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => { loader.style.display = 'none'; }, 500);
    }, 300);
  }
});
```

> Notes:
> - The legacy `_initAllTools()` is **gone** — initialization happens per-tool via `lazy.load()` calling `App[tool].init()`.
> - Inline `window.*` shims for non-core handlers (e.g. `window.calcClamp`) are removed; tools that need them re-attach inside their own `[tool].js` (handled in each tool migration task).
> - `App.core.colorHistory` (renamed from legacy `App.core.history`) keeps working independently.

- [ ] **Step 0.11.2: Run dev server smoke test**

Run: `npm run dev`
Expected: Vite starts on port 5173, no errors. `Ctrl+C` to stop.

> Note: Tools will be empty (404 in network tab) because `tools/clamp/clamp.html` doesn't exist yet. The next wave creates them. The cascarón itself should render with theme + tabs visible.

- [ ] **Step 0.11.3: Commit**

```bash
git add src/main.js js/
git commit -m "refactor(main): replace js/main.js with src/main.js entry that lazy-loads tools"
```

### Task 0.12: Update existing tests to new import paths

**Files:**
- Modify: `tests/setup.js`, `tests/clamp.test.js`, `tests/contrast.test.js`, `tests/converter.test.js`, `tests/core-search.test.js`, `tests/ratio.test.js`, `tests/syncProPicker.test.js`, `tests/urlstate.test.js`, `tests/utils.test.js`

- [ ] **Step 0.12.1: Update `tests/setup.js` to load core from new location**

Read `tests/setup.js` first, then update any references from `js/core/` or `js/utils/` or `js/modules/` to `src/core/` or `src/tools/[tool]/`. For tools not yet migrated, the import path will fail until that wave runs — that's expected.

> **Strategy:** during Wave 0, only update tests for files that **already moved** (core, urlstate, utils). Tool tests (clamp, contrast, converter, ratio, syncProPicker) will be updated when their respective tool migration runs (Waves 1, 3).

Concrete updates in this step:
- `tests/setup.js`: any references to `js/core/core.js` → `src/core/core.js`; `js/utils/utils.js` → `src/core/utils.js`
- `tests/urlstate.test.js`: imports of `js/core/urlstate.js` → `src/core/urlstate.js`
- `tests/utils.test.js`: imports of `js/utils/utils.js` → `src/core/utils.js`
- `tests/core-search.test.js`: imports of `js/core/core.js` → `src/core/core.js`

Other test files keep their (now broken) imports — they'll be fixed in their tool's migration wave.

- [ ] **Step 0.12.2: Run only the updated tests**

Run:
```bash
npx vitest run tests/core/lazy.test.js tests/core/history.test.js tests/urlstate.test.js tests/utils.test.js tests/core-search.test.js
```
Expected: all pass.

- [ ] **Step 0.12.3: Commit**

```bash
git add tests/
git commit -m "test: update import paths for moved core modules"
```

### Task 0.13: Remove deprecated `scripts/fingerprint.py`

**Files:**
- Delete: `scripts/fingerprint.py`

- [ ] **Step 0.13.1: Delete and commit**

Run:
```bash
git rm scripts/fingerprint.py
git commit -m "chore(build): remove fingerprint.py (Vite handles cache busting)"
```

### Task 0.14: Verify Wave 0 — boot smoke test

- [ ] **Step 0.14.1: Run dev server and confirm chrome loads without errors**

Run `npm run dev`. Open http://localhost:5173 in a browser.

Expected:
- Page loads with header, tabs, search, theme switch visible
- No console errors related to missing core modules
- Console may show 404s for `tools/clamp/clamp.html` etc. — **expected** until Wave 1
- Theme toggle works
- Tab clicks may not switch (no content yet) — **expected**

- [ ] **Step 0.14.2: Run all current tests**

Run: `npx vitest run`
Expected: tests for `lazy`, `history`, `urlstate`, `utils`, `core-search` pass. Tests for not-yet-migrated tools (`clamp`, `contrast`, `converter`, `ratio`, `syncProPicker`) may fail with import errors — **expected**, fixed in their respective waves.

- [ ] **Step 0.14.3: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 0 (Vite + core foundations) complete"
```

---

## Tool migration template

> **Apply this template** for each tool listed in Waves 1–6. The template repeats for every tool to make tasks self-contained when read out of order.

### Migration steps for tool `T` (with optional CSS `T.css`)

**Files:**
- Create: `src/tools/T/T.html`
- Create: `src/tools/T/T.js` (moved from `js/modules/T.js`)
- Create: `src/tools/T/T.css` (only if `css/T.css` exists)
- Modify: `index.html` (replace `<section id="section-T">...</section>` content with empty section)

- [ ] **M1: Create the tool folder**

Run:
```bash
mkdir -p src/tools/T
```

- [ ] **M2: Move JS module**

Run:
```bash
git mv js/modules/T.js src/tools/T/T.js
```

- [ ] **M3: Move CSS module if present**

Run:
```bash
[ -f css/T.css ] && git mv css/T.css src/tools/T/T.css || true
```

- [ ] **M4: Add CSS import inside the JS module (if CSS exists)**

Open `src/tools/T/T.js`. Add at the very top:

```js
import './T.css';
```

If no `T.css` exists, skip this step.

- [ ] **M5: Extract HTML for the tool**

Read current `index.html` and find the block that previously was `<section id="section-T" class="tool-section" ...>...</section>`.

> Wait — `index.html` was rewritten in Task 0.10 with empty sections. The original tool HTML lives in the **previous git history**. Recover it:

```bash
git show HEAD~N:index.html > /tmp/old-index.html  # adjust N to find the commit before Task 0.10's rewrite
```

Or more robustly, find the commit hash:

```bash
git log --oneline -- index.html | grep -B1 "cascarón"
```

Then check out the previous version:

```bash
git show <commit-before-cascaron>:index.html > /tmp/old-index.html
```

Open `/tmp/old-index.html`, locate `<section id="section-T">...</section>`, copy the **inner content** (everything between `<section ...>` and `</section>`).

- [ ] **M6: Create `tools/T/T.html`**

Create `src/tools/T/T.html` and paste the inner content from M5. Wrap it in a `<div class="tool-card">` if not already present (most tools already have this wrapper inside their section).

> The presets bar is auto-injected by `presets-ui.js`, so do NOT add a presets section manually.

- [ ] **M7: Verify the empty section in `index.html`**

Confirm `index.html` has `<section id="section-T" class="tool-section" hidden></section>` (or `class="tool-section active"` for the initial tool). It should already be there from Task 0.10.

- [ ] **M8: Smoke test in dev**

Run `npm run dev` (background or other terminal), open http://localhost:5173, click the `T` tab.

Expected:
- Network tab shows `tools/T/T.js`, `tools/T/T.html`, optionally `tools/T/T.css` chunks loaded
- Tool renders identically to before
- Inputs work
- Copy button works
- URL hash updates as inputs change
- Console: no errors

- [ ] **M9: Smoke test undo/redo**

Change 2-3 inputs in tool `T`, wait 500ms, then click the `↶` button in the auto-injected presets bar. The previous values should restore.

Expected: inputs revert to prior state.

- [ ] **M10: Update test imports for tool `T` (only if a test file exists)**

If `tests/T.test.js` exists, update its import paths from `js/modules/T.js` → `src/tools/T/T.js`.

Run: `npx vitest run tests/T.test.js`
Expected: tests pass.

- [ ] **M11: Commit migration of tool T**

```bash
git add src/tools/T/ index.html tests/T.test.js
git commit -m "refactor(T): migrate to src/tools/T/ with lazy load"
```

---

## Wave 1 — Simple tools (validate the pattern)

### Task 1.1: Migrate `clamp`

Apply the **Tool migration template** with `T = clamp`.

**Tool-specific notes:**
- `clamp.css` does NOT exist → skip M3, M4.
- `tests/clamp.test.js` exists → must run M10.
- Initial tool — section is `<section id="section-clamp" class="tool-section active">` (no `hidden`).

- [ ] Steps M1–M11 for `clamp`

### Task 1.2: Migrate `ratio`

Apply the **Tool migration template** with `T = ratio`.

**Tool-specific notes:**
- `ratio.css` does NOT exist → skip M3, M4.
- `tests/ratio.test.js` exists → must run M10.

- [ ] Steps M1–M11 for `ratio`

### Task 1.3: Migrate `placeholder`

Apply the **Tool migration template** with `T = placeholder`.

**Tool-specific notes:**
- `placeholder.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `placeholder`

### Task 1.4: Migrate `filter`

Apply the **Tool migration template** with `T = filter`.

**Tool-specific notes:**
- `filter.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `filter`

### Task 1.5: Wave 1 verification

- [ ] **Step 1.5.1: Manual smoke checklist**

For each of clamp, ratio, placeholder, filter:
- Open the tool from a fresh page load (with `#tool` in URL)
- Switch to it from another tool
- Change 3 inputs
- Click copy → paste in editor → verify CSS is identical to before refactor
- Hash updates when inputs change

- [ ] **Step 1.5.2: Run all tests**

Run: `npx vitest run`
Expected: clamp, ratio, lazy, history, urlstate, utils, core-search tests pass. Other tool tests (contrast, converter, syncProPicker) still failing (expected until those waves).

- [ ] **Step 1.5.3: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 1 (clamp, ratio, placeholder, filter) complete"
```

---

## Wave 2 — Linear tools

### Task 2.1: Migrate `converter`

Apply the **Tool migration template** with `T = converter`.

**Tool-specific notes:**
- `converter.css` exists → run M3, M4.
- `tests/converter.test.js` exists → must run M10.

- [ ] Steps M1–M11 for `converter`

### Task 2.2: Migrate `metatags`

Apply the **Tool migration template** with `T = metatags`.

**Tool-specific notes:**
- `metatags.css` exists → run M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `metatags`

### Task 2.3: Migrate `borderradius`

Apply the **Tool migration template** with `T = borderradius`.

**Tool-specific notes:**
- `borderradius.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `borderradius`

### Task 2.4: Migrate `scrollbar`

Apply the **Tool migration template** with `T = scrollbar`.

**Tool-specific notes:**
- `scrollbar.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `scrollbar`

### Task 2.5: Migrate `typescale`

Apply the **Tool migration template** with `T = typescale`.

**Tool-specific notes:**
- `typescale.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `typescale`

### Task 2.6: Wave 2 verification

- [ ] **Step 2.6.1: Manual smoke for the 5 tools**

For each of converter, metatags, borderradius, scrollbar, typescale: same checks as Wave 1.

- [ ] **Step 2.6.2: Run all tests**

Run: `npx vitest run`
Expected: previous + converter tests pass.

- [ ] **Step 2.6.3: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 2 (converter, metatags, borderradius, scrollbar, typescale) complete"
```

---

## Wave 3 — Color tools

### Task 3.1: Migrate `contrast`

Apply the **Tool migration template** with `T = contrast`.

**Tool-specific notes:**
- `contrast.css` exists → run M3, M4.
- `tests/contrast.test.js` exists → must run M10.
- Tool uses `App.syncProPicker` for color inputs (`fg`, `bg` prefixes). Verify this still works after migration: change a color picker, both fg/bg HEX text and the swatch update.

- [ ] Steps M1–M11 for `contrast`

### Task 3.2: Migrate `palette`

Apply the **Tool migration template** with `T = palette`.

**Tool-specific notes:**
- `palette.css` exists → run M3, M4.
- No test file → skip M10.
- Uses `App.syncProPicker` with prefix `pal`. Verify color sync.
- `App._initPalettePresets()` was called in old `main.js`. The new lazy load triggers `App.palette.init()` automatically. Confirm `palette.js` calls `_initPalettePresets` internally; if not, move the body of the old `App._initPalettePresets` (in archived main.js) into `palette.init()`.

- [ ] Steps M1–M11 for `palette`

### Task 3.3: Migrate `gradient`

Apply the **Tool migration template** with `T = gradient`.

**Tool-specific notes:**
- `gradient.css` exists → run M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `gradient`

### Task 3.4: Wave 3 verification

- [ ] **Step 3.4.1: Manual smoke for color tools**

Specific to color tools, also verify:
- Color picker changes update the preview
- Color picker changes update other fields (HEX, RGB)
- Contrast pass/fail badge renders
- Palette swatches render and clicking applies the color
- Gradient stops are draggable and update preview

- [ ] **Step 3.4.2: Run all tests**

Run: `npx vitest run`
Expected: previous + contrast tests pass.

- [ ] **Step 3.4.3: Run syncProPicker test**

Update `tests/syncProPicker.test.js` imports if needed (paths to new src/ locations) and run:

```bash
npx vitest run tests/syncProPicker.test.js
```

Expected: pass.

- [ ] **Step 3.4.4: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 3 (contrast, palette, gradient) complete"
```

---

## Wave 4 — Larger tools

### Task 4.1: Migrate `keyframes`

Apply the **Tool migration template** with `T = keyframes`.

**Tool-specific notes:**
- `keyframes.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `keyframes`

### Task 4.2: Migrate `transform`

Apply the **Tool migration template** with `T = transform`.

**Tool-specific notes:**
- `transform.css` does NOT exist → skip M3, M4.
- No test file → skip M10.

- [ ] Steps M1–M11 for `transform`

### Task 4.3: Migrate `shape` (section id is `blob`)

Apply the **Tool migration template** with `T = shape`.

**Tool-specific notes:**
- `blob.css` exists → run M3, M4. **Naming nuance:** the CSS file is `blob.css` (matches section id `blob`) but the JS module is `shape.js`. After migration:
  - Move `js/modules/shape.js` → `src/tools/shape/shape.js`
  - Move `css/blob.css` → `src/tools/shape/shape.css`
  - In `shape.js` add `import './shape.css'`
- The section id is `<section id="section-blob">`, but the JS module registers as `App.shape`. The lazy loader uses the **tool key** to find files; we need the section id and the module name to align.

Resolution: keep the section id as `blob` (HTML+UI continuity) but key the lazy loader on `blob` not `shape`. Two options:

**Option A (simpler):** Rename JS module + folder to `blob/blob.js`. Module exports as `App.blob`. Update `core.toolsList` entry from `{ id: 'blob', ... }` (already matches). Update existing `App.shape` references in `App._syncHandlers` (in archived main.js, lines 7-8) — but we already removed `_initAllTools`. Search remaining references:
```bash
grep -rn "App\.shape" src/ tests/ 2>/dev/null
```
Update each reference to `App.blob`.

**Option B:** Keep JS as `shape.js` but rename folder to `blob/` and the file to `blob.js`. Internally still defines `App.blob`.

Recommendation: **Option A**. Folder `src/tools/blob/`, file `blob.js`, CSS `blob.css`, registers as `App.blob`. Section id remains `blob`. All consistent.

Concrete steps for shape→blob rename:

```bash
mkdir -p src/tools/blob
git mv js/modules/shape.js src/tools/blob/blob.js
git mv css/blob.css src/tools/blob/blob.css
```

In `src/tools/blob/blob.js`:
- Replace `App.shape` → `App.blob` throughout
- Add `import './blob.css';` at top

Recover the HTML for the section from previous index.html (M5 procedure) into `src/tools/blob/blob.html`.

- [ ] Steps M1–M11 for `blob` (with the renaming above)

### Task 4.4: Wave 4 verification

- [ ] **Step 4.4.1: Smoke test keyframes, transform, blob**

- Animate keyframe preview
- Multi-transform stacking
- Blob: switch between blob and triangle, change parameters

- [ ] **Step 4.4.2: Verify `App.shape` references are gone**

Run:
```bash
grep -rn "App\.shape" src/ tests/ 2>/dev/null
```
Expected: empty (or only in comments).

- [ ] **Step 4.4.3: Run all tests**

Run: `npx vitest run`
Expected: previous tests still pass.

- [ ] **Step 4.4.4: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 4 (keyframes, transform, blob) complete"
```

---

## Wave 5 — Tools with legacy favorites (flex, grid)

### Task 5.1: Migrate `flex` with legacy favorites preservation

Apply the **Tool migration template** with `T = flex`.

**Tool-specific notes:**
- `flex.css` exists → run M3, M4.
- No test file → skip M10.
- Tool has its own favorites system using `localStorage.flexFavorites`. The migration in `core/history.js` (run at boot) **moved this** to `devtools.presets.v1.flex`.

Additional steps after M11:

- [ ] **Step 5.1.1: Remove the in-tool favorites code**

Open `src/tools/flex/flex.js`. Find any function that reads/writes `localStorage` for favorites (likely `initFavorites`, `saveFavorite`, `loadFavorite`, etc.). **Replace them** with calls to `App.history.savePreset('flex', ...)`, `loadPreset`, `listPresets`. Or — simpler — **delete the old UI** and rely entirely on the auto-injected presets bar from `presets-ui.js`.

Recommendation: delete the old custom favorites HTML inside `flex.html` (the buttons/list) and let `presets-ui.js` handle UI. Keep any other tool functionality intact.

- [ ] **Step 5.1.2: Verify migration**

In dev console:
```js
// Pre-migration: legacy data in localStorage
localStorage.setItem('flexFavorites', JSON.stringify([{ name: 'Test', state: 'flexDir=row' }]));
// Reload page
```

After reload:
```js
// Confirm v1 has it
JSON.parse(localStorage.getItem('devtools.presets.v1')).flex
// → array with { id, name: 'Test', state: { flexDir: 'row' }, createdAt }
// And legacy key is gone:
localStorage.getItem('flexFavorites')  // → null
```

- [ ] **Step 5.1.3: Commit**

```bash
git add src/tools/flex/
git commit -m "refactor(flex): migrate legacy favorites to App.history"
```

### Task 5.2: Migrate `grid` with legacy favorites preservation

Apply the **Tool migration template** with `T = grid`.

**Tool-specific notes:**
- `grid.css` exists → run M3, M4.
- No test file → skip M10.
- Same legacy favorites pattern as flex (`localStorage.gridFavorites`). Same handling.

Additional steps after M11 — same as Steps 5.1.1, 5.1.2, 5.1.3 with `flex` → `grid`.

- [ ] Steps M1–M11 + 5.1.1–5.1.3 for `grid`

### Task 5.3: Wave 5 verification

- [ ] **Step 5.3.1: Manual smoke flex/grid**

- Flex direction, justify, align changes update preview
- Grid template columns/rows
- Save preset → name it → reload page → preset is in favorites bar
- Click favorite → values restore

- [ ] **Step 5.3.2: Verify legacy migration with seeded data**

Pre-test: open the app, open DevTools console:
```js
localStorage.setItem('flexFavorites', JSON.stringify([{ name: 'Legacy 1', state: 'flexDir=column' }]));
location.reload();
```

After reload:
- Legacy key gone
- "Legacy 1" appears as a preset in flex tool

- [ ] **Step 5.3.3: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 5 (flex, grid + legacy migration) complete"
```

---

## Wave 6 — Shadow (split + migration)

### Task 6.1: Initial migration of `shadow`

Apply the **Tool migration template** with `T = shadow`.

**Tool-specific notes:**
- `js/modules/shadow.js` is **909 lines** — too large.
- Don't split yet in this task — first move it as-is, then split in Task 6.2.
- Has its own favorites system (`shadowFavorites`) — same pattern as flex/grid.

- [ ] Steps M1–M11 for `shadow` (no split yet)

### Task 6.2: Split `shadow.js` into sub-modules

**Files:**
- Create: `src/tools/shadow/sub/[multiple files]`
- Modify: `src/tools/shadow/shadow.js`

- [ ] **Step 6.2.1: Read `shadow.js` and identify logical sections**

Run:
```bash
wc -l src/tools/shadow/shadow.js
grep -n "^[[:space:]]*//.*\|^[[:space:]]*function\|^[[:space:]]*App\." src/tools/shadow/shadow.js | head -60
```

Identify the natural seams. Common seams in shadow tools:
- Layer management (single-layer vs multi-layer)
- Preset library (Material, Tailwind, etc.)
- Color/blur/spread input handling
- Code generation (CSS string output)
- Favorites (legacy)

- [ ] **Step 6.2.2: Create sub-module folder**

Run:
```bash
mkdir -p src/tools/shadow/sub
```

- [ ] **Step 6.2.3: Extract sub-modules**

Split into ≤400-line files. Suggested split (adjust based on actual seams found):

```
src/tools/shadow/
├── shadow.html
├── shadow.css
├── shadow.js              ← entry, wires submodules (~200 LOC)
└── sub/
    ├── layers.js          ← single + multi-layer state (~250 LOC)
    ├── presets.js         ← preset library (~200 LOC)
    ├── render.js          ← preview + code generation (~150 LOC)
    └── favorites.js       ← legacy favorites adapter → App.history (~100 LOC)
```

For each sub-module:
1. Cut its functions from `shadow.js`
2. Paste into `sub/[name].js`
3. Export the functions (`export function ...`)
4. Import them at top of `shadow.js`: `import { ... } from './sub/[name].js'`
5. Re-attach to `App.shadow` namespace in `shadow.js`

> **Important:** since the dev DOM uses `oninput="App.shadow.foo()"`, the functions must remain reachable via `App.shadow.foo`, not just as ES module exports.

Pattern in `shadow.js`:

```js
import './shadow.css';
import * as layers from './sub/layers.js';
import * as presets from './sub/presets.js';
import * as render from './sub/render.js';
import * as favorites from './sub/favorites.js';

window.App = window.App || { state: {} };
window.App.shadow = {
  ...layers,
  ...presets,
  ...render,
  ...favorites,
  init() {
    layers.init?.();
    presets.init?.();
    render.update?.();
    favorites.migrate?.();
  }
};
```

- [ ] **Step 6.2.4: Verify each sub-module is ≤ 400 lines**

Run:
```bash
wc -l src/tools/shadow/shadow.js src/tools/shadow/sub/*.js
```

Expected: every file ≤ 400 lines. If one exceeds, split further.

- [ ] **Step 6.2.5: Smoke test shadow**

Open shadow tool. Change all input types (offset, blur, spread, color, layer count). Switch to multi-layer mode. Apply a preset. Save a favorite. Verify CSS output matches pre-refactor.

- [ ] **Step 6.2.6: Migrate legacy `shadowFavorites` adapter**

Same pattern as flex/grid Step 5.1.1. Old custom UI → use auto-injected presets bar. The boot-time legacy migration in `core/history.js` already converts `shadowFavorites` → `devtools.presets.v1.shadow`. The tool just needs to drop its custom UI.

- [ ] **Step 6.2.7: Commit**

```bash
git add src/tools/shadow/
git commit -m "refactor(shadow): split 909-line module into sub/ files (≤400 LOC each)"
```

### Task 6.3: Wave 6 verification

- [ ] **Step 6.3.1: Verify all shadow features work**

Manual checklist:
- Single-layer shadow updates preview
- Multi-layer toggle works
- Each preset applies correctly
- Background color change updates preview
- Save preset → reload → load preset
- Legacy `shadowFavorites` migrated cleanly
- CSS output is identical to pre-refactor for the same inputs

- [ ] **Step 6.3.2: Run all tests**

Run: `npx vitest run`
Expected: 100% pass.

- [ ] **Step 6.3.3: Tag wave completion**

```bash
git commit --allow-empty -m "milestone: Wave 6 (shadow + split) complete"
```

---

## Final verification — Definition of Done

### Task 7.1: Integration smoke test suite

**Files:**
- Create: `tests/integration/smoke.test.js`

- [ ] **Step 7.1.1: Write integration smoke test**

Create `tests/integration/smoke.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

const TOOLS = ['clamp','ratio','flex','grid','shadow','gradient','filter','transform','blob','contrast','palette','converter','placeholder','metatags','keyframes','typescale','borderradius','scrollbar'];

beforeEach(() => {
  document.body.innerHTML = TOOLS.map(t => `<section id="section-${t}" class="tool-section" hidden></section>`).join('');
  TOOLS[0] && (document.getElementById('section-' + TOOLS[0]).className = 'tool-section active');
  localStorage.clear();
  window.App = { state: {} };
});

describe('integration smoke', () => {
  it('lazy module loads + history singleton both attach', async () => {
    const { installLazy } = await import('@/core/lazy.js');
    const { installHistory } = await import('@/core/history.js');
    installLazy();
    installHistory();
    expect(window.App.lazy).toBeDefined();
    expect(window.App.history).toBeDefined();
  });

  it('history savePreset+loadPreset roundtrip works', async () => {
    const { installHistory } = await import('@/core/history.js');
    const h = installHistory();
    window.App.foo = {
      _state: { a: '1' },
      serialize() { return new URLSearchParams(this._state).toString(); },
      deserialize(params) { this._state = Object.fromEntries(params); }
    };
    document.body.innerHTML += `<section id="section-foo"></section>`;
    window.App.urlState = { _currentTool: 'foo', _skipWrite: false, write: () => {}, applyGeneric: () => {}, collectGeneric: () => ({}) };
    const id = h.savePreset('foo', 'P');
    window.App.foo._state = { a: '2' };
    h.loadPreset('foo', id);
    expect(window.App.foo._state.a).toBe('1');
  });

  it('legacy flexFavorites migrates on init', async () => {
    localStorage.setItem('flexFavorites', JSON.stringify([{ name: 'Legacy', state: 'flexDir=row' }]));
    const { installHistory } = await import('@/core/history.js?ts=' + Date.now());
    const h = installHistory();
    expect(h.listPresets('flex').length).toBeGreaterThan(0);
    expect(localStorage.getItem('flexFavorites')).toBeNull();
  });
});
```

- [ ] **Step 7.1.2: Run integration tests**

Run: `npx vitest run tests/integration/smoke.test.js`
Expected: 3 tests pass.

- [ ] **Step 7.1.3: Commit**

```bash
git add tests/integration/smoke.test.js
git commit -m "test(integration): add smoke suite for lazy + history + legacy migration"
```

### Task 7.2: Coverage check

- [ ] **Step 7.2.1: Run coverage on src/core**

Run: `npm run coverage`
Expected: `src/core/lazy.js`, `src/core/history.js` ≥ 80% coverage. Open `coverage/index.html` to inspect.

If below 80%:
- Identify uncovered branches in the report
- Add tests in `tests/core/` to cover them
- Re-run coverage

- [ ] **Step 7.2.2: Commit any added tests**

```bash
git add tests/core/
git commit -m "test(core): expand coverage for lazy/history to ≥80%"
```

### Task 7.3: Build verification

- [ ] **Step 7.3.1: Production build**

Run: `npm run build`
Expected: `dist/` directory created, no errors. Output should include:
- `dist/index.html`
- `dist/assets/main-[hash].js`
- One chunk per tool: `dist/assets/[tool]-[hash].js`
- `dist/assets/[hash].css` for global + per-tool CSS

- [ ] **Step 7.3.2: Verify production preview**

Run: `npm run preview`
Open http://localhost:4173. Confirm site renders identically to dev mode.

- [ ] **Step 7.3.3: Verify lazy chunks**

Open DevTools → Network → JS tab. Click each tool. Confirm a separate `[tool]-[hash].js` chunk loads on first click and not again on second click.

- [ ] **Step 7.3.4: Verify file sizes**

Run:
```bash
wc -l index.html src/tools/shadow/shadow.js src/tools/shadow/sub/*.js
```

Expected:
- `index.html` ≤ 250 lines
- `src/tools/shadow/shadow.js` ≤ 400 lines
- Every file in `src/tools/shadow/sub/` ≤ 400 lines

### Task 7.4: Manual smoke checklist

**Files:**
- Create: `tests/manual-smoke.md`

- [ ] **Step 7.4.1: Create manual smoke checklist**

Create `tests/manual-smoke.md`:

```markdown
# Manual Smoke Checklist — Phase 1

Run after `npm run dev` (or against `npm run preview` for prod build).

## Boot
- [ ] Page loads with header, tabs, search, theme toggle
- [ ] No console errors
- [ ] Loader overlay disappears within 2s

## Per-tool smoke (×18)
For each tool: clamp, ratio, flex, grid, shadow, gradient, filter, transform, blob, contrast, palette, converter, placeholder, metatags, keyframes, typescale, borderradius, scrollbar:

- [ ] Tab click loads tool (Network tab shows tool's JS chunk fetched once)
- [ ] Switch back to another tool and back: no second fetch (cached)
- [ ] Change 3 distinct inputs — preview updates
- [ ] Click "Copy" → paste in editor → CSS output matches expected format
- [ ] URL hash updates with current state
- [ ] Reload page with hash — state is restored
- [ ] Presets bar (auto-injected) is visible at the bottom of the tool

## App.history features (test on any 3 tools)
- [ ] Click ↶ undo — previous state restored
- [ ] Click ↷ redo — re-applies
- [ ] "Save preset..." → enter name → preset saved
- [ ] Toggle favorite (mark a preset) → appears as ⭐ chip in bar
- [ ] Click favorite chip → state restored

## Theme & UX
- [ ] Theme toggle switches all tools (verify on 3 different tools)
- [ ] Search "shad" → suggests Shadow → click → opens
- [ ] Mobile: open hamburger menu, tap a tool, drawer closes
- [ ] Keyboard: Tab through inputs in a tool, no traps

## Legacy migration
- [ ] Pre-seed: in console run `localStorage.setItem('flexFavorites', JSON.stringify([{ name: 'X', state: 'flexDir=row' }])); location.reload();`
- [ ] After reload: flex tool's presets bar shows "X" preset
- [ ] localStorage no longer contains `flexFavorites`

## Production build
- [ ] `npm run build` succeeds
- [ ] `dist/` is deployable as static site
- [ ] Open `dist/index.html` via `npm run preview` → identical to dev
```

- [ ] **Step 7.4.2: Run through the manual checklist**

Execute all items. Mark each `[x]`.

- [ ] **Step 7.4.3: Commit**

```bash
git add tests/manual-smoke.md
git commit -m "docs: add manual smoke checklist for Phase 1"
```

### Task 7.5: Definition of Done sign-off

- [ ] **Step 7.5.1: Verify each DoD criterion**

| # | Criterion | Verification cmd |
|---|-----------|------------------|
| 1 | `npm run dev` levanta con HMR | manual |
| 2 | `npm run build` produce `dist/` | manual |
| 3 | `index.html` ≤ 250 líneas | `wc -l index.html` |
| 4 | 18 tools en `src/tools/` | `ls src/tools/ | wc -l` → 18 |
| 5 | shadow split ≤400 LOC/file | `wc -l src/tools/shadow/**/*.js` |
| 6 | Lazy chunks separados | DevTools Network |
| 7 | undo/redo funciona | manual checklist |
| 8 | savePreset/loadPreset persiste | manual checklist |
| 9 | Migración legacy sin pérdida | manual checklist |
| 10 | URL hash deep linking | tests/urlstate.test.js pass |
| 11 | `vitest run` pasa 100% | `npx vitest run` |
| 12 | Coverage core ≥ 80% | `npm run coverage` |
| 13 | Manual smoke completado | manual checklist |
| 14 | Theme/search/mobile funcionan | manual checklist |
| 15 | `scripts/fingerprint.py` removido | `! [ -f scripts/fingerprint.py ]` |

- [ ] **Step 7.5.2: Commit Phase 1 completion marker**

```bash
git commit --allow-empty -m "milestone: Phase 1 (foundations) complete — DoD verified"
```

- [ ] **Step 7.5.3: Notify the user (do not push or merge)**

Output a summary to the user:

> Phase 1 complete on branch `refactor/fase-1-foundations`. All 15 DoD criteria verified. Ready for your review before merging to `main`.

---

## Self-Review

**1. Spec coverage:**

Spec sections checked against this plan:
- ✅ S1 (Vite + structure) → Tasks 0.1–0.4
- ✅ S2 (Templates + Lazy-Load) → Tasks 0.5–0.6 + Tool migration template
- ✅ S3 (App.history) → Tasks 0.7–0.9
- ✅ S4 Wave 0 setup → Tasks 0.10–0.14
- ✅ S4 Waves 1–6 → Tasks 1–6
- ✅ S4 Tests strategy → Tasks 0.5, 0.7, 7.1, 7.2
- ✅ S4 DoD → Task 7.5
- ✅ S4 Manual smoke → Task 7.4
- ✅ S4 Risks/mitigations → addressed inline (initial tool preload in 0.11; loader >100ms not strictly enforced but documented; branch isolation in 0.0.1)
- ✅ Out-of-scope items not present in plan (Command Palette, atajos, multi-format copy, snapshot, etc.) — confirmed absent

**2. Placeholder scan:**

Checked for "TBD", "TODO", "implement later", "fill in details", "add appropriate error handling", "similar to Task N", "write tests for the above" — none found. The "Tool migration template" is repeated only in reference form within each Wave task; the steps are fully specified.

**3. Type/method consistency:**

- `App.lazy.load(tool)`, `App.lazy.preload(tool)`, `App.lazy.isLoaded(tool)` — consistent across 0.6.1, 0.11.1, M8.
- `App.history.{capture, undo, redo, canUndo, canRedo, savePreset, loadPreset, deletePreset, renamePreset, listPresets, toggleFavorite, isFavorite, listFavorites, exportAll, importAll, init}` — same set across 0.7, 0.8, 0.9, 7.1.
- `App.core.colorHistory` (renamed) — consistent across 0.4.3, 0.11.1.
- localStorage keys: `devtools.presets.v1`, `devtools.favorites.v1` — consistent across 0.7, 0.8, 5.1.2, 7.1.1.
- Section IDs: `section-[tool]` — consistent.
- Tool key vs section id: `blob` is the consistent key both for section id and folder/file naming after Task 4.3 (Option A applied).

**4. Inferred but unstated:**

- The plan assumes `js/modules/[tool].js` exists for each tool. Verified against listing (18 modules).
- The plan assumes `tests/setup.js` exists. Verified.
- The plan does NOT migrate `js/utils/` if it doesn't exist as a directory. The `git mv` in 0.4.1 uses `[ -f ... ] && git mv ... || true` to handle that gracefully.
