---
name: new-component
description: Scaffold a new SolidJS component following this project's design system. Use whenever creating any new component, UI primitive, or feature component. Enforces CSS Modules styling, 56px/44px touch targets, lucide-solid icons, and ~/ import paths.
argument-hint: "<ComponentName> [ui|features]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---

Scaffold a new SolidJS component following this project's design conventions.

## Arguments
- `<ComponentName>` — PascalCase component name (required)
- `[ui|features]` — target directory (default: `features`)
  - `ui` → `src/components/ui/`
  - `features` → `src/components/features/`

## Steps

1. If arguments are missing, ask for the component name and type.

2. Check `src/components/ui/` for existing primitives to reuse (Button, Card, TextField, Dialog, DropdownMenu, etc.).
   - For `ui` type components: prefer using `solidui-cli` to add new primitives from the Kobalte/SolidUI registry rather than building from scratch. Only build manually if the primitive isn't available.

3. Generate the `.tsx` + `.module.css` file pair at the correct path.

### Design rules

- **Styling**: CSS Modules (`.module.css`) — no Tailwind utilities. Use `cx()` from `~/lib/utils` to combine classes.
- **Design tokens**: use `var(--color-primary)`, `var(--color-background)` etc. from `:root` (defined in `src/styles/global.css`). Never hardcode colors.
- **Imports**: use `~/` alias (never relative `../../`), icons from `lucide-solid`
- **Main CTA buttons**: `size="xl"` (56px height, `border-radius: 0.75rem`)
- **Icon / sub buttons**: at least 44px, use `size="icon"` or `variant="ghost"`
- **Focus rings**: `outline: 2px solid hsl(var(--color-ring) / 0.3)` — subtle, never heavy
- **Borders**: `border: 1px solid hsl(30 10% 88% / 0.3)` — always with reduced opacity
- **Card radius**: `border-radius: 0.75rem` as the base for containers
- **Hover + active**: include `:hover` and `:active { transform: scale(0.98); }` on interactive elements
- **Kobalte state**: use `[data-expanded]`, `[data-closed]`, `[data-highlighted]`, `[data-invalid]` attribute selectors in `.module.css`
- **Variants**: resolve via lookup object — `const variantClass = { default: styles.variantDefault, ... } as const`
- **Animations**: define `@keyframes` locally in the component's `.module.css`
- **No client-side JS in Astro pages** — all interactivity belongs in SolidJS components

### Component structure template

```tsx
import { type Component } from "solid-js";
// Add SolidJS primitives (createSignal, Show, For, etc.) as needed
import { cx } from "~/lib/utils";
import { Button } from "~/components/ui/button";
// Add other ~/components/ui/* imports as needed
// Add lucide-solid icons as needed
import styles from "./MyComponent.module.css";

type MyComponentProps = {
  class?: string;
  // Define props here
};

const MyComponent: Component<MyComponentProps> = (props) => {
  return (
    <div class={cx(styles.wrapper, props.class)}>
      {/* component content */}
    </div>
  );
};

export default MyComponent;
```

4. Create a test file stub alongside the component (e.g., `ItemCard.tsx` → `ItemCard.test.tsx`) following the project testing convention. Use `@solidjs/testing-library` for components in `features/` or `ui/`. Do not assert on CSS Modules class names — test behavior via roles and text.

5. Run `pnpm check` and fix any Biome lint/format errors before finishing.

6. Report the created file paths (component + module.css + test).
