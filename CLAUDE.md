# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DevTools Suite** — a single-page, vanilla JS/HTML/CSS collection of CSS/frontend tools. No build system, no framework, no package manager. Open `index.html` directly in a browser.

**Tools available:** Clamp, Ratio, Flexbox, Grid, Shadow, Gradient, Filters, Transform, Shape/Blob, Contrast, Palette, Converter, Image Placeholder, Meta Tags.

## Development

No build step. Open `index.html` in a browser, edit files, refresh. All CSS variables are in `css/variables.css` (light and dark theme tokens).

### Cache busting

After editing any CSS or JS file, run the fingerprint script to update `?v=` query params in `index.html`:

```bash
python3 scripts/fingerprint.py
```

## Architecture

### Module pattern

All code lives under a single global `window.App` object, initialized in `js/app.js`:

```
window.App = { state: { ... } }   ← js/app.js  (global state + entry point)
App.core   = { ... }              ← js/core/core.js  (theme, tabs, search, modal, history)
App.utils  = { ... }              ← js/utils/utils.js  (color math, clipboard helpers)
App.[tool] = { ... }              ← js/modules/[tool].js  (one file per tool)
```

`js/main.js` runs `App.init()` on `DOMContentLoaded` and re-exports all public methods onto `window.*` for use in HTML `onclick`/`oninput` handlers.

### Adding a new tool

1. Create `js/modules/newtool.js` — attach as `App.newtool = { ... }`.
2. Register it in `App.core.toolsList` (in `js/core/core.js`) so search works.
3. Call `App.newtool.init()` (or equivalent) inside `App.core.switchTab` for the tool's tab ID.
4. Add the tab button and `<div id="section-newtool" class="tool-section">` in `index.html`.
5. Add `<script src="js/modules/newtool.js">` before `js/main.js` in `index.html`.
6. Run `python3 scripts/fingerprint.py`.

### CSS

- `css/variables.css` — all design tokens (colors, shadows, etc.) for both themes.
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
