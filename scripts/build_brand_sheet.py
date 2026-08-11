#!/usr/bin/env python3
"""Build a single-page CADsmart colour/logo/icon reference PDF."""

from pathlib import Path
from subprocess import run
from tempfile import TemporaryDirectory

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "CADsmart-brand-sheet.pdf"
W, H = 3508, 2480  # A4 landscape at 300 dpi

LIGHT = [
    ("paper", "#F4F1EA"), ("paper-dark", "#EBE7DC"),
    ("ink", "#1A2332"), ("ink-soft", "#3D4A5C"),
    ("ink-muted", "#6B7789"), ("line", "#B8B3A4"),
    ("line-soft", "#D4CFC0"), ("accent", "#C23A1E"),
    ("accent-dim", "#9D2F18"), ("accent-soft", "#E8D5CC"),
    ("blueprint", "#2C4A6B"), ("tag-sector", "#C26010"),
    ("tag-sector border", "#DDB060"), ("tag-CAD border", "#DDA090"),
]

DARK = [
    ("paper", "#0F1823"), ("paper-dark", "#0A1118"),
    ("ink", "#E8F0F9"), ("ink-soft", "#B8C7D6"),
    ("ink-muted", "#7A8EA3"), ("line", "#2A3A4D"),
    ("line-soft", "#1E2A39"), ("accent", "#FF7A5C"),
    ("accent-dim", "#E5624A"), ("accent-soft", "#3A2820"),
    ("blueprint", "#4A7FB5"), ("tag-sector", "#FFAA50"),
    ("tag-sector border", "#6A4210"), ("tag-CAD border", "#6A2A20"),
]


def font(size, bold=False):
    choices = (["/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc"] if bold else
               ["/System/Library/Fonts/Supplemental/Arial.ttf",
                "/System/Library/Fonts/Helvetica.ttc"])
    for path in choices:
        if Path(path).exists():
            return ImageFont.truetype(path, size, index=1 if bold and path.endswith(".ttc") else 0)
    return ImageFont.load_default()


F_TITLE, F_H2, F_BODY, F_SMALL, F_MONO = font(76, True), font(39, True), font(27), font(21), font(25, True)


def text(draw, xy, value, fill, fnt=F_BODY, anchor=None):
    draw.text(xy, value, fill=fill, font=fnt, anchor=anchor)


def palette(draw, title, items, x, y, width, dark=False):
    text(draw, (x, y), title, "#E8F0F9" if dark else "#1A2332", F_H2)
    y += 64
    cols, gap = 2, 22
    sw = (width - gap) // cols
    sh = 76
    for i, (name, value) in enumerate(items):
        cx = x + (i % cols) * (sw + gap)
        cy = y + (i // cols) * (sh + 17)
        draw.rounded_rectangle((cx, cy, cx + sw, cy + sh), 10, fill=value,
                               outline="#637083" if dark else "#A8A294", width=2)
        rgb = tuple(int(value[j:j+2], 16) for j in (1, 3, 5))
        lum = sum(rgb) / 3
        fg = "#FFFFFF" if lum < 125 else "#101820"
        text(draw, (cx + 18, cy + 14), name, fg, F_SMALL)
        text(draw, (cx + 18, cy + 43), value, fg, F_SMALL)


def fit_image(canvas, image, box):
    x1, y1, x2, y2 = box
    img = image.copy()
    img.thumbnail((x2 - x1, y2 - y1), Image.Resampling.LANCZOS)
    x = x1 + (x2 - x1 - img.width) // 2
    y = y1 + (y2 - y1 - img.height) // 2
    canvas.alpha_composite(img.convert("RGBA"), (x, y))


def main():
    canvas = Image.new("RGBA", (W, H), "#F4F1EA")
    d = ImageDraw.Draw(canvas)
    # Drafting-paper grid.
    for step, color, width in ((80, "#DDD8CC", 1), (400, "#C6C0B2", 2)):
        for x in range(0, W, step): d.line((x, 0, x, H), fill=color, width=width)
        for y in range(0, H, step): d.line((0, y, W, y), fill=color, width=width)

    d.rectangle((0, 0, W, 185), fill="#1A2332")
    text(d, (120, 43), "CADsmart — BRAND SHEET", "#F4F1EA", F_TITLE)
    text(d, (3380, 94), "v1 / 2026", "#FF7A5C", F_MONO, "ra")

    margin, gutter = 120, 55
    col_w = (W - 2 * margin - gutter) // 2
    left_x, right_x = margin, margin + col_w + gutter
    top, palette_h = 240, 815

    d.rounded_rectangle((left_x, top, left_x + col_w, top + palette_h), 22, fill="#F4F1EA", outline="#B8B3A4", width=3)
    d.rounded_rectangle((right_x, top, right_x + col_w, top + palette_h), 22, fill="#0F1823", outline="#2A3A4D", width=3)
    palette(d, "KOLORYSTYKA JASNA", LIGHT, left_x + 42, top + 34, col_w - 84)
    palette(d, "KOLORYSTYKA CIEMNA", DARK, right_x + 42, top + 34, col_w - 84, True)

    lower_y = 1105
    d.rounded_rectangle((margin, lower_y, W - margin, H - 115), 22, fill="#FAF8F2", outline="#B8B3A4", width=3)
    text(d, (margin + 42, lower_y + 34), "LOGOTYPY I ZNAKI", "#1A2332", F_H2)

    with TemporaryDirectory() as td:
        td = Path(td)
        rendered = {}
        for name in ("logo-light", "logo-dark", "favicon"):
            src = ROOT / "assets" / f"{name}.svg"
            dst = td / f"{name}.png"
            run(["rsvg-convert", "-w", "1400", "-o", str(dst), str(src)], check=True)
            rendered[name] = Image.open(dst).convert("RGBA")

        # Logo presentation cards.
        card_y1, card_y2 = lower_y + 105, lower_y + 580
        half = (W - 2 * margin - 3 * 42) // 2
        boxes = [(margin + 42, card_y1, margin + 42 + half, card_y2),
                 (margin + 84 + half, card_y1, W - margin - 42, card_y2)]
        for box, bg, key, label, fg in [
            (boxes[0], "#F4F1EA", "logo-light", "LOGO — LIGHT", "#1A2332"),
            (boxes[1], "#0F1823", "logo-dark", "LOGO — DARK", "#E8F0F9")]:
            d.rounded_rectangle(box, 18, fill=bg, outline="#B8B3A4", width=2)
            fit_image(canvas, rendered[key], (box[0] + 55, box[1] + 55, box[2] - 55, box[2] and box[3] - 55))
            text(d, (box[0] + 25, box[3] - 38), label, fg, F_SMALL)

        icon_y = lower_y + 635
        text(d, (margin + 42, icon_y), "IKONY / ELEMENTY UI", "#1A2332", F_H2)
        icon_y += 68
        # Branded app mark.
        icon_box = (margin + 42, icon_y, margin + 290, icon_y + 248)
        d.rounded_rectangle(icon_box, 18, fill="#0F1823")
        fit_image(canvas, rendered["favicon"], (icon_box[0] + 20, icon_box[1] + 20, icon_box[2] - 20, icon_box[3] - 20))
        text(d, (margin + 42, icon_y + 270), "ZNAK / APP ICON", "#1A2332", F_SMALL)
        text(d, (margin + 42, icon_y + 302), "SVG · ICO · PNG 32 · PNG 180", "#6B7789", F_SMALL)

        # UI glyphs actually used by the site.
        glyphs = [("@", "E-MAIL"), ("in", "LINKEDIN"), ("</>", "WWW"), ("PDF", "PORTFOLIO"),
                  ("sun", "LIGHT"), ("moon", "DARK"), ("menu", "MENU")]
        start_x = margin + 385
        cell_w = 365
        for i, (glyph, label) in enumerate(glyphs):
            x = start_x + i * cell_w
            d.rectangle((x, icon_y + 36, x + 138, icon_y + 174), outline="#1A2332", width=4)
            cx, cy = x + 69, icon_y + 105
            if glyph == "sun":
                d.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), outline="#1A2332", width=5)
                for dx, dy in ((0, -39), (0, 39), (-39, 0), (39, 0), (-28, -28), (28, 28), (-28, 28), (28, -28)):
                    d.line((cx + dx * .72, cy + dy * .72, cx + dx, cy + dy), fill="#1A2332", width=5)
            elif glyph == "moon":
                d.ellipse((cx - 29, cy - 31, cx + 29, cy + 31), fill="#1A2332")
                d.ellipse((cx - 7, cy - 36, cx + 34, cy + 19), fill="#FAF8F2")
            elif glyph == "menu":
                for offset in (-22, 0, 22):
                    d.rounded_rectangle((cx - 34, cy + offset - 3, cx + 34, cy + offset + 3), 3, fill="#1A2332")
            else:
                text(d, (cx, cy), glyph, "#1A2332", font(34 if len(glyph) > 2 else 49, True), "mm")
            text(d, (x + 69, icon_y + 208), label, "#3D4A5C", F_SMALL, "ma")

    text(d, (margin, H - 63), "Źródło: css/style.css + assets/  •  Fonty projektu: IBM Plex Sans / Mono / Serif", "#6B7789", F_SMALL)
    canvas.convert("RGB").save(OUT, "PDF", resolution=300.0, quality=95)
    print(OUT)


if __name__ == "__main__":
    main()
