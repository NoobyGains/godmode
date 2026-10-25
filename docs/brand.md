# GodMode brand

## The mark

A five-pointed star cut from black obsidian glass, facets catching electric blue and violet, a hot amber core: the power-up behind the name, rendered rather than drawn. It replaced a flat gradient-square mark that looked like the owner's other project.

The emblem is `assets/brand/emblem.png`, rendered locally on 2026-10-25 with **Z-Image-Turbo** (Apache 2.0) in ComfyUI 0.41 on an RTX 5090, 8 steps, `res_multistep` sampler, cfg 1, 1024×1024, seed `7001`. Prompt:

> A premium brand emblem: a five-pointed star carved from black obsidian glass with razor-sharp bevelled facets, edges glowing electric blue and violet with a hot amber core light leaking through the facets, floating on a pure black background, volumetric light haze, cinematic studio lighting, octane render, ultra detailed, centered, no text

Eleven directions were rendered and compared (pixel star, shield, lightning bolt, Konami arrows, neon G sigil, halo and cursor, voxel glass star, ring star, obsidian star in four seeds). The obsidian star won for reading as a power-up at every size and for having no resemblance to any dev-tool mark we could find.

## Derived assets

All built by `python scripts/make_hero.py` from the emblem, so they can be regenerated pixel for pixel:

| File | Size | Use |
|---|---|---|
| `assets/hero.png` | 1600×600, rounded corners, transparent outside | README header, shown at 800 px wide |
| `assets/icon.png` | 512×512, rounded square | Claude plugin directory icon, Antigravity marketplace logo |
| `assets/social-preview.png` | 1280×640 | GitHub repository social preview (uploaded by hand in Settings) |

## Type

- Wordmark: **Unbounded** 800 (SIL Open Font License), gradient white → blue `#38bdf8` → violet `#8b5cf6` → amber `#f59e0b`, with a soft violet glow.
- Tagline and labels: **JetBrains Mono** (SIL OFL).
- Both fonts are vendored in `assets/fonts/` as static instances, with both licence files.

## Colour

| Role | Hex |
|---|---|
| Background | `#06070b` |
| Blue | `#38bdf8` |
| Violet | `#8b5cf6` |
| Amber | `#f59e0b` |
| Text | `#f8fafc` / muted `#cbd5e1` |

## Notes

- The emblem is AI-generated imagery; the composition, type and all derived assets are original work. Trademark-wise the mark is a generic faceted star: no third-party character or logo is referenced.
- The animated README demos (`scripts/readme_assets.py`) use the same palette on GitHub's dark and light frame colours.
