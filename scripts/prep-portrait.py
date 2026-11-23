"""Prepare a portrait photo for PortraitAnimation.

    python scripts/prep-portrait.py <photo> [--crop x0,y0,x1,y1] [--bg-threshold 0.86]
                                   [--mask x,y x,y ...] [--gamma 0.75] [--out public/images/portrait-tone.png]

Output: 440x440 PNG, subject in RGB (grayscale), background transparent.
Contrast inside the subject is stretched (2nd-97th percentile) so a flat or
backlit photo still separates into steps. The component does the dithering.

    --crop          square crop in source pixels; defaults to the full image (centred square)
    --bg-threshold  luminance above which a pixel is background (plain light wall / sky)
    --mask          optional keep-polygon in source pixels for busy backgrounds
    --gamma         < 1 lifts midtones (backlit faces), 1 leaves them
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('photo')
ap.add_argument('--crop')
ap.add_argument('--bg-threshold', type=float, default=0.86)
ap.add_argument('--mask', nargs='*')
ap.add_argument('--gamma', type=float, default=0.75)
ap.add_argument('--out', default='public/images/portrait-tone.png')
args = ap.parse_args()

src = Image.open(args.photo).convert('L')
if args.mask:
    poly = [tuple(int(v) for v in p.split(',')) for p in args.mask]
    m = Image.new('L', src.size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    src = Image.composite(src, Image.new('L', src.size, 255), m)

if args.crop:
    x0, y0, x1, y1 = (int(v) for v in args.crop.split(','))
else:
    w, h = src.size
    s = min(w, h)
    x0, y0 = (w - s) // 2, (h - s) // 2
    x1, y1 = x0 + s, y0 + s
crop = src.crop((x0, y0, x1, y1)).resize((440, 440), Image.LANCZOS)

a = np.array(crop).astype(float) / 255
subject = a < args.bg_threshold
vals = a[subject]
lo, hi = np.percentile(vals, 2), np.percentile(vals, 97)
tone = np.clip((a - lo) / max(hi - lo, 1e-6), 0, 1) ** args.gamma

out = np.zeros((440, 440, 4), dtype=np.uint8)
g = (tone * 255).astype(np.uint8)
out[..., 0] = g
out[..., 1] = g
out[..., 2] = g
out[..., 3] = np.where(subject, 255, 0)
Image.fromarray(out, 'RGBA').save(args.out)
print('wrote', args.out, 'subject range', round(lo, 3), round(hi, 3))
