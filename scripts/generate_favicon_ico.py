#!/usr/bin/env python3
"""Write public/favicon.ico from public/favicon.svg (multi-size ICO)."""
from __future__ import annotations

import io
import sys
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "public" / "favicon.svg"
OUT = ROOT / "public" / "favicon.ico"
SIZES = (16, 32, 48)


def main() -> int:
    if not SVG.is_file():
        print(f"Missing {SVG}", file=sys.stderr)
        return 1
    data = SVG.read_text(encoding="utf-8")
    images: list[Image.Image] = []
    for size in SIZES:
        png = cairosvg.svg2png(bytestring=data.encode("utf-8"), output_width=size, output_height=size)
        images.append(Image.open(io.BytesIO(png)).convert("RGBA"))
    # Pillow writes multi-size ICO when given a list
    images[0].save(OUT, format="ICO", sizes=[(s, s) for s in SIZES], append_images=images[1:])
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
