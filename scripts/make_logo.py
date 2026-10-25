"""Build the README logo: assets/logo.svg (dark pages) and assets/logo-light.svg.

The wordmark and tagline are font outlines, not <text>, so the logo looks the
same everywhere: an SVG shown as an <img> on GitHub cannot load web fonts. The
outlines come from Cascadia Code (SIL Open Font License), the font Windows
Terminal ships; point CASCADIA at a copy of CascadiaCode.ttf on other systems.
The icon animates with plain SMIL, which GitHub's image proxy renders.

    pip install fonttools
    python scripts/make_logo.py            # writes both SVGs
    python scripts/make_logo.py --icon     # also writes assets/icon.svg (square mark only)
"""
import os
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

REPO_ROOT = Path(__file__).resolve().parent.parent
CASCADIA = Path(os.environ.get("CASCADIA", r"C:\Windows\Fonts\CascadiaCode.ttf"))

TAGLINE = "Engineering discipline for AI coding agents"

# Brand palette: electric blue -> violet -> amber "power-up" glow.
C_BLUE, C_VIOLET, C_AMBER = "#38bdf8", "#8b5cf6", "#f59e0b"


class Face:
    def __init__(self, weight):
        font = TTFont(str(CASCADIA))
        if "fvar" in font:
            font = instantiateVariableFont(font, {"wght": weight})
        self.upem = font["head"].unitsPerEm
        self.glyphs = font.getGlyphSet()
        self.cmap = font.getBestCmap()
        self.hmtx = font["hmtx"]

    def path(self, text, size, x, baseline):
        """SVG path data for *text* at *size* px with its left edge at *x*."""
        scale = size / self.upem
        parts, advance = [], 0.0
        for ch in text:
            name = self.cmap[ord(ch)]
            pen = SVGPathPen(self.glyphs)
            self.glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x + advance, baseline)))
            if pen.getCommands():
                parts.append(pen.getCommands())
            advance += self.hmtx[name][0] * scale
        return " ".join(parts), advance


def icon_markup(x, y, size, animate=True, glow=True):
    """The square mark: a terminal prompt chevron and a cursor that breathes."""
    r = size * 0.23
    # Chevron ">" drawn as a thick stroke; cursor as a rounded bar.
    cx, cy = x + size * 0.27, y + size * 0.60
    arm = size * 0.145
    chevron = (f'<path d="M{cx:.1f},{cy - arm:.1f} L{cx + arm:.1f},{cy:.1f} L{cx:.1f},{cy + arm:.1f}" '
               f'fill="none" stroke="#ffffff" stroke-width="{size * 0.085:.1f}" '
               f'stroke-linecap="round" stroke-linejoin="round"/>')
    cur_x, cur_y = x + size * 0.52, y + size * 0.665
    cur_w, cur_h = size * 0.24, size * 0.085
    cursor_anim = ('<animate attributeName="opacity" values="1;1;0.15;0.15;1" keyTimes="0;0.45;0.5;0.95;1" '
                   'dur="1.6s" repeatCount="indefinite"/>' if animate else "")
    cursor = (f'<rect x="{cur_x:.1f}" y="{cur_y:.1f}" width="{cur_w:.1f}" height="{cur_h:.1f}" '
              f'rx="{cur_h / 2:.1f}" fill="#ffffff">{cursor_anim}</rect>')
    # Halo: a thin ring floating above the prompt, the "god mode is on" sign.
    hx, hy = x + size * 0.50, y + size * 0.235
    halo = (f'<ellipse cx="{hx:.1f}" cy="{hy:.1f}" rx="{size * 0.20:.1f}" ry="{size * 0.055:.1f}" '
            f'fill="none" stroke="#ffffff" stroke-width="{size * 0.045:.1f}" opacity=".9">'
            + ('<animate attributeName="opacity" values=".55;1;.55" dur="4s" repeatCount="indefinite"/>'
               if animate else "") + "</ellipse>")
    glow_rect = ""
    if glow:
        glow_rect = (f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{r + 4:.1f}" '
                     f'fill="url(#icon)" filter="url(#glow)" opacity=".45">'
                     + ('<animate attributeName="opacity" values=".3;.6;.3" dur="6s" repeatCount="indefinite"/>'
                        if animate else "") + "</rect>")
    square = f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{r:.1f}" fill="url(#icon)"/>'
    return glow_rect + square + halo + chevron + cursor


# A five-point star on a 16x16 pixel grid. 1 = filled. The outline (0.5) is a
# darker rim so the mark reads on light and dark pages without a box.
STAR_GRID = [
    "0000000110000000",
    "0000000110000000",
    "0000001111000000",
    "0000001111000000",
    "0000011111100000",
    "1111111111111111",
    "1111111111111111",
    "0111111111111110",
    "0001111111111000",
    "0000111111110000",
    "0000111111110000",
    "0001111001111000",
    "0001110000111000",
    "0011100000011100",
    "0011000000001100",
    "0010000000000100",
]


def star_markup(x, y, size, animate=True):
    """The pixel power-up star, drawn as grid cells so it stays crisp at any size."""
    n = len(STAR_GRID)
    cell = size / n
    cells = []
    for r, row in enumerate(STAR_GRID):
        for c, ch in enumerate(row):
            if ch == "1":
                cells.append(f'<rect x="{x + c * cell:.2f}" y="{y + r * cell:.2f}" width="{cell + 0.3:.2f}" height="{cell + 0.3:.2f}"/>')
    flash = ""
    if animate:
        # The power-up flash: gold -> white -> violet -> gold, like an invincibility star.
        flash = ('<animate attributeName="fill" values="#f59e0b;#fde68a;#f59e0b;#c4b5fd;#f59e0b" '
                 'keyTimes="0;0.2;0.4;0.7;1" dur="2.4s" repeatCount="indefinite"/>')
    return (f'<g fill="#f59e0b" stroke="#78350f" stroke-width="{cell * 0.18:.2f}" stroke-linejoin="round">'
            f'{flash}{"".join(cells)}</g>')


def monogram_markup(x, y, size):
    """A G built from an angle bracket and a bar: the terminal's letter."""
    s = size
    w = s * 0.17  # stroke width
    pts = [(x + s * 0.80, y + s * 0.16), (x + s * 0.28, y + s * 0.16), (x + s * 0.10, y + s * 0.34),
           (x + s * 0.10, y + s * 0.66), (x + s * 0.28, y + s * 0.84), (x + s * 0.80, y + s * 0.84),
           (x + s * 0.80, y + s * 0.50), (x + s * 0.48, y + s * 0.50)]
    d = "M" + " L".join(f"{px:.1f},{py:.1f}" for px, py in pts)
    return (f'<path d="{d}" fill="none" stroke="url(#icon)" stroke-width="{w:.1f}" '
            f'stroke-linecap="square" stroke-linejoin="miter"/>')


def defs(word_x1=0, word_x2=1):
    return f"""  <defs>
    <linearGradient id="icon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{C_BLUE}"/>
      <stop offset=".55" stop-color="{C_VIOLET}"/>
      <stop offset="1" stop-color="{C_AMBER}"/>
    </linearGradient>
    <linearGradient id="word" gradientUnits="userSpaceOnUse" x1="{word_x1:.0f}" y1="0" x2="{word_x2:.0f}" y2="0">
      <stop offset="0" stop-color="{C_BLUE}"/>
      <stop offset=".5" stop-color="{C_VIOLET}"/>
      <stop offset="1" stop-color="{C_AMBER}"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>"""


MARK = os.environ.get("GODMODE_MARK", "star")   # star | monogram | prompt


def mark_markup(x, y, size, animate=True):
    if MARK == "star":
        return star_markup(x, y, size, animate)
    if MARK == "monogram":
        return monogram_markup(x, y, size)
    return icon_markup(x, y, size, animate)


def build(theme):
    fg = "#0f172a" if theme == "light" else "#f8fafc"
    muted = "#475569" if theme == "light" else "#94a3b8"
    bold, regular = Face(700), Face(400)

    size, tag_size = 74, 22
    icon_x, icon_y, icon = 24, 36, 128
    text_x = icon_x + icon + 34
    baseline = icon_y + 70
    god, w1 = bold.path("God", size, text_x, baseline)
    mode_x = text_x + w1
    mode, w2 = bold.path("Mode", size, mode_x, baseline)
    tagline, w3 = regular.path(TAGLINE, tag_size, text_x + 2, baseline + 44)
    width = int(max(mode_x + w2, text_x + 2 + w3) + 28)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 200" width="{width}" height="200" role="img" aria-label="GodMode: {TAGLINE}">
{defs(mode_x, mode_x + w2)}

  <!-- the mark -->
  {mark_markup(icon_x, icon_y, icon)}

  <!-- wordmark -->
  <path d="{god}" fill="{fg}"/>
  <path d="{mode}" fill="url(#word)"/>
  <path d="{tagline}" fill="{muted}"/>
</svg>
"""


def build_icon(size=512):
    """Square mark alone, no glow or animation: the source for raster icons."""
    pad = size * 0.08
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}" role="img" aria-label="GodMode">
{defs()}
  {mark_markup(pad, pad, size - 2 * pad, animate=False)}
</svg>
"""


def main():
    if not CASCADIA.exists():
        sys.exit(f"font not found: {CASCADIA} (set CASCADIA to a CascadiaCode.ttf)")
    assets = REPO_ROOT / "assets"
    assets.mkdir(exist_ok=True)
    for theme, name in (("dark", "logo.svg"), ("light", "logo-light.svg")):
        out = assets / name
        out.write_text(build(theme), encoding="utf-8", newline="\n")
        print("wrote", out.relative_to(REPO_ROOT), out.stat().st_size // 1024, "KB")
    if "--icon" in sys.argv:
        out = assets / "icon.svg"
        out.write_text(build_icon(), encoding="utf-8", newline="\n")
        print("wrote", out.relative_to(REPO_ROOT), out.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
