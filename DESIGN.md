---
version: alpha
name: DevTools Suite
description: Apple-inspired visual identity for a vanilla JS collection of CSS/frontend tools. Two themes (light + dark) with iOS/macOS-style soft surfaces, rounded corners, and a single accent blue.
colors:
  primary: "#007AFF"
  secondary: "#8E8E93"
  background: "#F2F2F7"
  surface: "#FFFFFF"
  surface-alt: "#F2F2F7"
  text-primary: "#1C1C1E"
  text-secondary: "#8E8E93"
  border: "#E5E5EA"
  code-bg: "#1C1C1E"
  code-text: "#7BD7FF"
  success: "#34C759"
  danger: "#FF3B30"
  warning: "#FFCC00"
  track: "#D1D1D6"
typography:
  h1:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif'
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif'
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif'
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif'
    fontSize: 0.85rem
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif'
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "SF Mono, Consolas, monospace"
    fontSize: 0.85rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 100px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  badge-pass:
    backgroundColor: "{colors.success}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
  badge-fail:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs}"
---

## Overview

DevTools Suite is a single-page collection of CSS and frontend playground tools (Clamp, Ratio, Flexbox, Grid, Shadow, Gradient, Filters, Transform, Shape, Contrast, Palette, Converter, Image Placeholder, Meta Tags, Keyframes, Type Scale, Border Radius, Scrollbar). The visual language borrows from Apple's iOS/macOS system UI: soft neutral surfaces, generous rounded corners, a single saturated accent blue, and a strict light/dark dual theme.

The brand goal is **calm precision**: the chrome should disappear so the generated CSS, previews, and live values are the focal point.

## Colors

- **Primary `#007AFF`** is the iOS system blue — used only for active tabs, primary actions, focus rings, and links. It is **never** used for body text or large fills, to preserve its signal.
- **Surface `#FFFFFF`** sits on a slightly cooler **background `#F2F2F7`** so cards float without needing heavy shadows.
- **Text-secondary `#8E8E93`** must only appear on `surface` or `background` (contrast ≥ 4.5:1). Never on `code-bg`.
- **Success / Danger / Warning** are reserved for state feedback (Contrast pass/fail, validation, theme toggle icon). They are not part of the general illustration palette.
- The **dark theme** swaps surfaces to true black `#000000` and elevated `#1C1C1E`, matching macOS dark mode rather than a soft grey palette.

## Typography

The system font stack (`-apple-system, BlinkMacSystemFont, SF Pro Text`) is chosen so the suite renders pixel-identically to native macOS/iOS UI on Apple devices and falls back gracefully on Linux/Windows via `system-ui`. Code blocks use `SF Mono` — never a webfont — so paste-into-editor fidelity is preserved.

Type scale is intentionally compact (1rem body, 0.85rem secondary) because each tool surface is information-dense; line-height stays at 1.5 for body to keep generated CSS snippets readable.

## Layout

Spacing follows a 4 / 8 / 16 / 24 / 32 / 48 ramp. Card padding is `lg` (24px) on desktop. Tool grid uses `md` (16px) gaps.

## Elevation

Shadows are used sparingly: a single soft shadow `0 12px 40px rgba(0,0,0,0.08)` for cards in light mode, deepened to `0 12px 40px rgba(0,0,0,0.30)` in dark mode. Buttons and inputs are flat — elevation signals "tool surface", not interaction.

## Shapes

Rounded corners follow a 4 / 8 / 12 / 16 / 20 ramp. Pill (`100px`) is reserved for badges and segmented controls. Circle uses `50%` directly in CSS (no token).

## Components

- `card` is the canonical tool container — every tool section renders inside one.
- `button-primary` is the only filled button style. Secondary actions use ghost buttons with `border` color and `text-primary`.
- `badge-pass` / `badge-fail` are the WCAG verdict pills used by the Contrast tool and any other validator.

## Do's and Don'ts

**Do**

- Use `primary` only for active/interactive accents (tabs, focus, primary CTA).
- Pair `text-secondary` with `surface` or `background` only.
- Use the `bezier (0.34, 1.56, 0.64, 1)` overshoot curve for tab/modal entrances.

**Don't**

- Introduce a fourth surface tier — only `background`, `surface`, `code-bg`.
- Use webfonts. The system stack is intentional.
- Mix `success`/`danger` colors into general illustration; reserve them for state.
