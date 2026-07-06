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

2. Check `src/components/ui/` for existing primitives to reuse (Button, Card, TextField, Dialog, DropdownMenu, Toast, etc.).
   - For `ui` type components: build on `@kobalte/core` headless primitives, following the structure of the existing wrappers (e.g. `dialog.tsx`, `dropdown-menu.tsx`).

3. Generate the `.tsx` + `.module.css` file pair at the correct path, using kebab-case
   file names (e.g. `ItemCard` → `item-card.tsx` + `item-card.module.css`).

### Design rules

Follow `.claude/rules/frontend.md` (auto-loaded for `src/components/**`) — it covers styling (CSS Modules + design tokens), `~/` imports, touch targets, export conventions, and Kobalte state selectors. Do not restate those rules here.

### Component structure template (features)

```tsx
import { type Component } from "solid-js";
// Add SolidJS primitives (createSignal, Show, For, etc.) as needed
import { cx } from "~/client/utils";
import { Button } from "~/components/ui/Button";
// Add other ~/components/ui/* imports as needed
// Add lucide-solid icons as needed
import styles from "./my-component.module.css";

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

For `ui/` components, use a named export instead (`export { MyComponent }`).

4. Create a test file stub alongside the component (e.g., `item-card.tsx` → `item-card.test.tsx`) following the project testing convention. Use `@solidjs/testing-library` for components in `features/` or `ui/`. Do not assert on CSS Modules class names — test behavior via roles and text.

5. Run `pnpm check` and fix any Biome lint/format errors before finishing.

6. Report the created file paths (component + module.css + test).
