# SVG Design Reference for GitHub READMEs

Research compiled from Scalar, LobeChat, Excalidraw, Cal.com, Supabase, Appwrite, Infisical, Charmbracelet, and svg-banners. Intended for redesigning four SVGs: hero banner, comparison chart, pipeline diagram, terminal demo.

---

## 1. GitHub SVG Rendering Constraints

### What Works
- SVG files referenced via `<img>` or `<picture>` render with full CSS animation support
- `<foreignObject>` inside SVG enables embedded HTML/CSS (the core technique)
- `<style>` tags inside SVG are preserved (GitHub strips them from raw Markdown)
- `@keyframes` animations run infinitely when SVG is loaded as image
- CSS custom properties (`--var-name`) are preserved
- `@media (prefers-color-scheme: dark/light)` works inside SVGs in Chrome/Firefox (NOT Safari)
- `data:` URIs work for embedded images/fonts (same-origin under CSP)
- Base64-encoded `@font-face` declarations work
- Flexbox and CSS Grid layout within foreignObject
- `transform`, `opacity`, `fill`, `stroke` animations all work
- `animation-timing-function: steps(1)` for discrete state changes
- `color-mix()` CSS function works

### What Does NOT Work
- External image URLs inside SVGs (blocked by CSP — different origin context)
- `<script>` tags (stripped)
- JavaScript of any kind
- `:hover` states (SVG rendered as static image, no interactivity)
- External font URLs (use base64-encoded fonts instead)
- `#gh-dark-mode-only` / `#gh-light-mode-only` URI fragments (deprecated by GitHub)
- `clip-path` and `mask` may be stripped as security measure
- Safari breaks `prefers-color-scheme` inside SVGs loaded via `<img>`
- Inline `<style>` or `<script>` in Markdown itself (GitHub strips them)

### Rendering Dimensions
- **GitHub repo README container**: 830px wide (max on desktop)
- **GitHub markdown view**: 1012px wide
- **VS Code markdown preview**: unlimited
- **VS Code extension view**: 882px
- **Glitch editor**: 612px
- **Recommended viewBox width**: 830px or 1360px (scale down via CSS)
- Most platforms scale oversized images down; vector SVGs remain crisp

### Dark/Light Mode (Recommended Approach)
```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="asset-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="asset-light.svg">
  <img alt="Description" src="asset-light.svg">
</picture>
```
Create TWO separate SVG files per visual (light + dark). This is the official GitHub-recommended approach and works across all browsers including Safari.

### XHTML Requirement
Content inside `<foreignObject>` must be valid XHTML:
- Self-closing tags: `<img />` not `<img>`
- Namespace: `<div xmlns="http://www.w3.org/1999/xhtml">`
- All tags must close properly

---

## 2. Reference: Scalar (scalar/scalar)

### Overview
The gold standard for animated README SVGs. They build full UI mockups as SVGs with animated state transitions, creating "living screenshots" that demonstrate product functionality.

**Source files**: `documentation/assets/` directory contains 20+ SVGs (animated + static, light + dark variants).

### SVG Architecture
```
viewBox="0 0 1360 765"
```
- 1360x765 canvas simulating a desktop browser window
- Single `<foreignObject width="100%" height="100%">` wrapping all HTML/CSS
- `preserveAspectRatio="xMidYMid meet"` for proportional scaling
- Entire interface is a CSS recreation — no raster images

### Color System (Light Mode)
```
--scalar-color-1:        #000000        (primary text)
--scalar-color-2:        #666666        (secondary text)
--scalar-color-3:        #8e8e8e        (tertiary text)
--scalar-color-disabled: #b4b1b1        (disabled state)
--scalar-color-accent:   #0099ff        (primary accent — links, active states)
--scalar-background-1:   #ffffff        (primary surface)
--scalar-background-2:   #f6f6f6        (secondary surface — panels, cards)
--scalar-background-3:   #e7e7e7        (tertiary — borders, dividers)
--scalar-color-green:    #00a67d        (success — GET methods)
--scalar-color-red:      #ef0006        (error — DELETE methods)
--scalar-color-blue:     #579dfb        (info — PUT methods)
--scalar-color-orange:   #fc8528        (warning — PATCH methods)
--scalar-color-purple:   #5203d1        (special — POST methods)
```

### Color System (Dark Mode)
```
--scalar-color-1:        rgba(255,255,255,0.9)    (primary text)
--scalar-color-2:        rgba(255,255,255,0.62)   (secondary text)
--scalar-color-3:        rgba(255,255,255,0.44)   (tertiary text)
--scalar-color-disabled: rgba(255,255,255,0.34)
--scalar-background-1:   #0f0f0f                  (primary surface)
--scalar-background-2:   #1a1a1a                  (secondary surface)
--scalar-background-3:   #272727                  (tertiary surface)
--scalar-border-color:   rgba(255,255,255,0.1)
--scalar-color-green:    #00b848
--scalar-color-red:      #fe1d2c
--scalar-color-blue:     #76aedf
--scalar-color-orange:   #dd922f
--scalar-color-purple:   #b090f8
```

### Typography
```
Primary:   "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Monospace: Monaco, Menlo, monospace
Sizes:     24px (h1) → 20px (h2) → 16px (h4) → 14px (small) → 13px (mini) → 12px (micro)
Weights:   700 (bold headings), 600 (semibold), 500 (medium labels), 400 (body)
```

### Animation Technique
- **Duration**: All animations use a 10-second infinite loop
- **Timing**: `steps(1)` for discrete state transitions (tab switches, content swaps)
- **Pattern**: Staggered keyframes create a sequential narrative:
  - 0-30%: State A visible (e.g., "Create User" endpoint)
  - 30-95%: State B visible (e.g., "Google Test" endpoint)
  - 95-100%: Transition back to State A
- **What's animated**: Tab labels, sidebar highlights, request/response content, loading bars, modal popups
- **Loading bars**: Use `ease-in-out` timing with `translateX(-100%)` to `translateX(0%)` — the only non-stepped animation
- **Popup modals**: Scale from 0.99 to 1.0 with translateY(10px) to 0 for subtle entrance
- **Safari fallback**: `@supports` rule disables animations on Apple devices, applies static scaling

### Layout Values
```
Sidebar width:     280px
Container padding: 11px, 9px, 10px (variable by context)
Gap spacing:       6px between elements
Icon size:         14x14px to 16x16px
Border radius:     8px (cards), 4px (inputs), 2px (small elements)
Max height:        713px (rounded containers)
```

### What Makes It Professional
- Pixel-perfect UI mockup, not a cartoon or diagram
- Animated narrative showing real product workflows
- Semantic color system (green=success, red=error, blue=info)
- Consistent spacing rhythm (multiples of 4px)
- Full dark mode variant with proper contrast ratios
- Uses `color-mix()` for hover state blending
- Browser chrome frame adds realism

---

## 3. Reference: LobeChat (lobehub/lobe-chat)

### Overview
Modern, design-system-driven README. Uses large embedded screenshots rather than SVGs for feature demos, but the layout and badge system are exemplary.

### Visual Hierarchy Pattern
1. Centered hero banner (full-width image)
2. Badge row (shields.io) with branded colors
3. One-line tagline in heading
4. Feature screenshots in expandable `<details>` sections
5. "Back to top" navigation badges between sections

### Badge Color Palette
```
#5865F2   Discord blue
#369eff   Bright cyan (primary brand)
#c4f042   Lime green (active/new)
#95f3d9   Mint (secondary)
#ff80eb   Pink (social)
#ffcb47   Gold (star/highlight)
```

### Layout Techniques
- `<div align="center">` for hero sections
- Collapsible `<details>` with `<kbd>` styled headers to reduce cognitive load
- Table-based layouts for provider/plugin listings
- Emoji prefixes for section headers (visual scanning anchors)
- Strategic whitespace between major sections

### Design Principles
- Balances text-heavy content with large, strategically placed imagery
- Progressive disclosure — core value prop first, deep features in collapsibles
- Consistent information density across sections
- Every feature gets a full-width screenshot, not just a bullet point

---

## 4. Reference: Excalidraw (excalidraw/excalidraw)

### Overview
Clean, minimal approach. Hand-drawn aesthetic matches the product identity.

### Dark/Light Mode
```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="excalidraw_github_cover_2_dark.png">
  <img alt="Excalidraw" src="excalidraw_github_cover_2.png">
</picture>
```

### Visual Composition
- Centered logo/banner at top
- Navigation links with pipe separators
- Feature list using emoji prefixes
- Sponsor avatars as circular 120px images
- Footer company logos (Vercel, Sentry, Crowdin)
- Product showcase screenshot demonstrating hand-drawn diagrams

### What Makes It Work
- Visual identity is consistent — the README feels like the product
- Minimal chrome, maximum content
- Badges use consistent color: `738ad6` (purple) for Discord

---

## 5. Reference: Cal.com, Supabase, Appwrite, Infisical

### Cal.com
- Centered hero with logo image, not SVG
- Social proof badges clustered above fold (Product Hunt #1, Hacker News #1)
- `<picture>` elements for dark/light Product Hunt badges
- Color accents: `#DA552E` (Product Hunt orange), `#FF6600` (HN orange), `#AA00FF` (purple)
- RepoBeats SVG for activity visualization

### Supabase
- Dual-mode logo: `#gh-light-mode-only` and `#gh-dark-mode-only` (legacy approach)
- Architecture diagram as SVG (`supabase-architecture.svg`)
- Custom "Made with Supabase" badges (168x30px) in light and dark variants
- Table layout with `table-layout:fixed` and `white-space:nowrap`
- 40+ language translations listed

### Appwrite
- Primary banner as PNG, architecture diagram as `.drawio.svg`
- Integration logos: 50x39px SVGs in 3-column table (100x100px cells)
- Flat-square badge style throughout (`?style=flat-square`)
- Color: `#191120` (Hacktoberfest dark), `#00acee` (Twitter blue)
- No dark/light mode switching — design-neutral palette

### Infisical
- Dark mode logo: `logoname-white.svg#gh-dark-mode-only` at 300px width
- Full-width dashboard screenshot
- Flat badge style with color coding: blue (MIT), green (PRs), orange (downloads)
- Feature sections organized by product category (5 groups)

### Common Patterns Across All
- Centered hero alignment (`<p align="center">`)
- Shields.io badges for metrics (stars, license, downloads, CI status)
- Product screenshots as primary visual evidence
- Progressive information disclosure
- Clear CTAs linking to docs, demos, community

---

## 6. Reference: SVG Banner Techniques (Akshay090/svg-banners)

### Standard Canvas
```
viewBox="0 0 800 400"
```
All banner styles use 800x400px as the base canvas.

### Origin Style (Animated Gradient)
```css
/* Background: animated gradient sweep */
background: linear-gradient(-45deg, #fc5c7d, #6a82fb, #05dfd7);
background-size: 600% 400%;
animation: gradientBackground 10s infinite;

/* Typography */
h1 { font-size: 50px; text-transform: uppercase; letter-spacing: 5px; }
p  { font-size: 20px; }

/* Text shadow for depth */
text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb,
             0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1),
             0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3),
             0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25);

/* Subtle rotation oscillation */
animation: rotate 1s infinite;  /* 3deg to -3deg */

/* Fade-in for subtitle */
animation: fadeIn 5s;  /* opacity 0→1, visible at 66% */
```
Font: `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

### Glitch Style
```css
/* Three overlapping text layers */
Layer 1 (base):  color: #fff;    animation: glitch1 (skew transforms)
Layer 2 (cyan):  color: #67f3da; animation: glitch2 (translate -2 to -5px)
Layer 3 (red):   color: #f16f6f; animation: glitch3 (translate +2 to +5px)

/* Background */
background: #333;

/* Font */
font-family: "Lucida Console", Monaco, monospace;
font-size: 5em;
letter-spacing: 8px;

/* Timing: 2.5s infinite, triggers at 7%, 30%, 55%, 75% */
```

### Luminance Style
```css
/* Glowing text via radial gradient clipped to text */
background: radial-gradient(ellipse at bottom, #fff, transparent, transparent);
background-size: 50% 50%;
background-clip: text;
-webkit-background-clip: text;

/* Background */
background-color: #333641;

/* Reveal: letter-spacing expands over 3s, then glow pulses at 2.5s infinite */
text-shadow: 0 0 8px #fff;  /* at 40% keyframe */
```

### Typewriter Style
```css
/* Terminal dark background */
background: rgb(25, 25, 25);
color: rgba(255, 255, 255, 0.75);

/* Cursor */
border-right: 2px solid rgba(255, 255, 255, 0.75);

/* Reveal: width 0→100% in 4s using steps(44) — one per character */
/* Cursor blink: border-color toggles every 500ms */

white-space: nowrap;
overflow: hidden;
font-size: 180%;
```

---

## 7. Terminal Demo Techniques

### termtosvg
- Records real terminal sessions as standalone SVG animations
- Uses CSS `@keyframes` to replay character-by-character output
- Built-in themes: dracula, solarized_dark/light, ubuntu, putty, terminal_app
- Typical canvas: full terminal width, variable height
- Outputs self-contained SVG with embedded fonts

### Charmbracelet VHS
- Records terminal sessions as GIFs (not SVG natively)
- Scriptable via `.tape` files for reproducible demos
- 600px default width for embedded demos
- Supports theme customization via JSON color configs
- A fork adds native SVG output

### Hand-Crafted Terminal SVGs (Scalar approach)
- Build a fake terminal UI in HTML/CSS inside foreignObject
- Dark background: `rgb(25,25,25)` or `#0f0f0f`
- Monospace font: `Monaco, Menlo, monospace` at 13-14px
- Animate command output appearing via opacity keyframes
- Use `steps(1)` timing for discrete line reveals
- Add browser chrome (window title bar, traffic light buttons) for realism

---

## 8. Design Principles: Professional vs "Vibe Coded"

### What Makes It Professional

**Color**
- Constrained palette: 2-3 accent colors max, rest is neutrals
- Semantic meaning: green=success, red=error, blue=info, orange=warning
- Dark mode uses rgba with reduced opacity (0.9, 0.62, 0.44) instead of flat grays
- Background layers: 3 tiers max (#fff → #f6f6f6 → #e7e7e7 for light)

**Typography**
- System font stack (Inter preferred) — never Comic Sans, Papyrus, or novelty fonts
- Clear size hierarchy: 24px → 20px → 16px → 14px → 12px
- Weight hierarchy: 700 (titles) → 600 (labels) → 500 (emphasis) → 400 (body)
- Monospace for code only, never for body text
- Letter-spacing: 0 for body, 0.5-1px for small caps/labels

**Spacing**
- 4px base grid (all spacing in multiples of 4)
- Consistent padding: 8px, 12px, 16px, 24px, 32px
- Gap between elements: 4-8px
- Section spacing: 24-48px
- Border radius: 2px (small), 4px (inputs), 8px (cards), 12px (containers)

**Animation**
- Subtle, purposeful — animation tells a story, not just moves things
- 10s loops for complex narratives, 2-4s for simple effects
- `steps(1)` for content switching (tabs, states)
- `ease-in-out` only for loading bars and motion
- No bouncing, no spinning, no gratuitous particle effects
- `prefers-reduced-motion` respected where possible

**Composition**
- Content-first: the SVG shows the actual product/workflow, not abstract art
- Browser chrome frames add context (Safari-style title bar)
- Sidebar + content area layout mirrors real application
- Max 2-3 visual layers (background, content, overlay)
- Negative space is intentional, not accidental

### What Makes It "Vibe Coded"
- Rainbow gradients with no purpose
- Excessive glow/shadow effects
- Animation that doesn't demonstrate anything
- Inconsistent spacing (eyeballed, not grid-aligned)
- Too many fonts or font sizes
- Clashing color combinations
- Novelty effects (glitch, matrix rain) on serious tools
- No dark mode variant
- Raster images that blur on high-DPI screens

---

## 9. Applied Recommendations for Four SVGs

### Hero Banner
**Reference**: Scalar's api-client-animated.svg, LobeChat's centered hero
- viewBox: `0 0 830 400` (fits GitHub README width exactly)
- Light and dark variants as separate files
- Content: product name + tagline + key visual (architecture sketch or product mockup)
- Animation: subtle gradient shift or fade-in sequence (3-5s)
- Typography: 36-48px bold title, 18-20px subtitle, Inter font stack
- Colors: Use 1 brand accent + neutrals; dark mode with rgba text on #0f0f0f
- No browser chrome needed — this is a brand moment, not a product demo

### Comparison Chart
**Reference**: Cal.com table layouts, Scalar's sidebar navigation pattern
- viewBox: `0 0 830 500` (taller for data density)
- Static SVG (no animation needed — data should be scannable)
- Layout: CSS Grid or table inside foreignObject
- Column headers: 14-16px semibold, uppercase or small caps with 1px letter-spacing
- Data cells: 13-14px regular weight
- Check marks: `#00a67d` (green); X marks: `#ef0006` (red)
- Row zebra striping: alternating `#ffffff` / `#f6f6f6` (light) or `#0f0f0f` / `#1a1a1a` (dark)
- Cell padding: 12px horizontal, 8px vertical
- Border: 1px solid `#e7e7e7` (light) or `rgba(255,255,255,0.1)` (dark)

### Pipeline Diagram
**Reference**: Scalar's app-docs-animated.svg (modal popup sequence), Appwrite's architecture SVG
- viewBox: `0 0 830 450`
- Animation: sequential step highlighting (10s loop, steps(1) timing)
- Flow: left-to-right or top-to-bottom boxes connected by lines/arrows
- Box styling: 8px border-radius, `#f6f6f6` background, 1px border
- Active step: accent color border (`#0099ff`), slightly elevated shadow
- Connectors: 2px solid `#e7e7e7` lines with arrow markers
- Labels: 14px semibold inside boxes, 12px regular on connectors
- Sequential reveal: each box highlights at different keyframe percentages

### Terminal Demo
**Reference**: svg-banners typewriter, Scalar's dark mode terminal, termtosvg
- viewBox: `0 0 830 500`
- Background: `#0f0f0f` (Scalar dark) or `rgb(25,25,25)` (svg-banners)
- Font: `Monaco, Menlo, "Courier New", monospace` at 14px, line-height 1.6
- Text color: `rgba(255,255,255,0.75)` for commands, `#00a67d` for success output
- Prompt: `$` prefix in `#579dfb` (blue) or `#b090f8` (purple)
- Cursor: 2px solid `rgba(255,255,255,0.75)`, blinking at 500ms
- Command typing: `steps(N)` where N = character count, 2-4s per line
- Output reveal: opacity 0→1 after command completes
- Window chrome: title bar with traffic-light dots (12px circles: `#ff5f56`, `#ffbd2e`, `#27c93f`)
- Total animation: 10s loop with staggered command sequences
- Corner radius: 8-12px on outer container

---

## 10. Performance Notes

- Animated SVG: ~50 KB vs animated GIF: ~5.6 MB (100x improvement)
- Optimize with SVGOMG (jakearchibald.github.io/svgomg/) — can reduce to ~5 KB for simple banners
- Base64-encoded fonts add size — only embed characters you actually use (unicode-range subsetting)
- Keep total SVG under 200 KB for fast README loading
- Use `font-display: swap` in @font-face to prevent invisible text during load

---

## Sources

- [Scalar blog: How we created an animated, responsive README](https://blog.scalar.com/p/how-we-created-an-animated-responsive)
- [Scalar SVG source files](https://github.com/scalar/scalar/tree/main/documentation/assets)
- [GitHub blog: Dark/light mode images in Markdown](https://github.blog/developer-skills/github/how-to-make-your-images-in-markdown-on-github-adjust-for-dark-mode-and-light-mode/)
- [GrahamTheDev: Responsive, animated, dark/light README](https://dev.to/grahamthedev/take-your-github-readme-to-the-next-level-responsive-and-light-and-dark-modes--3kpc)
- [CSS-Tricks: Custom styles in GitHub READMEs](https://css-tricks.com/custom-styles-in-github-readmes/)
- [Pragmatic Pineapple: Custom HTML/CSS in GitHub README](https://pragmaticpineapple.com/adding-custom-html-and-css-to-github-readme/)
- [Dries Vints: Dark mode SVGs in GitHub READMEs](https://driesvints.com/blog/investigating-dark-mode-for-svgs-in-github-readmes)
- [SVG Banners (Akshay090)](https://github.com/Akshay090/svg-banners)
- [Banner width measurements](https://wh0.github.io/2025/05/18/banner-width.html)
- [termtosvg](https://github.com/nbedos/termtosvg)
- [Charmbracelet VHS](https://github.com/charmbracelet/vhs)
- [egghead: SVG animations for GitHub profiles](https://egghead.io/lessons/css-use-svg-with-inline-css-animations-to-personalize-your-github-profile)
