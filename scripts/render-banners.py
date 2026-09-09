#!/usr/bin/env python3
"""
Render the brand banners: the same night as the hero, the lamp on the
right, its beams sweeping, and "Build what / lights the way."

    python3 scripts/render-banners.py

Writes public/brand/banners/. Needs Pillow and numpy. Fonts are the site's
own (Bricolage Grotesque and Geist), fetched from Google's font repo into a
cache directory on first run.
"""
import math
import os
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "brand" / "banners"
FONT_DIR = Path(os.environ.get("BEACON_FONT_DIR", Path.home() / ".cache" / "beacon-fonts"))
FONTS = {
    "Bricolage.ttf": "https://github.com/google/fonts/raw/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf",
    "Geist.ttf": "https://github.com/google/fonts/raw/main/ofl/geist/Geist%5Bwght%5D.ttf",
}

PAPER = np.array([15, 14, 12], np.float32)
AMBER = np.array([255, 178, 40], np.float32)
CREAM = (245, 242, 234)
AMBER_RGB = (255, 178, 40)
AMBER_TEXT = (255, 190, 92)
INK2 = (196, 191, 178)
INK3 = (148, 142, 128)

SS = 2  # supersample, downscaled at the end

# name, width, height, layout
#   text_x: where the text block starts (fraction of width)
#   lamp_x: lamp centre (fraction of width); lamp_r: lamp radius (fraction of height)
#   tag: tagline size (fraction of height); meta: which meta line
BANNERS = [
    ("discord-server-banner-960x540", 960, 540, dict(text_x=0.07, text_y=0.56, lamp_x=0.78, lamp_r=0.30, tag=0.19, meta="full")),
    ("discord-invite-splash-1920x1080", 1920, 1080, dict(text_x=0.09, text_y=0.5, lamp_x=0.76, lamp_r=0.30, tag=0.17, meta="full")),
    ("linkedin-post-1200x627", 1200, 627, dict(text_x=0.08, text_y=0.5, lamp_x=0.77, lamp_r=0.30, tag=0.18, meta="full")),
    ("linkedin-profile-banner-1584x396", 1584, 396, dict(text_x=0.24, text_y=0.5, lamp_x=0.83, lamp_r=0.36, tag=0.26, meta="short")),
    ("x-header-1500x500", 1500, 500, dict(text_x=0.24, text_y=0.5, lamp_x=0.82, lamp_r=0.34, tag=0.24, meta="short")),
    ("linkedin-company-cover-1128x191", 1128, 191, dict(text_x=0.24, text_y=0.5, lamp_x=0.86, lamp_r=0.36, tag=0.3, meta="none")),
]

META = {
    "full": "A free one day hackathon for Bay Area high schoolers  ·  Target Jan 30, 2027  ·  Belmont, CA",
    "short": "Free  ·  Bay Area high schoolers  ·  Target Jan 30, 2027",
    "none": "",
}


def fonts():
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for name, url in FONTS.items():
        path = FONT_DIR / name
        if not path.exists():
            print("fetching", name)
            urllib.request.urlretrieve(url, path)
    return FONT_DIR / "Bricolage.ttf", FONT_DIR / "Geist.ttf"


def display(path, size):
    f = ImageFont.truetype(str(path), size)
    f.set_variation_by_axes([96, 700, 100])  # optical size, weight, width
    return f


def sans(path, size, weight=500):
    f = ImageFont.truetype(str(path), size)
    f.set_variation_by_axes([weight])
    return f


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def night(w, h, lamp_x, lamp_y, lamp_r, text_end):
    """The background as a float RGB array: grid, beams, glow, scrim, grain."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rgb = np.tile(PAPER, (h, w, 1))

    # hairline grid, fading toward the edges like the closing band
    cell = 72 * SS
    gx = np.abs(((xx + cell / 2) % cell) - cell / 2) < 0.6 * SS
    gy = np.abs(((yy + cell / 2) % cell) - cell / 2) < 0.6 * SS
    fade = smooth(0.95, 0.25, np.hypot((xx / w - 0.5) * 1.6, (yy / h - 0.5) * 1.1))
    grid = ((gx | gy).astype(np.float32) * 0.055 * fade)[..., None]
    rgb = rgb * (1 - grid) + np.array([245, 242, 234]) * grid

    # the lamp's light
    dx, dy = xx - lamp_x, yy - lamp_y
    dist = np.hypot(dx, dy)
    ang = np.arctan2(dy, dx)
    amber = np.zeros((h, w), np.float32)

    def beam(theta, half, strength, reach):
        rel = np.angle(np.exp(1j * (ang - theta)))
        edge = smooth(half, half * 0.3, np.abs(rel))
        fall = np.clip(1 - dist / reach, 0, 1) ** 1.4
        near = smooth(0.0, lamp_r * 0.9, dist)
        return edge * fall * near * strength

    amber += beam(math.radians(-158), math.radians(9), 0.42, w * 1.05)   # up and left, behind the words
    amber += beam(math.radians(22), math.radians(9), 0.5, w * 0.8)       # down and right, out of frame
    amber += 0.38 * np.clip(1 - dist / (lamp_r * 2.6), 0, 1) ** 1.6      # warmth around the lamp
    amber += 0.10 * np.clip(1 - dist / (h * 1.1), 0, 1) ** 1.2           # the room, faintly lit
    a = np.clip(amber, 0, 1)[..., None]
    rgb = rgb * (1 - a) + AMBER * a

    # scrim behind the text, so the beam never fights the words
    s = smooth(text_end + w * 0.12, text_end - w * 0.35, xx) * 0.72
    rgb = rgb * (1 - s[..., None]) + PAPER * s[..., None]

    # grain
    rng = np.random.default_rng(1867)
    rgb += rng.normal(0, 2.2, (h, w, 1)).astype(np.float32)
    return rgb, dist


def lamp(rgb, dist, lamp_r):
    """Rings, glow and the core, drawn into the background array."""
    d = dist / lamp_r
    a = np.zeros(d.shape, np.float32)
    a += smooth(0.014, 0, np.abs(d - 0.88)) * 0.18
    a += smooth(0.014, 0, np.abs(d - 0.57)) * 0.3
    a += 0.85 * np.clip(1 - d / 0.44, 0, 1) ** 1.3
    a += smooth(0.012, 0, d - 0.19)
    a = np.clip(a, 0, 1)[..., None]
    rgb = rgb * (1 - a) + AMBER * a
    hot = smooth(0.02, 0, d - 0.105)[..., None] * 0.55
    return rgb * (1 - hot) + np.array([255, 244, 220]) * hot


def tracked(draw, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking
    return x


def render(name, W, H, L, bric, geist):
    w, h = W * SS, H * SS
    lamp_x, lamp_y, lamp_r = L["lamp_x"] * w, h * 0.5, L["lamp_r"] * h
    text_x = L["text_x"] * w

    line1, line2 = "Build what", "lights the way."
    # the words stop short of the lamp's outer ring, whatever the aspect
    room = lamp_x - lamp_r * 0.95 - text_x
    tag_size = int(L["tag"] * h)
    while True:
        tag_font = display(bric, tag_size)
        tag_w = max(tag_font.getlength(line1), tag_font.getlength(line2))
        if tag_w <= room or tag_size < h * 0.08:
            break
        tag_size -= max(1, int(h * 0.005))

    rgb, dist = night(w, h, lamp_x, lamp_y, lamp_r, text_x + tag_w)
    rgb = lamp(rgb, dist, lamp_r)
    img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    draw = ImageDraw.Draw(img)

    # the text block, vertically centred on text_y
    mark_size = int(h * 0.058)
    mark_font = display(bric, mark_size)
    # the meta line keeps out of the rings too: the full line if it fits,
    # else the short one, shrunk a little before it is dropped
    meta_text = META[L["meta"]]
    meta_size = int(h * 0.052)
    meta_font = sans(geist, meta_size, 500)
    if meta_text and meta_font.getlength(meta_text) > room:
        meta_text = META["short"]
    while meta_text and meta_font.getlength(meta_text) > room:
        meta_size -= max(1, int(h * 0.003))
        if meta_size < h * 0.036:
            meta_text = ""
            break
        meta_font = sans(geist, meta_size, 500)
    url_font = sans(geist, int(h * 0.046), 600)

    leading = int(tag_size * 0.88)
    gap = int(h * 0.05)
    block_h = mark_size + gap + leading * 2 + (gap + meta_font.size if meta_text else 0) + gap * 0.9 + url_font.size
    y = L["text_y"] * h - block_h / 2

    # wordmark with its amber dot
    dot = mark_size * 0.34
    cy = y + mark_size * 0.62
    draw.ellipse((text_x, cy - dot / 2, text_x + dot, cy + dot / 2), fill=AMBER_RGB)
    tracked(draw, (text_x + dot + mark_size * 0.45, y), "BEACON HACKS", mark_font, CREAM, mark_size * 0.06)
    y += mark_size + gap

    draw.text((text_x - tag_size * 0.03, y), line1, font=tag_font, fill=CREAM)
    y += leading
    draw.text((text_x - tag_size * 0.03, y), line2, font=tag_font, fill=AMBER_RGB)
    y += leading

    if meta_text:
        y += gap
        draw.text((text_x, y), meta_text, font=meta_font, fill=INK2)
        y += meta_font.size

    y += gap * 0.9
    tracked(draw, (text_x, y), "BEACONHACKS.COM", url_font, AMBER_TEXT, url_font.size * 0.14)

    out = img.resize((W, H), Image.LANCZOS)
    out.save(OUT / f"{name}.png", optimize=True)
    return out


def main():
    bric, geist = fonts()
    OUT.mkdir(parents=True, exist_ok=True)
    for name, W, H, L in BANNERS:
        render(name, W, H, L, bric, geist)
        print(f"  {name}.png")


if __name__ == "__main__":
    sys.exit(main())
