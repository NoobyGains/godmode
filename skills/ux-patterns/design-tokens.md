# Design Token Templates

Ready-to-deploy token definitions organized by project classification. Copy the relevant template and adapt values to the project's brand identity.

## How to Use

1. Determine the project classification
2. Copy the matching token template below
3. Adapt brand colors (primary, secondary) to the project's identity
4. Preserve the neutral scale, spacing scale, and typography scale unless the project has an explicit reason to deviate
5. Establish tokens BEFORE writing any component code

---

## SaaS Dashboard Tokens

Neutral palette, data-focused, high information density, professional tone.

```css
:root {
  /* --- Colors --- */
  /* Primary: Blue - trust, professionalism */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* Neutral: Slate - clean, business-appropriate */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;
  --color-neutral-950: #020617;

  /* Semantic */
  --color-success: #16a34a;
  --color-success-light: #dcfce7;
  --color-warning: #d97706;
  --color-warning-light: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #fee2e2;
  --color-info: #2563eb;
  --color-info-light: #dbeafe;

  /* Surfaces */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-inverse: #0f172a;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;

  /* Text */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-text-inverse: #ffffff;
  --color-text-link: #2563eb;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Type scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.8125rem;  /* 13px */
  --text-base: 0.875rem; /* 14px - SaaS base is smaller for density */
  --text-lg: 1rem;       /* 16px */
  --text-xl: 1.125rem;   /* 18px */
  --text-2xl: 1.25rem;   /* 20px */
  --text-3xl: 1.5rem;    /* 24px */
  --text-4xl: 1.875rem;  /* 30px */

  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* --- Spacing --- */
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* --- Border Radius --- */
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-full: 9999px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* --- Breakpoints (reference values, not custom properties) --- */
  /* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */

  /* --- Z-Index --- */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal-backdrop: 30;
  --z-modal: 31;
  --z-popover: 40;
  --z-toast: 50;

  /* --- Transitions --- */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* --- Component Sizes --- */
  --input-height-sm: 2rem;     /* 32px */
  --input-height-md: 2.25rem;  /* 36px */
  --input-height-lg: 2.5rem;   /* 40px */
  --button-height-sm: 2rem;    /* 32px */
  --button-height-md: 2.25rem; /* 36px */
  --button-height-lg: 2.75rem; /* 44px */
  --sidebar-width: 16rem;      /* 256px */
  --sidebar-collapsed: 4rem;   /* 64px */
  --topbar-height: 3.5rem;     /* 56px */
}
```

---

## Marketing / Landing Page Tokens

Brand-forward, conversion-optimized, larger typography, generous whitespace.

```css
:root {
  /* --- Colors --- */
  /* Primary: Adapt to brand - example uses indigo */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;
  --color-primary-950: #1e1b4b;

  /* Secondary: Complementary accent */
  --color-secondary-400: #34d399;
  --color-secondary-500: #10b981;
  --color-secondary-600: #059669;

  /* Neutral: Gray */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;
  --color-neutral-950: #030712;

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;

  /* Surfaces */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-dark: #111827;
  --color-bg-dark-secondary: #1f2937;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #ffffff;
  --color-text-link: #4f46e5;

  /* --- Typography --- */
  --font-display: 'Cal Sans', 'Inter', sans-serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Type scale - enlarged for marketing */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  --text-7xl: 4.5rem;    /* 72px - hero headlines */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  --leading-tight: 1.1;    /* Headlines */
  --leading-snug: 1.3;     /* Subheadings */
  --leading-normal: 1.6;   /* Body copy */
  --leading-relaxed: 1.75; /* Long-form text */

  /* Letter spacing */
  --tracking-tight: -0.025em;  /* Headlines */
  --tracking-normal: 0;
  --tracking-wide: 0.025em;

  /* --- Spacing --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;    /* Section spacing */
  --space-32: 8rem;    /* Large section spacing */

  /* --- Border Radius --- */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* --- Component Sizes --- */
  --button-height-md: 2.75rem;  /* 44px */
  --button-height-lg: 3rem;     /* 48px */
  --button-height-xl: 3.5rem;   /* 56px - hero CTA */
  --container-max: 80rem;       /* 1280px */
  --container-narrow: 48rem;    /* 768px - text content */
  --section-padding-y: 5rem;    /* 80px */
}
```

---

## Game UI Tokens

Dark surfaces, bold typography, animated elements, high contrast.

```css
:root {
  /* --- Colors --- */
  /* Primary: Adapt to game aesthetic - example uses amber/gold */
  --color-primary-400: #fbbf24;
  --color-primary-500: #f59e0b;
  --color-primary-600: #d97706;

  /* Accent: For highlights, rare items, abilities */
  --color-accent-blue: #3b82f6;
  --color-accent-purple: #8b5cf6;
  --color-accent-red: #ef4444;
  --color-accent-green: #22c55e;
  --color-accent-orange: #f97316;

  /* Rarity scale */
  --color-rarity-common: #9ca3af;
  --color-rarity-uncommon: #22c55e;
  --color-rarity-rare: #3b82f6;
  --color-rarity-epic: #8b5cf6;
  --color-rarity-legendary: #f97316;

  /* Semantic */
  --color-health: #ef4444;
  --color-health-bg: #450a0a;
  --color-mana: #3b82f6;
  --color-mana-bg: #172554;
  --color-stamina: #22c55e;
  --color-stamina-bg: #052e16;
  --color-xp: #a855f7;
  --color-gold: #fbbf24;

  /* Surfaces - dark by default */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #171717;
  --color-bg-tertiary: #262626;
  --color-bg-elevated: #2a2a2a;
  --color-bg-overlay: rgba(0, 0, 0, 0.7);
  --color-border: #333333;
  --color-border-strong: #525252;

  /* Text */
  --color-text-primary: #fafafa;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;
  --color-text-highlight: #fbbf24;

  /* --- Typography --- */
  --font-display: 'Rajdhani', 'Orbitron', sans-serif;
  --font-sans: 'Inter', 'Exo 2', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Type scale */
  --text-xs: 0.6875rem;  /* 11px - minor stats */
  --text-sm: 0.75rem;    /* 12px - tooltips, labels */
  --text-base: 0.875rem; /* 14px - body */
  --text-lg: 1rem;       /* 16px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px - headings */
  --text-3xl: 2rem;      /* 32px - titles */
  --text-4xl: 2.5rem;    /* 40px - big numbers, damage */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* --- Spacing --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* --- Border Radius --- */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-none: 0; /* Sharp corners for aggressive aesthetic */

  /* --- Shadows & Effects --- */
  --shadow-glow-primary: 0 0 20px rgba(245, 158, 11, 0.3);
  --shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.3);
  --shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);
  --shadow-inner: inset 0 2px 4px rgb(0 0 0 / 0.3);
  --shadow-panel: 0 4px 16px rgb(0 0 0 / 0.5);

  /* --- Transitions --- */
  --transition-fast: 100ms ease;
  --transition-normal: 200ms ease;
  --transition-bounce: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* --- Component Sizes --- */
  --slot-size: 3rem;      /* 48px inventory slot */
  --slot-size-lg: 4rem;   /* 64px equipment slot */
  --bar-height: 1.25rem;  /* 20px health/mana bar */
  --bar-height-sm: 0.5rem; /* 8px mini bar */
  --hud-padding: 1rem;
  --tooltip-max-width: 18rem; /* 288px */
}
```

---

## Developer Tool Tokens

Monospace-dominant, high contrast, minimal decoration, dense information display.

```css
:root {
  /* --- Colors --- */
  /* Primary: Teal/cyan - technical, precise */
  --color-primary-400: #22d3ee;
  --color-primary-500: #06b6d4;
  --color-primary-600: #0891b2;

  /* Neutral: Zinc */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  --color-neutral-200: #e4e4e7;
  --color-neutral-300: #d4d4d8;
  --color-neutral-400: #a1a1aa;
  --color-neutral-500: #71717a;
  --color-neutral-600: #52525b;
  --color-neutral-700: #3f3f46;
  --color-neutral-800: #27272a;
  --color-neutral-900: #18181b;
  --color-neutral-950: #09090b;

  /* Syntax highlighting */
  --color-syntax-keyword: #c084fc;
  --color-syntax-string: #86efac;
  --color-syntax-number: #fde68a;
  --color-syntax-comment: #71717a;
  --color-syntax-function: #67e8f9;
  --color-syntax-type: #fca5a5;
  --color-syntax-variable: #e2e8f0;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #06b6d4;

  /* Surfaces - dark by default for dev tools */
  --color-bg-primary: #09090b;
  --color-bg-secondary: #18181b;
  --color-bg-tertiary: #27272a;
  --color-bg-elevated: #3f3f46;
  --color-border: #3f3f46;
  --color-border-strong: #52525b;

  /* Text */
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  --color-text-link: #22d3ee;

  /* --- Typography --- */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  --font-sans: 'Inter', -apple-system, sans-serif;

  /* Type scale - compact for density */
  --text-xs: 0.6875rem;  /* 11px */
  --text-sm: 0.75rem;    /* 12px */
  --text-base: 0.8125rem; /* 13px - dev tool base */
  --text-lg: 0.875rem;   /* 14px */
  --text-xl: 1rem;       /* 16px */
  --text-2xl: 1.25rem;   /* 20px */
  --text-3xl: 1.5rem;    /* 24px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.3;
  --leading-code: 1.5;
  --leading-normal: 1.5;

  /* --- Spacing --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* --- Border Radius --- */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  /* Dev tools favor sharp corners */

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px rgb(0 0 0 / 0.4);

  /* --- Component Sizes --- */
  --input-height: 1.75rem;    /* 28px - compact */
  --button-height: 1.75rem;   /* 28px */
  --tab-height: 2rem;         /* 32px */
  --panel-header: 2rem;       /* 32px */
  --sidebar-width: 14rem;     /* 224px */
  --panel-min-width: 12rem;   /* 192px */
  --scrollbar-width: 0.5rem;  /* 8px */
}
```

---

## E-commerce Tokens

Product-focused, trust-building, clean product display, conversion-optimized.

```css
:root {
  /* --- Colors --- */
  /* Primary: Adapt to brand - example uses emerald for trust */
  --color-primary-50: #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;
  --color-primary-950: #022c22;

  /* Accent: For promotions, urgency, badges */
  --color-sale: #dc2626;
  --color-sale-bg: #fef2f2;
  --color-new: #2563eb;
  --color-new-bg: #eff6ff;
  --color-bestseller: #d97706;
  --color-bestseller-bg: #fffbeb;

  /* Neutral */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0a0a0a;

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #2563eb;

  /* Trust signals */
  --color-star: #f59e0b;      /* Review stars */
  --color-verified: #16a34a;  /* Verified badge */
  --color-secure: #059669;    /* Security indicators */

  /* Surfaces */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-tertiary: #f5f5f5;
  --color-border: #e5e5e5;
  --color-border-strong: #d4d4d4;

  /* Text */
  --color-text-primary: #171717;
  --color-text-secondary: #525252;
  --color-text-muted: #a3a3a3;
  --color-text-link: #059669;
  --color-text-price: #171717;
  --color-text-sale-price: #dc2626;
  --color-text-original-price: #a3a3a3;

  /* --- Typography --- */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'DM Sans', 'Inter', sans-serif;
  --font-mono: 'Tabular Nums', monospace; /* Price display */

  /* Type scale */
  --text-xs: 0.75rem;    /* 12px - fine print */
  --text-sm: 0.8125rem;  /* 13px - labels */
  --text-base: 0.875rem; /* 14px */
  --text-lg: 1rem;       /* 16px */
  --text-xl: 1.125rem;   /* 18px */
  --text-2xl: 1.25rem;   /* 20px */
  --text-3xl: 1.5rem;    /* 24px */
  --text-4xl: 1.875rem;  /* 30px */
  --text-5xl: 2.25rem;   /* 36px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* --- Spacing --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* --- Border Radius --- */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-card-hover: 0 8px 20px -4px rgb(0 0 0 / 0.12);

  /* --- Component Sizes --- */
  --button-height-sm: 2rem;
  --button-height-md: 2.5rem;    /* 40px */
  --button-height-lg: 2.75rem;   /* 44px */
  --button-height-xl: 3rem;      /* 48px - Add to Cart */
  --input-height: 2.5rem;        /* 40px */
  --product-card-image: 16rem;   /* 256px */
  --container-max: 80rem;        /* 1280px */
  --product-grid-gap: 1.5rem;    /* 24px */
  --cart-sidebar-width: 24rem;   /* 384px */
}
```

---

## Token Governance Rules

These rules hold regardless of project classification:

1. **Never use raw values in components.** Every color, spacing value, font-size, shadow, and radius must reference a token.

2. **Define tokens BEFORE components.** The token file is the first artifact you create for any UI project.

3. **Adapt brand colors; preserve structure.** Change the primary hue to match the brand. Keep the neutral scale, spacing scale, and type scale intact.

4. **Semantic tokens over raw references.** Use `--color-error` not `--color-red-500`. Use `--color-bg-primary` not `--color-neutral-50`. This enables theming and dark mode.

5. **Component tokens reference global tokens.** If a button needs a specific shade, define `--button-bg: var(--color-primary-600)` rather than consuming `--color-primary-600` directly. This enables component-level theming.

6. **Dark mode is a token swap, not a rewrite.** When tokens are properly semantic, dark mode is achieved by redefining surface and text color tokens.

7. **Validate tokens visually.** After defining tokens, create a simple test page displaying all colors, the type scale, and the spacing scale. Confirm they form a cohesive system before building components.
