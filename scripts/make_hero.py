"""Composite the README hero banner and the marketplace icon from a rendered emblem.

The emblem itself is rendered locally with Z-Image-Turbo (see
docs/brand.md for the prompt and seed); this script only lays it out and
sets the type, so the banner can be rebuilt pixel-for-pixel.

    python scripts/make_hero.py --bg assets/_build/emblem.png
    python scripts/make_hero.py --bg ... --icon-box 120,40,780,780   # crop for assets/icon.png

Fonts: Unbounded ExtraBold (wordmark) and JetBrains Mono (tagline), static
instances of the SIL OFL variable fonts, in assets/fonts/. Pillow is the only dependency.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
FONTS = REPO_ROOT / "assets" / "fonts"
TAGLINE = "Engineering discipline for AI coding agents"
HARNESSES = "Claude Code  ·  Codex  ·  Antigravity  ·  Cursor  ·  Gemini CLI  ·  OpenCode  ·  Copilot"

W, H = 1600, 600          # 2x of the 800x300 the README shows
C_BLUE, C_VIOLET, C_AMBER = (56, 189, 248), (139, 92, 246), (245, 158, 11)


def font(name, size, weight=None):
    f = ImageFont.truetype(str(FONTS / name), size)
    if weight is not None:
        f.set_variation_by_axes([weight])
    return f


def cover(im, w, h, anchor=0.5):
    """Scale *im* to fill w x h and crop, keeping the horizontal *anchor* (0 left .. 1 right)."""
    scale = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x = round((im.width - w) * anchor)
    y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def horizontal_gradient(w, h, stops):
    """An RGB image whose colour runs through *stops* left to right."""
    grad = Image.new("RGB", (w, 1))
    px = grad.load()
    n = len(stops) - 1
    for x in range(w):
        t = x / max(w - 1, 1) * n
        i = min(int(t), n - 1)
        f = t - i
        a, b = stops[i], stops[i + 1]
        px[x, 0] = tuple(round(a[k] + (b[k] - a[k]) * f) for k in range(3))
    return grad.resize((w, h))


def darken_right(im, start=0.38, strength=0.82):
    """Fade the right part of the picture towards black so type stays readable."""
    mask = Image.new("L", (im.width, 1))
    px = mask.load()
    x0 = int(im.width * start)
    for x in range(im.width):
        t = 0 if x < x0 else (x - x0) / max(im.width - x0, 1)
        px[x, 0] = round(255 * min(1.0, t * 1.4) * strength)
    mask = mask.resize(im.size)
    black = Image.new("RGB", im.size, (6, 7, 11))
    return Image.composite(black, im, mask)


def place_emblem(emblem_path, size=600, x=70):
    """A dark canvas with the square emblem render on the left, its right edge
    faded into the canvas so the render's own background never shows a seam."""
    canvas = Image.new("RGB", (W, H), (6, 7, 11))
    em = Image.open(emblem_path).convert("RGB")
    em = cover(em, size, size)
    fade = Image.new("L", (size, 1), 255)
    px = fade.load()
    for i in range(size):
        t = i / (size - 1)
        px[i, 0] = 255 if t < 0.62 else round(255 * max(0.0, 1 - (t - 0.62) / 0.38))
    fade = fade.resize((size, size))
    canvas.paste(em, (x, (H - size) // 2), fade)
    return canvas


def build_banner(bg_path, out_path, emblem_anchor=0.0, text_x=720, mode="emblem"):
    if mode == "emblem":
        canvas = place_emblem(bg_path)
    else:
        bg = Image.open(bg_path).convert("RGB")
        canvas = cover(bg, W, H, anchor=emblem_anchor)
        canvas = darken_right(canvas)

    # Wordmark: a glow pass, then the gradient-filled letters.
    word_font = font("Unbounded-ExtraBold.ttf", 118)
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).text((text_x, 190), "GodMode", font=word_font, fill=255)
    glow = mask.filter(ImageFilter.GaussianBlur(28))
    glow_layer = Image.new("RGB", (W, H), C_VIOLET)
    canvas = Image.composite(glow_layer, canvas, glow.point(lambda v: v * 0.55))
    bbox = mask.getbbox()
    grad = horizontal_gradient(bbox[2] - bbox[0], H, [(248, 250, 252), (226, 232, 240), C_BLUE, C_VIOLET, C_AMBER])
    grad_full = Image.new("RGB", (W, H), (248, 250, 252))
    grad_full.paste(grad, (bbox[0], 0))
    canvas = Image.composite(grad_full, canvas, mask)

    draw = ImageDraw.Draw(canvas)
    draw.text((text_x + 4, 345), TAGLINE, font=font("JetBrainsMono-Medium.ttf", 29), fill=(203, 213, 225))
    # The harness line shrinks until it fits inside the right margin.
    size = 17
    while size > 11:
        f = font("JetBrainsMono-Regular.ttf", size)
        if draw.textlength(HARNESSES, font=f) <= W - text_x - 4 - 60:
            break
        size -= 1
    draw.text((text_x + 4, 398), HARNESSES, font=f, fill=(120, 130, 150))
    canvas = round_corners(canvas, 28)
    canvas.save(out_path, optimize=True)
    return canvas


def round_corners(im, radius):
    """Bake rounded corners into the alpha channel so the banner sits cleanly on
    light and dark pages alike (a README image cannot be styled with CSS)."""
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=radius, fill=255)
    im.putalpha(mask)
    return im


def build_social_preview(bg_path, out_path):
    """GitHub's social preview is 1280x640; the same composition, star centred
    higher, wordmark below it, so the crop GitHub shows on cards stays whole."""
    canvas = Image.new("RGB", (1280, 640), (6, 7, 11))
    size = 420
    em = cover(Image.open(bg_path).convert("RGB"), size, size)
    # The fade must reach zero before the square's border, or the render's own
    # background shows as a seam against the canvas.
    fade = Image.new("L", (size, size), 0)
    ImageDraw.Draw(fade).ellipse((70, 70, size - 70, size - 70), fill=255)
    fade = fade.filter(ImageFilter.GaussianBlur(34))
    canvas.paste(em, ((1280 - size) // 2, 10), fade)
    word_font = font("Unbounded-ExtraBold.ttf", 96)
    mask = Image.new("L", canvas.size, 0)
    d = ImageDraw.Draw(mask)
    tw = d.textlength("GodMode", font=word_font)
    x = (1280 - tw) / 2
    d.text((x, 400), "GodMode", font=word_font, fill=255)
    glow = mask.filter(ImageFilter.GaussianBlur(24))
    canvas = Image.composite(Image.new("RGB", canvas.size, C_VIOLET), canvas, glow.point(lambda v: v * 0.55))
    grad = horizontal_gradient(int(tw), 640, [(248, 250, 252), (226, 232, 240), C_BLUE, C_VIOLET, C_AMBER])
    grad_full = Image.new("RGB", canvas.size, (248, 250, 252))
    grad_full.paste(grad, (int(x), 0))
    canvas = Image.composite(grad_full, canvas, mask)
    d = ImageDraw.Draw(canvas)
    tf = font("JetBrainsMono-Medium.ttf", 26)
    d.text(((1280 - d.textlength(TAGLINE, font=tf)) / 2, 540), TAGLINE, font=tf, fill=(203, 213, 225))
    canvas.save(out_path, optimize=True)
    return canvas


def build_icon(bg_path, box, out_path, size=512):
    im = Image.open(bg_path).convert("RGB").crop(box)
    im = im.resize((size, size), Image.LANCZOS).convert("RGBA")
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=255)
    im.putalpha(mask)
    im.save(out_path)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bg", default=str(REPO_ROOT / "assets" / "brand" / "emblem.png"))
    ap.add_argument("--out", default=str(REPO_ROOT / "assets" / "hero.png"))
    ap.add_argument("--anchor", type=float, default=0.0, help="horizontal crop anchor for the emblem, 0 = keep left edge")
    ap.add_argument("--text-x", type=int, default=720)
    ap.add_argument("--icon-box", help="x,y,w,h crop in the source image for assets/icon.png; 'auto' finds the bright emblem and pads it")
    ap.add_argument("--icon-out", default=str(REPO_ROOT / "assets" / "icon.png"))
    ap.add_argument("--mode", choices=["emblem", "cover"], default="emblem",
                    help="emblem: square render on the left of a dark canvas; cover: wide render fills the banner")
    ap.add_argument("--social", help="also write the 1280x640 GitHub social preview to this path")
    a = ap.parse_args()
    banner = build_banner(a.bg, a.out, a.anchor, a.text_x, a.mode)
    print("wrote", a.out, banner.size)
    if a.social:
        build_social_preview(a.bg, a.social)
        print("wrote", a.social)
    if a.icon_box == "auto":
        src = Image.open(a.bg).convert("L")
        bbox = src.point(lambda v: 255 if v > 60 else 0).getbbox()
        cx, cy = (bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2
        half = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.62)
        box = (max(cx - half, 0), max(cy - half, 0), min(cx + half, src.width), min(cy + half, src.height))
        build_icon(a.bg, box, a.icon_out)
        print("wrote", a.icon_out, "from box", box)
    elif a.icon_box:
        x, y, w, h = (int(v) for v in a.icon_box.split(","))
        build_icon(a.bg, (x, y, x + w, y + h), a.icon_out)
        print("wrote", a.icon_out)


if __name__ == "__main__":
    main()
