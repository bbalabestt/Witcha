#!/usr/bin/env python3
"""
Turns the client's cat drawing (design/cat/client-cat-drawing.png, cropped from their Procreate file) into the
hero's peeking cat: background transparent, inside of the head cream, lines brand charcoal, and the two round
pupils lifted out so CatPeek can redraw them looking at the bowl.

Run: python3 scripts/build-cat-peek.py   (needs Pillow)
Writes src/assets/cat/cat-peek.png (pupils lifted out, for the hero) and src/assets/cat/cat-portrait.png (the
drawing as is, for the Academy section), and prints the pupil centres and radii that CatPeek.tsx uses.
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design/cat/client-cat-drawing.png"
OUT = ROOT / "src/assets/cat/cat-peek.png"
PORTRAIT = ROOT / "src/assets/cat/cat-portrait.png"

CREAM = (250, 246, 238)
CHARCOAL = (56, 56, 50)
INK = 128  # darker than this is a line

# Rough eye boxes in the source, found by eye; the pupils are measured inside them.
EYE_BOXES = {"left": (130, 240, 230, 315), "right": (285, 235, 385, 315)}

src = Image.open(SRC).convert("L")
W, H = src.size
lum = src.load()

# Thick ink only (the pupils): erode away strokes, then grow back inside the ink.
dark = src.point(lambda v: 255 if v < INK else 0)
thick = dark.filter(ImageFilter.MinFilter(11)).filter(ImageFilter.MaxFilter(13)).load()
dk = dark.load()

pupils = {}
for name, (x0, y0, x1, y1) in EYE_BOXES.items():
    pts = [(x, y) for x in range(x0, x1) for y in range(y0, y1) if thick[x, y] and dk[x, y]]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
    r = ((max(xs) - min(xs)) + (max(ys) - min(ys))) / 4
    pupils[name] = (round(cx, 1), round(cy, 1), round(r, 1))

# Outside the head: light pixels connected to the border.
edge = [(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)]
outside = {p for p in edge if lum[p] >= INK}
queue = deque(outside)
while queue:
    x, y = queue.popleft()
    for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= n[0] < W and 0 <= n[1] < H and n not in outside and lum[n] >= INK:
            outside.add(n)
            queue.append(n)


def in_pupil(x, y):
    for cx, cy, r in pupils.values():
        if (x - cx) ** 2 + (y - cy) ** 2 <= (r + 1.5) ** 2 and lum[x, y] < 200:
            return True
    return False


def render(lift_pupils):
    out = Image.new("RGBA", (W, H))
    op = out.load()
    for y in range(H):
        for x in range(W):
            ink = 1 - lum[x, y] / 255  # 0 = paper, 1 = full line
            if (x, y) in outside:
                op[x, y] = (*CHARCOAL, round(ink * 255)) if ink > 0.06 else (0, 0, 0, 0)
            elif lift_pupils and in_pupil(x, y):
                op[x, y] = (*CREAM, 255)
            else:
                op[x, y] = tuple(round(c + (k - c) * ink) for c, k in zip(CREAM, CHARCOAL)) + (255,)
    return out


OUT.parent.mkdir(parents=True, exist_ok=True)
for path, lift in ((OUT, True), (PORTRAIT, False)):
    render(lift).save(path, optimize=True)
    print(f"{path.relative_to(ROOT)} {W}x{H}")
for name, (cx, cy, r) in pupils.items():
    print(f"{name} pupil: cx={cx} cy={cy} r={r}")
