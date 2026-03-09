# GitHub README SVG Reference

Quick-reference for building professional SVG assets for GitHub READMEs. Every value here is extracted from production repositories (Scalar, LobeChat, Excalidraw) -- not invented.

---

## 1. GitHub SVG Constraints

GitHub renders SVGs as `<img>` tags, which strips most interactivity. Know what survives and what does not.

| Works | Does Not Work |
|---|---|
| CSS animations (`@keyframes`) | JavaScript (completely stripped) |
| `foreignObject` for HTML/CSS inside SVG | Hover/click states (no pointer events) |
| Inline `<style>` blocks | External stylesheets or images (blocked by CSP) |
| `<animate>` and `<animateTransform>` | `<script>` tags |
| CSS `@media (prefers-color-scheme)` | Interactive CSS (`:hover`, `:focus`) |

**Dimensions:**
- Maximum README content width: **830px**
- Always set explicit `width` and `height` on the root `<svg>` element
- Use `viewBox` for responsive scaling

**Dark/light mode switching:**
Use the `<picture>` element in your README to serve different SVGs:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="banner-light.svg">
  <img alt="Banner" src="banner-light.svg" width="830">
</picture>
```

Alternatively, use `@media (prefers-color-scheme)` inside the SVG itself -- but separate files give cleaner results.

---

## 2. Design System

### Color Palette -- Dark Mode

```
Background tiers:    #0f0f0f → #1a1a1a → #272727
Text hierarchy:      rgba(255,255,255,0.9) → rgba(255,255,255,0.62) → rgba(255,255,255,0.44)
Border:              rgba(255,255,255,0.1)

Semantic colors:
  Green   #00b848    (success, active, online)
  Red     #fe1d2c    (error, destructive, critical)
  Blue    #0099ff    (info, links, primary action)
  Orange  #dd922f    (warning, pending)
  Purple  #b090f8    (feature, premium, highlight)
```

### Color Palette -- Light Mode

```
Background tiers:    #ffffff → #f6f6f6 → #e7e7e7
Text hierarchy:      #000000 → #666666 → #8e8e8e
Border:              rgba(0,0,0,0.05)

Semantic colors:
  Green   #00a67d    (success, active, online)
  Red     #ef0006    (error, destructive, critical)
  Blue    #579dfb    (info, links, primary action)
  Orange  #fc8528    (warning, pending)
  Purple  #5203d1    (feature, premium, highlight)
```

### Typography

**Font stacks:**
- UI text: `'Segoe UI', system-ui, -apple-system, sans-serif`
- Code/terminal: `Monaco, Menlo, 'Courier New', monospace`

**Scale:**

| Role | Size | Weight |
|---|---|---|
| Hero title | 40-48px | 700 |
| Section heading (h2) | 20px | 700 |
| Body text | 14-16px | 400 |
| Labels, captions | 12-13px | 600 |
| Micro text, badges | 10-11px | 600 |

### Spacing (4px Grid)

All spacing values must be multiples of 4:

| Token | Value | Use |
|---|---|---|
| xs | 4px | Inline icon gaps |
| sm | 8px | Tight element spacing |
| md | 12px | Label-to-content gaps |
| base | 16px | Standard content padding |
| lg | 24px | Section internal padding |
| xl | 32px | Card padding, section gaps |
| 2xl | 48px | Major section separation |

**Border radius scale:**
- 2px -- small elements (badges, tags)
- 4px -- inputs, buttons
- 8px -- cards, panels
- 12px -- containers, modal frames

**Terminal window chrome:**
- Traffic light dots: 12px diameter
- Colors: `#ff5f56` (close), `#ffbd2e` (minimize), `#27c93f` (maximize)
- Dot spacing: 8px between centers
- Title bar height: 36-40px

---

## 3. Animation Patterns

**Master timing:**
- Primary loop duration: **10 seconds**, `infinite`
- Scene transitions: use `steps(1)` timing function (Scalar pattern -- instant scene cuts, no tweening)
- Loading bars / progress: `ease-in-out` (the only element that should tween smoothly)
- Typing animations: `steps(N)` where N = character count

**Rules:**
- Maximum 2-3 independent animations per SVG
- All content must be **visible by default** -- animations enhance, never reveal
- Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

**Scene transition pattern (from Scalar):**

```css
@keyframes scene-cycle {
  0%, 30%    { opacity: 1; }   /* Scene 1 visible */
  33%, 63%   { opacity: 0; }   /* Scene 1 hidden */
  66%, 96%   { opacity: 0; }   /* Scene 1 hidden */
  100%       { opacity: 1; }   /* Reset */
}
```

Each scene element gets the same keyframes with offset `animation-delay` values. Use `steps(1)` for instant cuts between scenes.

---

## 4. Professional vs Vibe-Coded Checklist

**Professional indicators:**
- Constrained palette: 2-3 accent colors + neutral scale
- Semantic color usage: green = success, red = error, blue = info
- 4px spacing grid with no exceptions
- System font stacks (no custom fonts -- they will not load in GitHub SVGs)
- Content-first design: shows real workflow, real data shapes
- Light and dark variants provided

**Amateur indicators (avoid all):**
- Rainbow gradients without communicative purpose
- Excessive glow, blur, or drop-shadow effects
- Animation that does not demonstrate a feature or workflow
- Inconsistent spacing between sibling elements
- Novelty effects (glitch text, matrix rain, particle systems) on serious developer tools
- Text that is decorative rather than informative

---

## 5. Common SVG Types for READMEs

| Type | Dimensions | Purpose | Key Technique |
|---|---|---|---|
| **Hero banner** | 830 x 400 | Brand identity + tagline + key visual | Static or single subtle animation |
| **Comparison chart** | 830 x 500 | Feature matrix, before/after | Fully static, scannable layout |
| **Pipeline diagram** | 830 x 280-450 | Architecture or data flow | Sequential step highlighting with `steps(1)` |
| **Terminal demo** | 830 x 500 | CLI output, command showcase | Dark terminal chrome + typing animation |
| **Feature showcase** | 830 x 400-600 | UI mockup with multiple views | Scene transitions (Scalar pattern) |

**SVG skeleton:**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="830" height="400" viewBox="0 0 830 400">
  <style>
    /* Design tokens here */
    /* Animations here */
    /* prefers-reduced-motion here */
  </style>

  <!-- Background -->
  <rect width="830" height="400" rx="12" fill="#0f0f0f"/>

  <!-- Content layers -->
  <foreignObject x="0" y="0" width="830" height="400">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <!-- HTML/CSS content via foreignObject -->
    </div>
  </foreignObject>
</svg>
```

---

## 6. References

| Repository | What to Study |
|---|---|
| **scalar/scalar** | Gold standard for animated UI mockups in README SVGs. Scene transitions, `steps(1)` timing, professional color palette. |
| **lobehub/lobe-chat** | Design-system-driven layout. Consistent token usage across all visual assets. |
| **excalidraw/excalidraw** | Minimal, identity-consistent branding. Proves that restraint outperforms complexity. |
| **Akshay090/svg-banners** | Animation technique library. Useful for learning specific CSS animation patterns inside SVGs. |
| **nbedos/termtosvg** | Terminal session recording rendered as SVG. Reference for terminal-style demo animations. |
