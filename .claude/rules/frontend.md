---
description: Frontend guidelines, UI design system, and SolidJS component rules
globs:
  - src/components/**
  - src/pages/**
  - src/layouts/**
  - src/styles/**
---

# Frontend Guidelines

## 1. Design Aesthetics

Aim for premium, modern UI that delights users.
- **Premium quality**: Avoid plain primary colors; use refined palettes with tuned HSL values.
- **Depth and motion**: Use glassmorphism, subtle borders, appropriate shadows, and opacity to convey depth.
- **Styling subtlety**: Avoid overly strong rings or borders.
    - **Borders**: Use reduced opacity to blend naturally — e.g. `border: 1px solid hsl(30 10% 88% / 0.3)`.
    - **Focus rings**: Use `outline: 2px solid hsl(var(--color-ring) / 0.3)` for subtle feedback that doesn't disrupt the design.
- **Interactions**: Implement feedback for every user action via hover effects and micro-animations (e.g. scale-down on tap).
- **No placeholders**: When demos or previews are needed, create concrete visuals rather than placeholder content.

## 2. Implementation Architecture

Keep Astro and SolidJS responsibilities clearly separated.
- **Astro**: Handles routing, SSR, and static layouts (`src/pages`, `src/layouts`). Interactive JS on pages is forbidden — delegate to SolidJS.
- **SolidJS**: Handles all client-side dynamic logic, state management, and form processing.
- **Kobalte / SolidUI**: Used as the base for headless UI primitives and foundational components.
    - **Principle**: Use `solidui-cli` to add or refresh components, fully conforming to the official design standards (`PolymorphicProps` etc.). Minimize custom manual implementations.

## 3. Component Design and Splitting

Split components appropriately for maintainability and reusability.
- **UI components (`src/components/ui`)**:
    - Pure components focused on display and styling, with no business logic.
    - Each component consists of a `.tsx` + `.module.css` pair.
    - Use the `cx()` utility (`~/lib/utils`) to allow external `class` prop overrides.
- **Feature components (`src/components/features`)**:
    - Components with specific domain logic (API calls, state management, etc.).
    - **Appropriate splitting**: Split into sub-components to prevent file bloat and enforce separation of concerns.
- **Import paths**: Use the `~/` alias (e.g. `~/components/ui/button`).

## 4. Design Standards (Tokens)

- **CSS Custom Properties (Design Tokens)**:
    - All colors, spacing, etc. must use tokens defined in `:root {}` in `src/styles/global.css`.
    - Key tokens: `--color-primary`, `--color-background`, `--color-foreground`, `--color-border`, `--color-muted-foreground`, `--color-destructive`, `--color-accent`, `--color-secondary`, etc.
    - **Radius**: Use `border-radius: 0.75rem` (12px) as the base for cards and main elements.
- **Styling approach**:
    - **`.tsx` (SolidJS)**: Use CSS Modules (`.module.css`). Place alongside the component in the same directory.
    - **`.astro`**: Use Astro scoped `<style>` blocks.
    - **Variants**: Resolve via lookup object — e.g. `const variantClass = { default: styles.variantDefault, ... }`.
    - **Kobalte state styles**: Use attribute selectors like `[data-expanded]`, `[data-closed]`, `[data-highlighted]`, `[data-invalid]` directly in `.module.css`.
- **Mobile-first & touch targets**:
    - **Main actions**: Ensure `56px` height to prioritize finger operability.
    - **Icon buttons**: Edit/delete buttons must be `44px` or larger to prevent mis-taps.
- **Colors**:
    - **Background**: Base on `var(--color-background)` (warm beige tone).
    - **Accent**: Base on `var(--color-primary)`.
- **Icons**: Use `lucide-solid`.
- **UX and label simplicity**:
    - Communicate intuitively via visual **icons** and **minimal English words**.
    - Remove decorative explanatory text.

## 5. UI Component Standards

- **Button**:
    - **Main (Call to Action)**: Use `size="xl"` (56px height, `border-radius: 0.75rem`).
    - **Sub / Icon**: Use `size="icon"` or `variant="ghost"`, but ensure minimum 44px size for tap accessibility.
    - **Style overrides**: Pass a module class via the `class` prop; use the `style` prop (inline style) only when CSS cascade cannot resolve it.
- **Input / Form**:
    - Input fields also use 56px as the baseline height to align with buttons.
- **Animations**:
    - Define `@keyframes` locally in each component's `.module.css` for Dialog, DropdownMenu, and Toast animations.
    - Use Kobalte's `[data-expanded]` / `[data-closed]` attribute selectors to handle open/close transitions.

## 6. Quality and Verification Workflow

After adding or changing UI, always verify quality in this order:
1. **Lint check**: Run `pnpm check` (Biome) and confirm no warnings or errors.
2. **Type check**: Verify no TypeScript errors; avoid using `any`.
3. **Browser verification**: Check for layout breakage and confirm responsive behavior.
