#!/usr/bin/env python3
"""
Build public/favicon.svg, public/favicon.ico, and public/icon.svg from public/ucb.svg
so favicons use the same UCB wordmark as the app header.
"""
from __future__ import annotations

import base64
import io
import sys
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
UCB = ROOT / "public" / "ucb.svg"
OUT_SVG = ROOT / "public" / "favicon.svg"
OUT_ICON = ROOT / "public" / "icon.svg"
OUT_ICO = ROOT / "public" / "favicon.ico"
BG = "#2e3036"
ACCENT = "#f5c518"
INSET = 4
FAV_SIZES = (16, 32, 48)
TILE = 32
ICON_SIZE = 180
ACCENT_W_FRAC = 9 / 180  # same proportion as app icon


def _tint(svg: str) -> str:
    return svg.replace('fill="black"', f'fill="#f5f3ea"')


def _rasterize_wordmark(
    data: str,
    width: int,
    height: int,
) -> Image.Image:
    png = cairosvg.svg2png(bytestring=data.encode("utf-8"), output_width=width, output_height=height)
    return Image.open(io.BytesIO(png)).convert("RGBA")


def _composite_tile(
    mark: Image.Image,
    size: int,
) -> Image.Image:
    """Dark rounded tile + gold bar + bottom-centered UCB wordmark (same as app header)."""
    from PIL import ImageDraw

    r = int(size * 0.19)
    w_bar = max(1, int(size * 0.06))
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=r,
        fill=BG,
    )
    draw.rectangle((0, 0, w_bar, size - 1), fill=ACCENT)

    m_w, m_h = mark.size
    max_w = size - 2 * INSET
    max_h = int(size * 0.5)
    scale = min(max_w / m_w, max_h / m_h, 1.0)
    nw, nh = int(m_w * scale), int(m_h * scale)
    if (nw, nh) != (m_w, m_h):
        mark = mark.resize((nw, nh), Image.Resampling.LANCZOS)
    mx = (size - nw) // 2
    my = size - INSET - nh
    base.paste(mark, (mx, my), mark)
    return base


def _composite_icon_180(
    mark: Image.Image,
) -> Image.Image:
    """Larger 180x180 PWA / icon.svg tile."""
    w_bar = max(1, int(ICON_SIZE * ACCENT_W_FRAC))
    r = int(ICON_SIZE * 0.2)
    from PIL import ImageDraw

    base = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(
        (0, 0, ICON_SIZE - 1, ICON_SIZE - 1),
        radius=r,
        fill=BG,
    )
    draw.rectangle((0, 0, w_bar, ICON_SIZE - 1), fill=ACCENT)

    m_w, m_h = mark.size
    margin = int(ICON_SIZE * 0.1)
    max_w = ICON_SIZE - 2 * margin
    max_h = int(ICON_SIZE * 0.42)
    scale = min(max_w / m_w, max_h / m_h, 1.0)
    nw, nh = int(m_w * scale), int(m_h * scale)
    if (nw, nh) != (m_w, m_h):
        mark = mark.resize((nw, nh), Image.Resampling.LANCZOS)
    mx = (ICON_SIZE - nw) // 2
    my = ICON_SIZE - margin - nh
    base.paste(mark, (mx, my), mark)
    return base


def _png_to_data_uri(png: bytes) -> str:
    b64 = base64.standard_b64encode(png).decode("ascii")
    return f"data:image/png;base64,{b64}"


def main() -> int:
    if not UCB.is_file():
        print(f"Missing {UCB}", file=sys.stderr)
        return 1
    raw = UCB.read_text(encoding="utf-8")
    tinted = _tint(raw)

    # High-res source for downscaling
    mark_hi = _rasterize_wordmark(tinted, 800, int(800 * 954 / 1588))

    tile_32 = _composite_tile(mark_hi, TILE)
    buf = io.BytesIO()
    tile_32.save(buf, format="PNG")
    png_32 = buf.getvalue()
    b64_32 = _png_to_data_uri(png_32)

    OUT_SVG.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="UCB">
  <image href="{b64_32}" width="32" height="32" />
</svg>
''',
        encoding="utf-8",
    )
    print(f"Wrote {OUT_SVG}")

    icon_180 = _composite_icon_180(
        _rasterize_wordmark(tinted, 1200, int(1200 * 954 / 1588)),
    )
    buf180 = io.BytesIO()
    icon_180.save(buf180, format="PNG")
    b64_180 = _png_to_data_uri(buf180.getvalue())
    OUT_ICON.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="UCB Bookings">
  <image href="{b64_180}" width="180" height="180" />
</svg>
''',
        encoding="utf-8",
    )
    print(f"Wrote {OUT_ICON}")

    # Multi-size ICO from same compositor at 16/32/48
    images: list[Image.Image] = []
    for s in FAV_SIZES:
        mark = _rasterize_wordmark(tinted, 800, int(800 * 954 / 1588))
        img = _composite_tile(mark, s)
        images.append(img.convert("RGBA"))
    images[0].save(OUT_ICO, format="ICO", sizes=[(s, s) for s in FAV_SIZES], append_images=images[1:])
    print(f"Wrote {OUT_ICO}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
