# Design systems: detection and conventions

Checked 2026-10-25 against each library's documentation; latest versions are from the npm registry that day. Read the current docs for the version the project actually has (check its lockfile) before writing code: these libraries change their theming APIs between major versions.

Contents: 1. Detection · 2. shadcn/ui · 3. Material UI · 4. Ant Design · 5. Chakra UI · 6. Mantine · 7. Unstyled primitives · 8. Tailwind without a library · 9. Discovering tokens in an undocumented codebase

## 1. Detection

Look in this order: dependency manifest and lockfile, configuration files, the source tree.

| Signal | System | Latest on npm (2026-10-25) |
|---|---|---|
| `components.json` at the root; `components/ui/` directory; `cn` helper; `class-variance-authority` | shadcn/ui (CLI package `shadcn`) | `shadcn` 4.22.1 |
| `@radix-ui/*` or `radix-ui` | Radix Primitives (often under shadcn/ui) | `radix-ui` 1.8.1 |
| `@base-ui/react` | Base UI (shadcn/ui can generate on it) | 1.9.0 |
| `react-aria-components` | React Aria (shadcn/ui can generate on it) | 1.22.1 |
| `@mui/material`, `@emotion/react` | Material UI | 9.5.0 |
| `antd` | Ant Design | 6.6.7 |
| `@chakra-ui/react` | Chakra UI | 3.37.0 |
| `@mantine/core` | Mantine | 9.7.3 |
| `@headlessui/react` | Headless UI (with Tailwind) | 2.2.10 |
| `primereact` | PrimeReact | 11.2.2 |
| `tailwindcss` only | Tailwind without a component library | 4.3.3 |
| A `tokens/` folder, `*.tokens.json`, a `theme.ts`, CSS custom properties on `:root` | In-house tokens | n/a |
| `*.stories.tsx` | Storybook catalogue of in-house components | n/a |

Several can coexist (shadcn/ui on Radix on Tailwind). Record the full stack.

## 2. shadcn/ui

Source: https://ui.shadcn.com/docs/components-json · https://ui.shadcn.com/docs/theming · https://ui.shadcn.com/docs/cli

- Components are copied into the project as source and owned by it; `components.json` tells the CLI where they go (`aliases`), which style, and how Tailwind is set up. For Tailwind v4, `tailwind.config` is left blank.
- `init` installs dependencies, adds the `cn` util and configures CSS variables; `--base` selects the primitive library (`base`, `radix` or `aria`). `add <component>` adds components; `--dry-run`, `--diff` and `--view` preview changes.
- Theming: semantic CSS variables in `:root` and `.dark` (`background`/`foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1`...`chart-5`), used through utilities such as `bg-primary text-primary-foreground`.
- `style`, `tailwind.baseColor` and `tailwind.cssVariables` cannot be changed after init.

Conventions: add missing components with the CLI (`npx shadcn@latest add <name>`, or the project's package runner) before writing your own; compose application components from `components/ui` primitives; merge classes with `cn()`; define variants with `cva()`; theme through the CSS variables, not by editing every component.

## 3. Material UI

Source: https://mui.com/material-ui/customization/theming/ · https://mui.com/material-ui/customization/theme-components/

- `createTheme()` builds the theme; `ThemeProvider` injects it. Main keys: `palette`, `typography`, `spacing`, `breakpoints`, `zIndex`, `transitions`, `components`.
- `theme.components.<MuiName>.defaultProps` changes default props app-wide; `styleOverrides` with slot keys (`root` and others) changes default styles; the theme also defines `variants`.
- Custom theme keys need TypeScript module augmentation of `Theme` and `ThemeOptions`.
- One-off styling uses the `sx` prop or `styled()`.

Conventions: global look in the theme; per-instance tweaks in `sx`; heavy customisation as a new component (the theme is not tree-shakable, according to the docs).

## 4. Ant Design

Source: https://ant.design/docs/react/customize-theme

- Theme through `ConfigProvider` with a `theme` prop: global design tokens in `theme.token` (seed tokens derive others), per-component tokens in `theme.components`, and preset algorithms `theme.defaultAlgorithm`, `theme.darkAlgorithm`, `theme.compactAlgorithm`.
- `ConfigProvider` does not reach static methods such as `message.xxx` and `Modal.xxx`; use `Modal.useModal` or the `App` component to get context-aware versions.
- The docs include a v5 to v6 migration guide; check which major the project uses.

Conventions: change tokens, not `.ant-*` class overrides; do not mix a second component library into an Ant project.

## 5. Chakra UI (v3)

Source: https://chakra-ui.com/docs/theming/overview · https://chakra-ui.com/docs/get-started/migration

- The theming system is built around the Panda CSS API: `defineConfig({ theme: { tokens, semanticTokens, recipes, slotRecipes, textStyles, layerStyles, ... } })`, then `createSystem(defaultConfig, config)`, then `<ChakraProvider value={system}>`.
- Config also sets `cssVarsRoot`, `cssVarsPrefix`, `globalCss` and `preflight`.
- The v3 migration guide replaces v2's `extendTheme` with `createSystem` and renames the provider's `theme` prop to `value`; v2 code does not match this API, so check the installed major version.

Conventions: component styling through recipes and slot recipes; colours through semantic tokens; style props for layout.

## 6. Mantine

Source: https://mantine.dev/theming/theme-object/ · https://mantine.dev/theming/mantine-provider/ · https://mantine.dev/styles/styles-api/

- `createTheme({...})` passed to `<MantineProvider theme={theme}>`, rendered once at the root; it injects CSS variables and manages the colour scheme.
- Theme keys include `colors` (each an array of at least ten shades), `primaryColor` (a key of `colors`), `primaryShade`, `fontFamily`, `headings`, `focusRing`, `autoContrast`.
- The Styles API styles inner elements by selector (`root`, `label`, `inner`...) through `classNames` and `styles`, on a component or in the theme with `Button.extend({...})` under `theme.components`.

Conventions: global defaults with `Component.extend` in the theme; inner-element styling through the Styles API, not descendant CSS selectors.

## 7. Unstyled primitives

| Library | URL | Note |
|---|---|---|
| Radix Primitives | https://www.radix-ui.com/primitives | Accessible, unstyled React primitives |
| Base UI | https://base-ui.com | Unstyled React components |
| React Aria | https://react-spectrum.adobe.com/react-aria/ | Adobe's accessible hooks and components (Apache-2.0) |
| Headless UI | https://headlessui.com | Unstyled components from Tailwind Labs |

These handle keyboard and ARIA behaviour; you supply all styling from tokens. Never re-implement focus management they already provide.

## 8. Tailwind without a component library

- Tokens live in `@theme` variables in the CSS entry file (Tailwind v4) or in `tailwind.config` (v3 and earlier). <!-- https://tailwindcss.com/docs/theme -->
- Use only theme-backed utilities; arbitrary values (`p-[13px]`) are a smell unless the codebase already uses them for that case.
- Extract repeated class lists into components, not `@apply` sprawl, unless the project already does otherwise.

## 9. Discovering tokens in an undocumented codebase

1. Search for CSS custom properties (`--`) and theme objects.
2. Count the most frequent colour, font-size, spacing, radius and shadow values in the styles.
3. Cluster near-duplicates (for example `#3b82f6` and `#3b83f6`) and propose a token for each cluster.
4. Show the user the proposed token set before replacing literals, and replace them in a separate change from feature work.
