# DESIGN.md — Lost Items

> Design specification for the Lost Items event-venue lost-and-found manager.
> Covers color palette, typography, component styling, layout, and elevation — everything
> needed to build a staff-operated, glanceable, high-visibility item management UI.
>
> **Status note:** The brand, status, semantic, and surface/border tokens defined here (§2.1–2.5)
> are already implemented in `src/styles/global.css` with matching values. What's still missing
> from `global.css` are a handful of individually-named tokens this spec references but that
> aren't load-bearing for any current component: `--color-border-strong`, `--color-info`,
> the Foreground 800/600/200 gray-scale steps (§2.4), and `--font-mono` (§3.1). Add them if a
> future component needs them; there is no broad palette-alignment task pending.

---

## 1. Visual Theme & Atmosphere

- **Design principle**: Staff-first utility with zero friction. Items are the content. Every
  screen should answer one question instantly: "Is this item still here, or has it been returned?"
- **Density**: Moderate. Generous touch targets (56px CTA, 44px icon), clearly separated cards,
  no decorative text. Comments are short and scan fast.
- **Keywords**: High-visibility, calm-but-clear, status-first, content-first, minimal
- **Context**: Used in loud, busy event venues under varied lighting. Colors must read at a glance
  across the room, not just on a calibrated monitor.
- **Tone**: Near-black text (never pure `#000000`) gives a warm, approachable feel — borrowed from
  a warm reading-comfort principle — but status colors are deliberately vivid to override ambiguity.
- **Dark mode**: Out of current scope. All tokens are light-mode only.

---

## 2. Color Palette & Roles

### 2.1 Brand / Action

| Role | Value | Use |
|------|-------|-----|
| Primary (Trust Blue) | `hsl(214 90% 48%)` | CTA buttons, active nav indicator, links |
| Primary hover | `hsl(214 90% 42%)` | hover / pressed state |
| Primary subdued | `hsl(214 90% 96%)` | tinted backgrounds, selected rows, active list item |
| Primary foreground | `hsl(0 0% 100%)` | text / icons on primary surfaces |

Trust Blue was chosen for its "search / find" association and because it sits cleanly away from
the amber and green status colors with no perceptual conflict.

### 2.2 Status Colors — the centerpiece

The most important design decision in this palette. Two statuses must be instantly distinguishable
at a glance. Amber = attention needed; Green = resolved.

> **Data model note**: The current schema uses a binary `deletedAt` soft-delete column.
> The In Storage / Returned status concept defined here is the *target* visual system.
> The data model migration (e.g. adding a `status` enum column) is a separate implementation task.

#### In Storage

The item has been found and logged. Still held. Awaiting owner pickup.

| Token role | Value |
|------------|-------|
| Badge background | `hsl(38 92% 50%)` |
| Badge text | `hsl(28 45% 16%)` — **dark text**, not white (amber is too light for white to pass WCAG AA) |
| Subdued background (card tint) | `hsl(40 95% 93%)` |
| Text color on light background | `hsl(32 90% 34%)` |

#### Returned

The item has been handed back to its owner. Resolved / complete.

| Token role | Value |
|------------|-------|
| Badge background | `hsl(152 55% 42%)` |
| Badge text | `hsl(0 0% 100%)` — white |
| Subdued background (card tint) | `hsl(150 48% 93%)` |
| Text color on light background | `hsl(152 60% 28%)` |

#### Usage rules

- A Returned card is **not** grayed out or desaturated. It stays fully readable with a green tint.
  Grayscaling hides information staff may still need to scan.
- Never use red (`--color-destructive`) for "Returned". Red is reserved for destructive actions only.
- The In Storage / Returned distinction must be conveyed by **both color and text label** — never
  color alone (accessibility, color-blind users, glare conditions).

### 2.3 Semantic

| Role | Value | Use |
|------|-------|-----|
| Destructive | `hsl(4 70% 52%)` | Permanent delete button, danger dialogs |
| Destructive foreground | `hsl(0 0% 100%)` | Text on destructive surfaces |
| Destructive subdued | `hsl(4 70% 96%)` | Danger zone backgrounds |
| Info | `hsl(214 80% 50%)` | Informational toasts, non-critical alerts |
| Focus ring | `hsl(214 90% 48% / 0.4)` | `:focus-visible` outline on all interactive elements |

### 2.4 Neutral — Gray Scale

| Name | Value | Role |
|------|-------|------|
| Foreground 900 | `hsl(20 14% 12%)` | Body text — the main text color; never use pure `#000000` |
| Foreground 800 | `hsl(20 12% 18%)` | Strong labels, headings |
| Foreground 600 | `hsl(20 8% 38%)` | Secondary labels, captions |
| Foreground 400 | `hsl(20 8% 46%)` | Muted / placeholder text |
| Foreground 200 | `hsl(20 6% 65%)` | Disabled text |

Text secondary is expressed as an **opacity variant** of Foreground 900 — same hue, reduced
opacity — rather than a separate gray swatch:

```
Text secondary:  hsl(20 14% 12% / 0.66)
Text disabled:   hsl(20 14% 12% / 0.40)
```

### 2.5 Surfaces & Borders

| Role | Value | Note |
|------|-------|------|
| App background | `hsl(40 24% 96%)` | Page chrome, outer shell |
| Card / content background | `hsl(40 30% 99%)` | Item cards, panels, dialogs |
| Secondary surface | `hsl(40 16% 94%)` | Section backgrounds, input fill, muted areas |
| Border default | `hsl(30 12% 86%)` | Standard card / field borders |
| Border strong | `hsl(30 14% 78%)` | Emphasis borders, active input ring |
| Border weak / alpha | `hsl(30 12% 86% / 0.4)` | Blended edges, glassmorphism overlays |

Alpha variants for CSS:

```css
/* Add these to :root for blended borders and overlay effects */
--color-border-alpha-30: hsl(30 12% 86% / 0.3);
--color-border-alpha-40: hsl(30 12% 86% / 0.4);
--color-border-alpha-50: hsl(30 12% 86% / 0.5);
--color-background-alpha-85: hsl(40 30% 99% / 0.85);
--color-background-alpha-90: hsl(40 30% 99% / 0.9);
```

---

## 3. Typography Rules

### 3.1 Font Family

```css
/* Primary stack — already loaded via Fontsource variable packages */
--font-sans: "Inter Variable", "Noto Sans JP Variable", system-ui, sans-serif;

/* Monospace (code in debug views, IDs) */
--font-mono: ui-monospace, SFMono-Regular, Consolas, Menlo, monospace;
```

Both `Inter Variable` and `Noto Sans JP Variable` are loaded via `@fontsource-variable/*` packages
imported in `src/styles/global.css`. No additional web font requests are needed.

### 3.2 OpenType Features

```css
/* Applied globally on <body> — already in global.css */
font-feature-settings: "cv11", "ss01";
-webkit-font-smoothing: antialiased;

/* Headings only: proportional spacing for Japanese punctuation */
font-feature-settings: "cv11", "ss01", "palt";
```

`palt` (proportional alternate widths) is **heading-only**. Applying it to body text disrupts
line rhythm.

### 3.3 Type Scale

| Role | Size | Weight | Line Height | Use |
|------|------|--------|-------------|-----|
| Page title | 22px / 1.375rem | 700 | 1.3 | Dashboard heading, room name (h1) |
| Section heading | 16px / 1rem | 600 | 1.5 | Card grid label, form section (h2/h3) |
| Body / comment | 15px / 0.9375rem | 400 | 1.65 | Item comments — widest text block; prioritize readability |
| Label / badge | 12px / 0.75rem | 700 | 1 | Status badges, date overlays |
| Caption / meta | 11px / 0.6875rem | 500 | 1.4 | Timestamps, item IDs |
| Button (CTA) | 16px / 1rem | 600 | 1 | xl buttons |
| Input | 15px / 0.9375rem | 400 | 1 | Form fields (aligns with body) |

Heading `letter-spacing` rule: `0.04em` on page titles and section headings only.
Never apply `letter-spacing` to body text or button labels.

### 3.4 Line Breaking (Japanese)

```css
/* Global — already in global.css via box-sizing reset block */
word-wrap: break-word;
overflow-wrap: break-word;
```

Item comments entered by staff may contain Japanese. `break-word` prevents long unbroken strings
from overflowing the card boundary.

---

## 4. Component Stylings

### 4.1 Buttons

The button scale maps to use case. All sizes have `border-radius: 0.75rem`.

| Variant | Height | Min Width | Font | Use |
|---------|--------|-----------|------|-----|
| `xl` (CTA) | 56px | 200px | 16px / 600 | Primary action per screen: "Register Item", "Create Room" |
| `default` | 40px | — | 14px / 500 | Secondary actions, dialog confirm |
| `sm` | 32px | — | 13px / 500 | Inline actions, filter controls |
| `icon` | 44px | 44px | — | Edit, Delete, Restore icon buttons |

Touch-target rule: **CTA must be 56px** tall to allow confident finger-tap in a busy venue.
**Icon buttons must be 44px** minimum (44×44px) — never smaller.

### 4.2 Item Card — the core UI element

An item card shows a found object: photo, comment, status badge, and date.

```
┌─────────────────────────────────┐
│  [Photo or placeholder image]   │  ← 16:9 or 1:1 ratio, object-fit: cover
│                                 │
│  [Status Badge]  [Date Badge]   │  ← top-left + top-right absolute overlay
├─────────────────────────────────┤
│  Comment text (15px / 1.65lh)   │  ← 2-3 lines max; overflow: ellipsis
│  ── ── ── ── ── ── ── ── ──     │
│  [Icon actions: edit / delete]  │  ← right-aligned, 44px targets
└─────────────────────────────────┘
```

CSS reference values:

```css
.card {
  border-radius: 0.75rem;
  border: 1px solid var(--color-border-alpha-40);
  background-color: var(--color-card);
  box-shadow: var(--elevation-1);
  overflow: hidden;
}

/* In Storage — amber tint */
.cardInStorage {
  background-color: hsl(40 95% 93%);  /* status-in-storage-subdued */
  border-color: hsl(38 92% 50% / 0.3);
}

/* Returned — green tint */
.cardReturned {
  background-color: hsl(150 48% 93%);  /* status-returned-subdued */
  border-color: hsl(152 55% 42% / 0.25);
}
```

### 4.3 Status Badge

Sits at top-left of the item card (above the image overlay).

```css
.statusBadge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 0.75rem;   /* 12px */
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  line-height: 1.6;
}

.statusInStorage {
  background-color: hsl(38 92% 50%);
  color: hsl(28 45% 16%);  /* dark — amber requires dark text for WCAG AA */
}

.statusReturned {
  background-color: hsl(152 55% 42%);
  color: hsl(0 0% 100%);
}
```

### 4.4 Date Badge

Sits at top-right of the image overlay.

```css
.dateBadge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--color-background-alpha-90);
  color: var(--color-foreground);
  font-size: 0.6875rem;  /* 11px */
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  border: 1px solid var(--color-border-alpha-30);
  box-shadow: 0 1px 2px hsl(0 0% 0% / 0.1);
}
```

### 4.5 Forms

```
Height: 56px for all text inputs and selects (matches CTA button height; uniform rhythm)
Border radius: 0.75rem
Border: 1px solid var(--color-border)
Focus: border-color → --color-primary; outline: 2px solid var(--color-ring) [i.e. focus-ring token]
Font: 15px / 400 (matches body)
Placeholder: var(--color-muted-foreground)
```

File upload area (photo input, e.g. "Take Photo" / "Choose Photo"):
- Dashed border, 2px, `--color-primary` — **not** `--color-border`. `--color-border` on
  `--color-secondary` composites to roughly 1.2:1, far under the 3:1 WCAG 1.4.11 minimum for a
  UI component boundary; `--color-border-strong` only reaches ~1.5:1, still failing. `--color-primary`
  clears ~4:1 against a light-tinted fill and reads as a tappable action affordance rather than a
  passive placeholder, which fits these buttons better since they trigger an action immediately
  on tap (no actual drop target).
- Background: `--color-primary-subdued`
- Icon: `--color-primary`. Label text: `--color-foreground` (kept near-black rather than
  primary-colored, since primary-on-primary-subdued sits marginally under the 4.5:1 text
  contrast target even though it clears the 3:1 non-text minimum).
- Hover: border-color → `--color-primary-hover`
- This is a tap-to-act control, not a drop target — no drag-and-drop is implemented (mobile-first
  usage makes it low-value); a desktop-only drag-over affordance is a reasonable future addition
  but isn't required.

### 4.6 Navigation

```
Height: 56px (desktop and mobile — matches CTA height for visual grid alignment)
Background: var(--color-background) / 0.90 with backdrop-filter: blur(12px)
Border-bottom: 1px solid var(--color-border-alpha-40)
```

### 4.7 Dialog & Confirm Dialog

```
Overlay:   hsl(20 14% 12% / 0.5) backdrop
Panel:     background var(--color-card); border-radius 1rem; box-shadow var(--elevation-6)
Width:     min(calc(100vw - 2rem), 480px)
Padding:   1.5rem
```

Open / close animation uses `[data-expanded]` / `[data-closed]` Kobalte attribute selectors
with `@keyframes` defined locally in the component's `.module.css`.

### 4.8 Toast

```
Position: bottom-center, 1rem from bottom
Max width: min(calc(100vw - 2rem), 360px)
Border radius: 0.75rem
Success / info: background var(--color-card); border 1px solid var(--color-border)
Error: background var(--color-destructive); color var(--color-destructive-foreground)
```

---

## 5. Layout Principles

### 5.1 Content Widths

| Context | Max Width | Notes |
|---------|-----------|-------|
| Outer shell | 640px | Centered; single-column; mobile-first |
| Item card grid | 100% within shell | 1 column mobile; 2 columns ≥ 480px |
| Form fields | 100% within shell | Full-width up to shell max |
| Dialog | min(480px, 100vw − 2rem) | |

This is a utility app, not a reading platform. A 640px shell keeps the scanning flow tight.
(Note's 620px article width principle applies here by analogy — keep lines short.)

### 5.2 Spacing Scale

4px base. Common steps:

| Token | Value | px |
|-------|-------|-----|
| `space-1` | 0.25rem | 4px |
| `space-2` | 0.5rem | 8px |
| `space-3` | 0.75rem | 12px |
| `space-4` | 1rem | 16px |
| `space-6` | 1.5rem | 24px |
| `space-8` | 2rem | 32px |

Card inner padding: `1rem` (16px).  
Section gap (between card rows): `0.75rem` (12px).  
Page horizontal padding: `1rem` (16px) on mobile; `1.5rem` (24px) on ≥ 480px.

### 5.3 Item Card Grid

```css
.itemGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 480px) {
  .itemGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 6. Depth & Elevation

Three levels, dual-shadow (ambient + key):

| Token | Shadow | Use |
|-------|--------|-----|
| `--elevation-1` | `0 1px 3px 1px hsl(0 0% 0% / 0.10), 0 1px 2px 0 hsl(0 0% 0% / 0.16)` | Item cards, input fields |
| `--elevation-4` | `0 4px 8px 3px hsl(0 0% 0% / 0.10), 0 1px 3px 0 hsl(0 0% 0% / 0.16)` | Dropdown menus, popovers |
| `--elevation-6` | `0 6px 10px 4px hsl(0 0% 0% / 0.10), 0 2px 3px 0 hsl(0 0% 0% / 0.16)` | Modals, dialogs, sheets |

Hover overlay (subtle active-state feedback on interactive cards):

```css
.card:hover {
  /* Overlay approach — avoids re-specifying box-shadow */
  background-image: linear-gradient(hsl(20 14% 12% / 0.025), hsl(20 14% 12% / 0.025));
}
```

---

## 7. Do's and Don'ts

### Do

- **Use amber for In Storage** and **green for Returned** — consistently everywhere: badges, card
  tints, filter chips.
- **Use dark text on amber badges** — `hsl(28 45% 16%)`. White on amber fails WCAG AA; never use it.
- **Use white text on green badges** — confirmed WCAG AA at `hsl(152 55% 42%)`.
- **Keep Returned cards fully readable** — apply a green subdued tint but do not desaturate or
  reduce opacity. Staff may need to scan returned items for audit.
- **Use Trust Blue only for action** — buttons, links, active states. Never apply it as a status
  indicator.
- **Use near-black** `hsl(20 14% 12%)` for body text — never pure `#000000`. Near-black is softer
  on the eyes and harmonizes with the warm-toned background palette.
- **Express secondary text via opacity** — `hsl(20 14% 12% / 0.66)`, not a separate gray swatch.
  This keeps tints consistent if backgrounds change.
- **Use `:focus-visible` for focus rings** — `outline: 2px solid hsl(214 90% 48% / 0.4)`. Subtle
  enough not to disrupt design; visible enough for keyboard navigation.
- **Convey status via both color and text** — "In Storage" + amber; "Returned" + green. Never color alone.

### Don't

- **Don't use red for Returned** — `--color-destructive` is reserved for permanent delete.
  Using red for "Returned" creates false alarm.
- **Don't gray out Returned items** — `opacity: 0.5; filter: grayscale(1)` hides information.
  Use the green subdued tint instead.
- **Don't use pure `#000000` for text** — too harsh; breaks the warm-neutral palette.
- **Don't put letter-spacing on body text or buttons** — `0.04em` is heading-only.
- **Don't add status meaning to the primary blue** — Trust Blue is action / nav only, not a third
  status color.
- **Don't make CTA buttons smaller than 56px** — mandatory for event-venue finger-tap accuracy.
- **Don't make icon buttons smaller than 44×44px** — minimum touch target; applies to edit,
  delete, and restore icon buttons.
- **Don't hardcode raw HSL literals in component CSS** — reference `var(--color-*)` tokens so
  palette changes propagate from one place.

---

## 8. Responsive Behavior

### 8.1 Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| Base (mobile) | — | Default; single-column, full-width cards |
| SM | 480px | 2-column item grid begins |
| MD | 768px | Navigation may expand; side padding increases |
| LG | 1024px | Content shell remains at 640px max; extra space is margin |

This is a mobile-first app. The SM breakpoint (480px) is the most important threshold.

### 8.2 Touch Targets

| Element | Min Height | Min Width |
|---------|-----------|-----------|
| CTA button (`xl`) | 56px | 200px |
| Standard button (`default`) | 40px | 40px |
| Icon button (`icon`) | 44px | 44px |
| Input / select | 56px | — |
| Navigation items | 44px | 44px |

All interactive elements must meet **44×44px minimum** at all breakpoints.

### 8.3 Dark Mode

Out of current scope. All tokens are defined for light mode only. When added, all
`--color-*` custom properties should switch via `@media (prefers-color-scheme: dark)` or a
`.theme-dark` class, with no changes to component markup.

---

## 9. Agent Prompt Guide

### Quick Reference

```
=== BRAND ===
Primary (Trust Blue):   hsl(214 90% 48%)   ≈ #0d7de6
Primary hover:          hsl(214 90% 42%)
Primary subdued:        hsl(214 90% 96%)
Primary foreground:     hsl(0 0% 100%)

=== STATUS ===
In Storage badge bg:    hsl(38 92% 50%)    ≈ #f5a20d   (amber)
In Storage badge text:  hsl(28 45% 16%)              ← dark text, NOT white
In Storage card tint:   hsl(40 95% 93%)
In Storage text-on-bg:  hsl(32 90% 34%)

Returned badge bg:      hsl(152 55% 42%)   ≈ #309e6a   (green)
Returned badge text:    hsl(0 0% 100%)               ← white
Returned card tint:     hsl(150 48% 93%)
Returned text-on-bg:    hsl(152 60% 28%)

=== SEMANTIC ===
Destructive:            hsl(4 70% 52%)     ← permanent delete only
Focus ring:             hsl(214 90% 48% / 0.4)

=== NEUTRAL ===
Text primary:           hsl(20 14% 12%)    ← near-black, never #000
Text secondary:         hsl(20 14% 12% / 0.66)
Text muted:             hsl(20 8% 46%)
Background:             hsl(40 30% 99%)    ← warm white card surface
App background:         hsl(40 24% 96%)    ← page chrome
Border:                 hsl(30 12% 86%)
Muted surface:          hsl(40 16% 94%)

=== TYPOGRAPHY ===
Font: "Inter Variable", "Noto Sans JP Variable", system-ui, sans-serif
Body:        15px / weight 400 / line-height 1.65
Heading:     22px / weight 700 / letter-spacing 0.04em / font-feature-settings "cv11","ss01","palt"
Section:     16px / weight 600 / letter-spacing 0.04em
Badge/label: 12px / weight 700
Caption:     11px / weight 500

=== LAYOUT ===
Shell max-width: 640px (centered)
Card border-radius: 0.75rem
Card inner padding: 1rem
Touch target — CTA: 56px height min | Icon button: 44×44px min
Item grid: 1 col mobile → 2 col ≥ 480px
```

### Example Prompt

```
Build the item list screen for the lost-items app following DESIGN.md.

Palette:
- Background: hsl(40 30% 99%)  App bg: hsl(40 24% 96%)
- Text: hsl(20 14% 12%)        Text secondary: hsl(20 14% 12% / 0.66)
- Primary (CTA): hsl(214 90% 48%)  Primary fg: hsl(0 0% 100%)
- In Storage badge: bg hsl(38 92% 50%) / text hsl(28 45% 16%) [dark!]
- Returned badge: bg hsl(152 55% 42%) / text hsl(0 0% 100%)
- Destructive: hsl(4 70% 52%)  Border: hsl(30 12% 86%)

Typography:
- Font: "Inter Variable", "Noto Sans JP Variable", system-ui, sans-serif
- Body 15px / 400 / lh 1.65    Badge 12px / 700
- Headings: letter-spacing 0.04em + font-feature-settings "cv11","ss01","palt"

Components:
- Item card: border-radius 0.75rem; image top; status badge absolute top-left; date badge top-right
- Status badge: amber (In Storage) or green (Returned) — never gray-out Returned items
- Icon buttons: 44×44px minimum touch target
- CTA: 56px height, border-radius 0.75rem

Layout: 640px max-width, centered; 2-col grid ≥ 480px; gap 0.75rem; card padding 1rem
Shadow: 0 1px 3px 1px hsl(0 0% 0% / 0.10), 0 1px 2px 0 hsl(0 0% 0% / 0.16)
```
