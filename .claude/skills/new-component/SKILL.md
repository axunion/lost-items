---
name: new-component
description: Scaffold a new SolidJS component following this project's design system. Use whenever creating any new component, UI primitive, or feature component. Enforces button sizes (h-14/h-11 touch targets), ring styles, border opacity, lucide-solid icons, and ~/ import paths.
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

3. Generate the `.tsx` file at the correct path. Replace `ComponentName` throughout with the actual PascalCase name provided.

### Design rules

- **Imports**: use `~/` alias (never relative `../../`), icons from `lucide-solid`
- **Main CTA buttons**: `size="xl"` (`h-14 px-8 rounded-xl text-lg font-bold`)
- **Icon / sub buttons**: at least `h-11`, use `size="icon"` or `variant="ghost"`
- **Focus rings**: `focus-visible:ring-1 focus-visible:ring-ring/40` — never `ring-2` or stronger
- **Borders**: `border-border/50` — always with reduced opacity
- **Card radius**: `rounded-xl` as the base for containers
- **Hover + active**: include `hover:` and `active:scale-[0.98]` (or `active:scale-90`) on interactive elements
- **No client-side JS in Astro pages** — all interactivity belongs in SolidJS components

### Component structure template

```tsx
import { type Component } from "solid-js";
// Add SolidJS primitives (createSignal, Show, For, etc.) as needed
import { Button } from "~/components/ui/button";
// Add other ~/components/ui/* imports as needed
// Add lucide-solid icons as needed

type MyComponentProps = {
  // Define props here
};

const MyComponent: Component<MyComponentProps> = (props) => {
  return (
    <div class="...">
      {/* component content */}
    </div>
  );
};

export default MyComponent;
```

4. Create a test file stub alongside the component (e.g., `ItemCard.tsx` → `ItemCard.test.tsx`) following the project testing convention. Use `@solidjs/testing-library` for components in `features/` or `ui/`.

5. Run `pnpm check` and fix any Biome lint/format errors before finishing.

6. Report the created file paths (component + test).
