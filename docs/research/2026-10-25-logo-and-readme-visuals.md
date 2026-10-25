# README logos and mark research (fetched 2026-10-25)

Research agent report, used for the brand decision recorded in `docs/brand.md`.

## A. README logos on popular repos
| Repo | Mark | Format / size | Dark-light |
|---|---|---|---|
| oven-sh/bun | logo image | remote img, height 170 | none |
| denoland/deno | dinosaur mascot | SVG, height 150 | none |
| vitejs/vite | logo | SVG, height 60 | `<picture>`, two SVGs |
| withastro/astro | banner | banner.jpg | none |
| tauri-apps/tauri | splash | splash.png | none |
| starship/starship | logo | PNG width 400 | none |
| charmbracelet/gum | illustrated logo | PNG width 450 + GIF demo | none |
| charmbracelet/vhs | logo | PNG width 500 | dark/light fragments |
| honojs/hono | wordmark | PNG width 500 | none |
| drizzle-team/drizzle-orm | square logo | SVG | dark/light fragments |
| better-auth | banner | PNG dark/light | `<picture>` |
| excalidraw | cover banner | PNG | `<picture>` |
| vercel/turborepo | logo + h1 | PNG height 128 | `<picture>` |
| github/spec-kit | square logo | WebP 200x200 | none |
| sst/opencode | wordmark | SVG | `<picture>` |
| openai/codex | splash screenshot | PNG width 80% | none |

No logo at the top: anthropics/claude-code, obra/superpowers, google-gemini/gemini-cli, nushell, astral-sh/uv and ruff. A clear mark is therefore a differentiator among agent tools.

Patterns: a centred single image, 60-200 px tall or 400-500 px wide, then badges, then nav links; animation appears only as a demo GIF below the logo; `<picture>` is the documented dark/light mechanism.

## B. Guidance
- Design for 16 px first; one silhouette; subtle gradients turn to mush at small sizes; test on light and dark (https://iconic.iconbuddy.com/p/iconic-08-logos-are-just-icons-with-a-job, promotional source).
- 2026 trends: marks must work as tab icon, dark tile and 32 px avatar; retro/nostalgic and single exaggerated letter are named trends; AI tools flood the market with "technically competent, emotionally empty" marks (https://weandthecolor.com/best-logo-design-trends-of-2026-whats-working-whats-tired-and-whats-next/209969).
- Pixel style reads as deliberate with a limited palette, sharp edges and grid alignment.

Concepts proposed (agent's own): pixel invincibility star; shield with check; Konami arrows; eye-in-triangle (avoid); G monogram from brackets; bracket pair around a dot; crown over cursor; bolt through bracket; hexagon with infinity; pixel heart with infinity. Agent's ranking: G monogram, pixel star, pixel heart.

Outcome: the owner rejected flat marks as too basic and too close to Usage Pulse; the shipped mark is a rendered obsidian glass power-up star (see `docs/brand.md`). The research's README-layout findings (single centred hero image, demos below, `<picture>` for themes) are applied.

## C. Production
- Tracing: vtracer (MIT, colour) vs potrace (monochrome) vs Vectorizer.AI (paid). Hand-write SVG for geometric marks.
- US Copyright Office Part 2 report (29 Jan 2025): wholly AI-generated output is not protected; human selection, arrangement and creative modification can be (https://copyrightalliance.org/ai-report-part-2-copyrightability/).
- Claude plugin icon: `plugin.json` `icon` is a path inside the plugin, read only by the directory listing; pixel size not stated in the docs read (512 px square PNG chosen as the safe value, matching superpowers' Antigravity logo).
- GitHub social preview: at least 640x320, 1280x640 best, under 1 MB (https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview).
