# Design tokens

Format facts checked 2026-10-25 against the Design Tokens Community Group (DTCG) Format Module 2025.10, the Tailwind CSS theme documentation and the Style Dictionary site. The presets in section 5 are starting points chosen for this skill, not quotations from a standard; adjust them to the reference the user picked.

Contents: 1. What a token set must cover · 2. Three tiers · 3. Storing tokens · 4. Wiring tokens into code · 5. Presets by interface class · 6. Checks before building · 7. Governance

## 1. What a token set must cover

| Category | Define | Why |
|---|---|---|
| Colour | Neutral scale (about ten steps), one primary scale, optional accent, semantic status colours (success, warning, danger, info), and surface/foreground pairs | Stops per-component colour picking; makes dark mode possible |
| Typography | One or two families, a size scale (about 7 to 9 steps), weights in use (usually three or four), line heights, letter spacing for large sizes | Type carries most of the visual quality |
| Spacing | A base unit (4 px or 8 px) and a scale built from it | Consistent rhythm |
| Radius | none, small, medium, large, full | Consistent shapes |
| Shadow / elevation | Three or four levels | Elevation means something |
| Breakpoints | The project's breakpoints (Tailwind's defaults are 40, 48, 64, 80 and 96 rem, that is 640 to 1536 px) <!-- https://tailwindcss.com/docs/responsive-design --> | Responsive behaviour planned from the start |
| Z-index | Named layers: dropdown, sticky, overlay, modal, popover, toast | No z-index wars |
| Motion | Durations (fast, normal, slow) and easing curves | Consistent, purposeful movement |

## 2. Three tiers

1. **Primitive (reference) tokens**: the raw palette and scales. `color.blue.600`, `space.4`, `font.size.lg`.
2. **Semantic tokens**: purpose, not appearance. `color.surface`, `color.on-surface`, `color.primary`, `color.on-primary`, `color.border`, `color.focus-ring`, `color.danger`. Components use only these. Dark mode and themes re-map this tier.
3. **Component tokens (optional)**: `button.primary.background`, only when a component needs to vary independently.

shadcn/ui is a working example of the semantic tier: surface tokens pair with `-foreground` tokens (`primary` with `primary-foreground`, `muted` with `muted-foreground`), plus `border`, `input`, `ring`, `destructive` and `chart-1` to `chart-5`, overridden inside a `.dark` selector for dark mode. <!-- https://ui.shadcn.com/docs/theming -->

## 3. Storing tokens

The DTCG Format Module 2025.10 is a stable, final Community Group report (not a W3C Standard) for exchanging tokens between tools. <!-- https://www.designtokens.org/TR/2025.10/format/ -->

- Each token is an object with `$value` (required) and optional `$type`, `$description`, `$extensions`, `$deprecated`; groups can set `$type` for their children.
- References use curly braces: `"{color.blue.600}"`.
- Types include `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, and composites `strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography`.
- A `dimension` value is `{ "value": 16, "unit": "px" }` (units `px` or `rem`); a `color` value is an object with `colorSpace`, `components` and optional `hex` and `alpha`.
- Recommended file extension `.tokens` or `.tokens.json`; media type `application/design-tokens+json`.

```json
{
  "color": {
    "blue": {
      "600": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0.15, 0.39, 0.92], "hex": "#2563eb" } }
    },
    "primary": { "$type": "color", "$value": "{color.blue.600}", "$description": "High-emphasis actions" }
  },
  "space": {
    "4": { "$type": "dimension", "$value": { "value": 16, "unit": "px" } }
  },
  "duration": {
    "fast": { "$type": "duration", "$value": { "value": 150, "unit": "ms" } }
  }
}
```

Translation tools such as Style Dictionary convert DTCG files into CSS, JavaScript, iOS and Android outputs. <!-- https://styledictionary.com -->

A token file is worth it when tokens must reach more than one platform or come from a design tool. For a single web app, CSS custom properties (or Tailwind theme variables) are enough.

## 4. Wiring tokens into code

**Plain CSS.** Custom properties on `:root`, semantic overrides under a theme selector or `prefers-color-scheme`:

```css
:root {
  --color-surface: #ffffff;
  --color-on-surface: #111827;
  --color-primary: #2563eb;
  --color-on-primary: #ffffff;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-md: 0.5rem;
  --duration-fast: 150ms;
}
[data-theme="dark"] {
  --color-surface: #0b0f17;
  --color-on-surface: #e5e7eb;
}
```

**Tailwind CSS v4.** Theme variables declared with `@theme` create utilities: a `--color-*` variable produces `bg-*`, `text-*` and related utilities, `--font-*` font families, `--text-*` font sizes, `--breakpoint-*` responsive variants. Variables that should not become utilities stay on `:root`. `@theme` must be top-level, not nested in selectors or media queries. <!-- https://tailwindcss.com/docs/theme -->

```css
@import "tailwindcss";
@theme {
  --color-brand-600: oklch(0.55 0.2 260);
  --font-display: "Inter", sans-serif;
}
```

**Component libraries.** MUI, Ant Design, Chakra UI and Mantine each have their own theme object; put the tokens there instead of in a parallel CSS file. See `../../ui-engineering/references/design-systems.md`.

## 5. Presets by interface class

Starting points. Replace the colours with the chosen reference's palette; keep the structure.

| Class | Base unit and density | Type | Colour approach | Radius | Motion |
|---|---|---|---|---|---|
| SaaS app / dashboard | 4 px base; compact rows; 14 px body is common | One sans family; tabular figures for numbers | Mostly neutral surfaces, one primary, strong status colours | small to medium | fast (100-200 ms), minimal |
| Marketing / landing | 8 px base; generous section spacing | Display family for headings plus a body family; large heading sizes | Brand colour used sparingly for calls to action; high-quality imagery | medium to large | gentle entrance animations, reduced-motion fallback |
| E-commerce | 4 or 8 px; dense product grids | Highly legible sans; clear price hierarchy | Neutral backgrounds so product images carry colour; one action colour | small to medium | fast feedback on add-to-cart |
| Developer tool | 4 px; dense | Sans for UI, monospace for code | Often dark-first; high contrast; syntax colours as their own scale | small | minimal |
| Game UI | 8 px; large targets | Display face for titles, very legible face for HUD numbers | Dark scrims over art; strong accent for focus and selection | style-dependent | expressive but skippable; respect reduced motion |

## 6. Checks before building

- Every text/background pair in the semantic tier meets 4.5:1 (3:1 for large text); focus rings and control borders meet 3:1 against adjacent colours. Check both light and dark themes. <!-- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html -->
- The spacing scale covers the gaps you need without in-between values.
- The type scale has a clear step between body, subheading and heading.
- A focus-ring token exists and is visible on every surface colour.

## 7. Governance

- Components reference semantic tokens only; primitives are used only inside the token file.
- No raw hex, pixel or millisecond values in component code; lint for them where the stack allows.
- New tokens are added to the token source, never inlined "just once".
- Rename tokens with a deprecation step (`$deprecated` in DTCG files) rather than breaking consumers.
- When the project already has tokens, extend them; do not start a second set.
