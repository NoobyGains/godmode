"""Render the README's animated pictures as SVG, in a light and a dark variant.

Every picture in the README comes from the scenes defined at the bottom of
this file, so the text in a demo can never drift from the skills it shows.
The SVGs use plain SMIL (``<animate>`` / ``<set>``), which GitHub renders when
the file is referenced with ``<img>``; there is no JavaScript, no external
font, no ``foreignObject``. Each scene loops: a hidden ``<animate id="loop">``
is the clock and every reveal is timed against ``loop.begin``.

    python scripts/readme_assets.py            # writes assets/<scene>.svg and <scene>-light.svg
    python scripts/readme_assets.py --list     # scene names
"""
import html
import sys
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS = REPO_ROOT / "assets"

MONO = "ui-monospace, 'Cascadia Code', 'Cascadia Mono', Menlo, Consolas, 'DejaVu Sans Mono', monospace"
SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

THEMES = {
    "dark": dict(bg="#0d1117", frame="#161b22", bar="#21262d", border="#30363d", text="#e6edf3",
                 muted="#8b949e", dim="#484f58", green="#3fb950", red="#f85149", amber="#d29922",
                 blue="#58a6ff", violet="#bc8cff", cyan="#39c5cf", selection="#1f2a3a"),
    "light": dict(bg="#ffffff", frame="#f6f8fa", bar="#eaeef2", border="#d0d7de", text="#1f2328",
                  muted="#59636e", dim="#8c959f", green="#1a7f37", red="#cf222e", amber="#9a6700",
                  blue="#0969da", violet="#8250df", cyan="#1b7c83", selection="#ddf4ff"),
}

# ---------------------------------------------------------------------------
# Scene model
# ---------------------------------------------------------------------------


@dataclass
class Seg:
    text: str
    color: str = "text"       # a THEMES key
    bold: bool = False


@dataclass
class Line:
    segs: list
    at: float                 # seconds after loop start when the line appears
    kind: str = "plain"       # plain | user | agent | ok | fail | warn | step | blank | spinner
    indent: int = 0


@dataclass
class Scene:
    name: str
    title: str
    lines: list
    loop: float               # loop length in seconds
    width: int = 830
    alt: str = ""
    caption: str = ""         # small label in the window title bar


def L(at, *segs, kind="plain", indent=0):
    """Build a Line from (text, color) tuples or plain strings."""
    out = []
    for s in segs:
        if isinstance(s, str):
            out.append(Seg(s))
        else:
            out.append(Seg(*s))
    return Line(out, at, kind, indent)


def user(at, text):
    return L(at, ("❯ ", "muted"), (text, "text", True), kind="user")


def agent(at, *segs):
    return L(at, *segs, kind="agent")


def ok(at, text):
    return L(at, ("✓ ", "green"), (text, "text"), kind="ok")


def fail(at, text):
    return L(at, ("✗ ", "red"), (text, "text"), kind="fail")


def warn(at, text):
    return L(at, ("! ", "amber"), (text, "text"), kind="warn")


def skill(at, name, purpose):
    return L(at, ("Using ", "muted"), (f"godmode:{name}", "violet", True), (f" {purpose}", "muted"))


def dim(at, text, indent=0):
    return L(at, (text, "muted"), indent=indent)


def blank(at):
    return Line([], at, "blank")


def spinner(at, text, until):
    """A line whose glyph spins between *at* and *until*, then turns into a tick."""
    ln = L(at, ("⠋ ", "blue"), (text, "text"), kind="spinner")
    ln.until = until
    return ln


# ---------------------------------------------------------------------------
# Renderer
# ---------------------------------------------------------------------------

LINE_H = 24
PAD_X, PAD_TOP, PAD_BOTTOM = 24, 56, 28
FONT_SIZE = 14
CHAR_W = 0.62                 # advance width of a monospace glyph, as a fraction of font size


def esc(s):
    return html.escape(s, quote=False)


def line_chars(ln):
    return sum(len(s.text) for s in ln.segs)


def check_width(scene_name, ln, width, font_size, pad_x):
    """Fail loudly when a line would run past the frame: a clipped demo lies."""
    budget = int((width - 2 * pad_x - ln.indent * 16) / (font_size * CHAR_W))
    used = line_chars(ln)
    if used > budget:
        raise SystemExit(f"{scene_name}: line at {ln.at}s is {used} chars, budget {budget}: "
                         f"{''.join(s.text for s in ln.segs)!r}")


def spinner_markup(x, y, t, begin, end_at, font_size):
    """A rotating arc shown between *begin* and *end_at*, then a tick."""
    r = font_size * 0.36
    cx, cy = x + r + 1, y - font_size * 0.36
    arc = (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{t["blue"]}" '
           f'stroke-width="{font_size * 0.13:.1f}" stroke-linecap="round" '
           f'stroke-dasharray="{r * 4.2:.1f} {r * 2.1:.1f}">'
           f'<animateTransform attributeName="transform" type="rotate" from="0 {cx:.1f} {cy:.1f}" '
           f'to="360 {cx:.1f} {cy:.1f}" dur="0.9s" repeatCount="indefinite"/></circle>')
    return (f'<g opacity="0"><set attributeName="opacity" to="1" begin="{begin}" end="{end_at}"/>{arc}</g>'
            f'<text x="{x}" y="{y}" font-family="{MONO}" font-size="{font_size}" fill="{t["green"]}" opacity="0">'
            f'<set attributeName="opacity" to="1" begin="{end_at}" end="loop.end"/>'
            f'<set attributeName="opacity" to="0" begin="loop.begin"/>✓</text>')


def cursor_markup(x, y, t, begin):
    """A block cursor that exists only after *begin* and blinks while it exists."""
    return (f'<g opacity="0"><set attributeName="opacity" to="1" begin="{begin}" end="loop.end"/>'
            f'<set attributeName="opacity" to="0" begin="loop.begin"/>'
            f'<rect x="{x}" y="{y - 13}" width="8" height="17" fill="{t["text"]}">'
            f'<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>'
            f'</rect></g>')


def render_scene(scene, theme_name):
    t = THEMES[theme_name]
    rows = len(scene.lines)
    height = PAD_TOP + rows * LINE_H + PAD_BOTTOM
    w = scene.width
    out = []
    out.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {height}" width="{w}" height="{height}" '
               f'role="img" aria-label="{esc(scene.alt or scene.title)}">')
    out.append(f'<title>{esc(scene.title)}</title>')
    # The clock: an animation that never shows anything but defines the loop.
    out.append(f'<rect width="0" height="0"><animate id="loop" attributeName="x" from="0" to="0" '
               f'dur="{scene.loop}s" repeatCount="indefinite"/></rect>')
    # Window frame.
    out.append(f'<rect x="0.5" y="0.5" width="{w - 1}" height="{height - 1}" rx="10" fill="{t["frame"]}" stroke="{t["border"]}"/>')
    out.append(f'<path d="M0.5,36 L{w - 0.5},36" stroke="{t["border"]}"/>')
    out.append(f'<rect x="0.5" y="0.5" width="{w - 1}" height="36" rx="10" fill="{t["bar"]}"/>')
    out.append(f'<rect x="0.5" y="26" width="{w - 1}" height="10" fill="{t["bar"]}"/>')
    for i, c in enumerate(("#ff5f57", "#febc2e", "#28c840")):
        out.append(f'<circle cx="{22 + i * 20}" cy="18" r="6" fill="{c}"/>')
    out.append(f'<text x="{w / 2}" y="22.5" text-anchor="middle" font-family="{SANS}" font-size="12.5" '
               f'fill="{t["muted"]}">{esc(scene.caption or scene.title)}</text>')

    out.extend(render_lines(scene.name, scene.lines, t, PAD_X, PAD_TOP, w, FONT_SIZE, LINE_H))
    # Blinking cursor on the line after the last one, once the scene has played out.
    last = scene.lines[-1]
    out.append(cursor_markup(PAD_X, PAD_TOP + rows * LINE_H, t, f"loop.begin+{last.at + 0.6:.2f}s"))
    out.append("</svg>")
    return "\n".join(out) + "\n"


def render_lines(scene_name, lines, t, pad_x, top, width, font_size, line_h):
    """Markup for a column of timed lines; shared by the terminal scenes and the comparison."""
    out = []
    y = top
    for ln in lines:
        x = pad_x + ln.indent * 16
        begin = f"loop.begin+{ln.at:.2f}s"
        if ln.kind == "blank":
            y += line_h
            continue
        check_width(scene_name, ln, width, font_size, pad_x)
        # Each line fades in once per loop and is reset by the loop restart.
        out.append(f'<g opacity="0"><set attributeName="opacity" to="1" begin="{begin}" end="loop.end"/>'
                   f'<animate attributeName="opacity" from="0" to="1" begin="{begin}" dur="0.25s" fill="freeze"/>'
                   f'<set attributeName="opacity" to="0" begin="loop.begin"/>')
        if ln.kind == "user":
            # A faint selection bar behind the prompt line, like a focused input.
            out.append(f'<rect x="{pad_x - 10}" y="{y - line_h * 0.67:.1f}" width="{width - 2 * pad_x + 20}" '
                       f'height="{line_h}" rx="4" fill="{t["selection"]}"/>')
        tspans = []
        for s in ln.segs:
            if ln.kind == "spinner" and s is ln.segs[0]:
                tspans.append(f'<tspan fill="none">{esc(s.text)}</tspan>')   # keep the glyph's width, draw the arc instead
                continue
            weight = ' font-weight="600"' if s.bold else ""
            tspans.append(f'<tspan fill="{t[s.color]}"{weight}>{esc(s.text)}</tspan>')
        out.append(f'<text x="{x}" y="{y}" font-family="{MONO}" font-size="{font_size}" xml:space="preserve">{"".join(tspans)}</text>')
        if ln.kind == "spinner":
            out.append(spinner_markup(x, y, t, begin, f"loop.begin+{ln.until:.2f}s", font_size))
        out.append("</g>")
        y += line_h
    return out


def render_comparison(left, right, theme_name, width=830, loop=14.0, font_size=12, line_h=20):
    """Two terminal panels side by side: the same request without and with GodMode."""
    t = THEMES[theme_name]
    pad = 16
    panel_w = (width - 3 * pad) / 2
    rows = max(len(left.lines), len(right.lines))
    top, bottom = 52, 24
    height = top + rows * line_h + bottom
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
           f'role="img" aria-label="{esc(left.alt)} {esc(right.alt)}">',
           f'<rect width="0" height="0"><animate id="loop" attributeName="x" from="0" to="0" dur="{loop}s" repeatCount="indefinite"/></rect>']
    for i, scene in enumerate((left, right)):
        px = pad + i * (panel_w + pad)
        out.append(f'<g transform="translate({px:.1f},0)">')
        out.append(f'<rect x="0.5" y="0.5" width="{panel_w - 1:.1f}" height="{height - 1}" rx="10" fill="{t["frame"]}" stroke="{t["border"]}"/>')
        out.append(f'<rect x="0.5" y="0.5" width="{panel_w - 1:.1f}" height="34" rx="10" fill="{t["bar"]}"/>')
        out.append(f'<rect x="0.5" y="24" width="{panel_w - 1:.1f}" height="10" fill="{t["bar"]}"/>')
        for j, c in enumerate(("#ff5f57", "#febc2e", "#28c840")):
            out.append(f'<circle cx="{18 + j * 18}" cy="17" r="5.5" fill="{c}"/>')
        colour = t["red"] if i == 0 else t["green"]
        out.append(f'<text x="{panel_w / 2:.1f}" y="21.5" text-anchor="middle" font-family="{SANS}" font-size="12.5" '
                   f'font-weight="600" fill="{colour}">{esc(scene.title)}</text>')
        out.extend(render_lines(scene.name, scene.lines, t, pad, top, panel_w, font_size, line_h))
        out.append("</g>")
    out.append("</svg>")
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------------------
# Pipeline diagram (not a terminal): five gated phases lighting up in turn.
# ---------------------------------------------------------------------------

PHASES = [
    ("DEFINE", "rationale · intent-discovery · grounding"),
    ("PLAN", "reference-first · task-planning"),
    ("EXECUTE", "delegated-execution · test-first"),
    ("REVIEW", "code-review · cross-model-review"),
    ("SHIP", "completion-gate · merge-protocol"),
]


def render_pipeline(theme_name, loop=15.0):
    t = THEMES[theme_name]
    w, h = 830, 190
    n = len(PHASES)
    gap = 18
    box_w = (w - 2 * 24 - gap * (n - 1)) / n
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
           f'aria-label="The GodMode pipeline: define, plan, execute, review, ship. Each phase is a gate.">',
           f'<rect width="0" height="0"><animate id="loop" attributeName="x" from="0" to="0" dur="{loop}s" repeatCount="indefinite"/></rect>']
    accent = ["blue", "violet", "amber", "cyan", "green"]
    for i, (name, skills) in enumerate(PHASES):
        x = 24 + i * (box_w + gap)
        begin = f"loop.begin+{i * 2.4 + 0.4:.2f}s"
        col = t[accent[i]]
        out.append(f'<g>'
                   f'<rect x="{x:.1f}" y="40" width="{box_w:.1f}" height="92" rx="10" fill="{t["frame"]}" stroke="{t["border"]}"/>'
                   f'<rect x="{x:.1f}" y="40" width="{box_w:.1f}" height="92" rx="10" fill="none" stroke="{col}" stroke-width="2" opacity="0">'
                   f'<set attributeName="opacity" to="1" begin="{begin}" end="loop.end"/><set attributeName="opacity" to="0" begin="loop.begin"/></rect>'
                   f'<text x="{x + box_w / 2:.1f}" y="72" text-anchor="middle" font-family="{SANS}" font-size="15" font-weight="700" fill="{t["text"]}">{name}</text>')
        for j, sk in enumerate(skills.split(" · ")):
            out.append(f'<text x="{x + box_w / 2:.1f}" y="{94 + j * 15}" text-anchor="middle" font-family="{MONO}" font-size="10.5" fill="{t["muted"]}">{esc(sk)}</text>')
        # Gate marker under the box: a lock that opens.
        out.append(f'<text x="{x + box_w / 2:.1f}" y="160" text-anchor="middle" font-family="{SANS}" font-size="12" fill="{t["dim"]}">gate</text>'
                   f'<text x="{x + box_w / 2:.1f}" y="160" text-anchor="middle" font-family="{SANS}" font-size="12" font-weight="600" fill="{col}" opacity="0">'
                   f'<set attributeName="opacity" to="1" begin="loop.begin+{i * 2.4 + 2.0:.2f}s" end="loop.end"/><set attributeName="opacity" to="0" begin="loop.begin"/>passed</text>')
        out.append("</g>")
        if i < n - 1:
            ax = x + box_w + 2
            out.append(f'<path d="M{ax:.1f},86 L{ax + gap - 4:.1f},86" stroke="{t["dim"]}" stroke-width="2"/>'
                       f'<path d="M{ax + gap - 9:.1f},81 L{ax + gap - 4:.1f},86 L{ax + gap - 9:.1f},91" fill="none" stroke="{t["dim"]}" stroke-width="2"/>')
    out.append(f'<text x="24" y="24" font-family="{SANS}" font-size="13" fill="{t["muted"]}">The agent cannot move to the next phase until the current gate has evidence.</text>')
    out.append("</svg>")
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------------------
# Scenes
# ---------------------------------------------------------------------------

SCENES = [
    Scene(
        name="hero",
        title="GodMode in Claude Code",
        caption="claude · my-saas · godmode 2.0",
        alt="A Claude Code session with GodMode: the agent questions the request, checks current docs, plans, dispatches a tested implementation, reviews it and proves the result before saying done",
        loop=26,
        lines=[
            user(0.3, "add subscription billing with Stripe"),
            skill(1.2, "rationale", "to check the work is worth doing"),
            dim(2.0, "Problem: 3 paid tiers, no billing today. Effort: substantial. Stripe Billing covers 90%.", 1),
            skill(3.2, "intent-discovery", "to pin down the design before any code"),
            dim(4.0, "One question at a time → design doc saved to docs/plans/2026-10-25-billing-design.md", 1),
            skill(5.2, "grounding", "to verify Stripe's current API instead of trusting memory"),
            ok(6.2, "docs.stripe.com/api/subscriptions (2026-10) · webhooks need idempotency keys · cited"),
            skill(7.4, "task-planning", "to write 7 tasks of 2-5 minutes each"),
            skill(8.4, "delegated-execution", "to run the plan with a fresh subagent per task"),
            spinner(9.3, "Task 1/7 webhook handler · test-first · implementer: sonnet", 12.0),
            ok(12.3, "spec review passed · code review passed · 2 commits"),
            spinner(13.2, "Task 2/7 subscription CRUD · implementer: sonnet", 15.6),
            ok(15.9, "spec review passed · code review passed · 3 commits"),
            dim(16.8, "… tasks 3-7 …", 1),
            skill(18.0, "cross-model-review", "for a second opinion from a different model family"),
            warn(19.0, "codex: webhook retries can double-charge → fixed with event-id dedupe, re-reviewed"),
            skill(20.2, "completion-gate", "to prove it before claiming it"),
            ok(21.2, "npm test · 84 passed, 0 failed · exit 0"),
            ok(22.0, "npm run lint · 0 errors · npm run build · exit 0"),
            agent(23.2, ("Done: 7 tasks, 19 commits on feature/billing. Merge, open a PR, keep it, or discard?", "text")),
        ],
    ),
]

# The two halves of the comparison picture (rendered side by side, 12 px type,
# so each line has about 48 characters).
WITHOUT = Scene(
    name="without",
    title="Without GodMode",
    alt="Without GodMode the agent codes immediately from memory and declares success without running anything.",
    loop=14,
    lines=[
        user(0.3, "add Stripe subscription billing"),
        agent(1.2, ("Sure! Creating the billing files now…", "text")),
        dim(2.2, "+ src/billing/stripe.ts", 1),
        dim(2.6, "  stripe v8 calls from memory (removed 2023)", 1),
        dim(3.2, "+ src/billing/webhook.ts", 1),
        dim(3.6, "  no signature check, no idempotency", 1),
        dim(4.2, "+ src/routes/billing.ts", 1),
        dim(4.6, "  duplicates the existing route helper", 1),
        agent(5.6, ("Done! Billing should work now.", "text")),
        blank(6.0),
        fail(7.0, "no questions, no design, no docs checked"),
        fail(7.8, "no tests written, nothing run"),
        fail(8.6, "\"should work\" is the only evidence"),
        fail(9.4, "you debug code you did not write"),
    ],
)

WITH = Scene(
    name="with",
    title="With GodMode",
    alt="With GodMode the same request is questioned, designed, grounded in current docs, planned, built test-first and proven.",
    loop=14,
    lines=[
        user(0.3, "add Stripe subscription billing"),
        skill(1.2, "rationale", ""),
        dim(1.6, "worth building? does Stripe Billing suffice?", 1),
        skill(2.4, "intent-discovery", ""),
        dim(2.8, "one question at a time → agreed design doc", 1),
        skill(3.6, "grounding", ""),
        dim(4.0, "current Stripe docs fetched and cited", 1),
        skill(4.8, "task-planning", ""),
        dim(5.2, "7 tasks, exact files, tests, commands", 1),
        skill(6.0, "delegated-execution", ""),
        dim(6.4, "fresh subagent per task, two reviews each", 1),
        skill(7.2, "completion-gate", ""),
        dim(7.6, "tests, lint, build run and read first", 1),
        ok(8.8, "84 tests · 0 failures · 19 commits · sources"),
    ],
)

SCENES += [
    Scene(
        name="grounding",
        title="Grounding: web search is the source of truth",
        caption="godmode:grounding",
        alt="The grounding skill refuses to code against a library from memory, fetches the current documentation and records the sources",
        loop=16,
        lines=[
            user(0.3, "wire up the new Anthropic SDK streaming helper"),
            skill(1.2, "grounding", "because SDK method names change faster than model memory"),
            dim(2.1, "Fact that can change: SDK streaming API → must be verified before any code", 1),
            spinner(3.0, "Context7 · anthropic-sdk-typescript · query: streaming helpers", 5.2),
            spinner(5.5, "WebFetch · docs.claude.com · messages streaming", 7.4),
            ok(7.8, "client.messages.stream() · .on('text') · finalMessage() · verified 2026-10-25"),
            warn(8.8, "memory said messages.create({stream:true}) + manual SSE parsing → outdated, not used"),
            dim(9.8, "Sources recorded in the plan: 2 URLs, library version pinned", 1),
            agent(11.0, ("Writing the client against the verified API. Tests first.", "text")),
        ],
    ),
    Scene(
        name="teams",
        title="Execution routing",
        caption="godmode:using-godmode · execution mode",
        alt="GodMode picks the cheapest execution mode that fits: direct, delegated, parallel, or an agent team, and names the model for every dispatch",
        loop=18,
        lines=[
            user(0.3, "migrate 4 modules from callbacks to async, keep the public API"),
            skill(1.2, "using-godmode", "to pick an execution mode"),
            dim(2.1, "Single step? no · independent parts? yes · must agree on conventions mid-work? yes", 1),
            agent(3.2, ("→ Agent team: 3 teammates, strict file ownership, lead integrates at the end", "text")),
            skill(4.4, "model-routing", "to size each seat"),
            dim(5.2, "teammates: sonnet · reviewers: sonnet · final whole-branch review: opus", 1),
            spinner(6.4, "auth-module    · worktree wt/auth    · 12 functions", 10.0),
            spinner(6.9, "queue-module   · worktree wt/queue   · 9 functions", 10.6),
            spinner(7.4, "storage-module · worktree wt/storage · 15 functions", 11.4),
            dim(8.6, "queue → auth: \"error type for timeouts?\"  auth: \"TimeoutError from errors.ts\"", 1),
            ok(12.0, "3 worktrees merged · full suite 212 passed · public API diff: none"),
            skill(13.2, "merge-protocol", "to land it"),
        ],
    ),
]


def main():
    if "--list" in sys.argv:
        print("\n".join(s.name for s in SCENES) + "\npipeline")
        return
    ASSETS.mkdir(exist_ok=True)
    for scene in SCENES:
        for theme, suffix in (("dark", ""), ("light", "-light")):
            out = ASSETS / f"{scene.name}{suffix}.svg"
            out.write_text(render_scene(scene, theme), encoding="utf-8", newline="\n")
            print("wrote", out.relative_to(REPO_ROOT), out.stat().st_size // 1024, "KB")
    for theme, suffix in (("dark", ""), ("light", "-light")):
        out = ASSETS / f"pipeline{suffix}.svg"
        out.write_text(render_pipeline(theme), encoding="utf-8", newline="\n")
        print("wrote", out.relative_to(REPO_ROOT), out.stat().st_size // 1024, "KB")
        out = ASSETS / f"comparison{suffix}.svg"
        out.write_text(render_comparison(WITHOUT, WITH, theme), encoding="utf-8", newline="\n")
        print("wrote", out.relative_to(REPO_ROOT), out.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
