# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DevTools Suite** — a single-page, vanilla JS/HTML/CSS collection of CSS/frontend tools. No build step and no framework: the app runs by opening `index.html` directly in a browser. npm is used only for the test suite and design-token tooling, not for bundling.

**Tools available:** Clamp, Ratio, Flexbox, Grid, Shadow, Gradient, Filters, Transform, Shape/Blob, Border Radius, Keyframes, Scrollbar, Type Scale, Contrast, Palette, Converter, Image Placeholder, Image→SVG, Meta Tags.

## Development

No build step for the app itself. Open `index.html` in a browser, edit files, refresh. All CSS variables are in `css/variables.css` (light and dark theme tokens).

### Testing

Tests run on Vitest in a jsdom environment (config: `vitest.config.js`). Test files live in `tests/**/*.test.js`; `tests/setup.js` is the shared harness.

```bash
npm test               # watch mode
npm run test:run       # single run (CI)
npm run test:ui        # Vitest UI
npm run coverage       # coverage report (covers js/utils, js/modules, js/core)
npx vitest run tests/clamp.test.js   # single test file
```

### Design tokens

`DESIGN.md` is the source of truth for the visual identity, consumed by `@google/design.md`:

```bash
npm run design:lint              # validate DESIGN.md
npm run design:export:tailwind   # → tokens.tailwind.json
npm run design:export:dtcg       # → tokens.dtcg.json (W3C DTCG format)
```

### Cache busting

After editing any CSS or JS file, run the fingerprint script to update `?v=` query params in `index.html`:

```bash
python3 scripts/fingerprint.py
```

## Architecture

### Module pattern

All code lives under a single global `window.App` object, initialized in `js/app.js`:

```
window.App  = { state: { ... } }   ← js/app.js  (global state + entry point)
App.core    = { ... }              ← js/core/core.js  (theme, tabs, search, modal, history)
App.urlState= { ... }              ← js/core/urlstate.js  (shareable state in URL hash)
App.utils   = { ... }              ← js/utils/utils.js  (color math, clipboard helpers)
App.[tool]  = { ... }              ← js/modules/[tool].js  (one file per tool)
```

`js/main.js` runs `App.init()` on `DOMContentLoaded` and re-exports all public methods onto `window.*` for use in HTML `onclick`/`oninput` handlers.

Third-party code is vendored, not installed: `js/lib/` holds external libraries (e.g. `imagetracer_v1.2.6.js`, used by the Image→SVG tool).

### URL state (shareable links)

`js/core/urlstate.js` serializes a tool's inputs into the URL hash (`#tool?key=value...`) so configurations are shareable/bookmarkable. It listens for `input`/`change` events on the active `.tool-section` (debounced ~250ms) and writes immediately on tab change via `App.urlState.onTabChange`. On load, `read()` restores the tool and its inputs from the hash. Set `_skipWrite` to suppress writes during programmatic updates.

### Adding a new tool

1. Create `js/modules/newtool.js` — attach as `App.newtool = { ... }`.
2. Register it in `App.core.toolsList` (in `js/core/core.js`) so search works.
3. Call `App.newtool.init()` (or equivalent) inside `App.core.switchTab` for the tool's tab ID.
4. Add the tab button and `<div id="section-newtool" class="tool-section">` in `index.html`.
5. Add `<script src="js/modules/newtool.js">` before `js/main.js` in `index.html`.
6. Add a `tests/newtool.test.js` covering its pure logic (color math, value formatting, etc.).
7. Run `python3 scripts/fingerprint.py`.

### CSS

- `css/variables.css` — all design tokens (colors, shadows, etc.) for both themes. The values mirror `DESIGN.md`; keep them in sync when changing the visual identity.
- `css/layout.css` — shell layout, tabs, header.
- `css/tools.css` — shared tool component styles.
- `css/metatags.css` — styles specific to the Meta Tags tool.

Per-tool styles that are large enough should get their own CSS file (as `metatags.css` does).

### State & persistence

- `App.state` holds runtime state.
- `localStorage` is used for theme preference (`theme`) and color history (`colorHistory`).
- Favorites (flex/grid/shadow) are also persisted via `localStorage`.

### Color pickers

`App.syncProPicker(prefix, value)` in `js/main.js` is the shared handler for all color inputs. Each tool registers its prefix (e.g. `"fg"`, `"bg"`, `"pal"`) so the helper knows which tool to re-render on color change.

### Modal system

`App.core.modal` provides promise-based `prompt()` and `confirm()` dialogs — use these instead of native `window.prompt`/`window.confirm`.
