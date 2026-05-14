# ============================================================
# resize_icons.py - Moltok icon normaliser
# ============================================================
# Tweakable settings - change these and re-run anytime

CANVAS_SIZE  = 512          # final image size in pixels (square)
PADDING      = 50           # breathing room on each side
BG_COLOUR    = (0, 0, 0)    # background colour (R, G, B)  -> black
PREFIX       = "m_"         # only process files starting with this
SCALE_UP     = True         # scale small icons UP to fill content area
CROP_WHITE   = True         # auto-crop MS Paint white borders

# ============================================================
from PIL import Image
import numpy as np
import glob, os, sys

CONTENT = CANVAS_SIZE - (PADDING * 2)

def crop_white_border(img):
    arr = np.array(img)
    is_white  = np.all(arr >= 250, axis=2)
    not_white = ~is_white
    rows = np.any(not_white, axis=1)
    cols = np.any(not_white, axis=0)
    if not rows.any():
        return img
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    return img.crop((cmin, rmin, cmax + 1, rmax + 1))

def process(filepath):
    img = Image.open(filepath).convert("RGB")
    if CROP_WHITE:
        img = crop_white_border(img)
    scale = min(CONTENT / img.width, CONTENT / img.height)
    if scale < 1 or (scale > 1 and SCALE_UP):
        new_w = int(img.width * scale)
        new_h = int(img.height * scale)
        img = img.resize((new_w, new_h), Image.NEAREST)
    canvas = Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), BG_COLOUR)
    x = (CANVAS_SIZE - img.width) // 2
    y = (CANVAS_SIZE - img.height) // 2
    canvas.paste(img, (x, y))
    canvas.save(filepath, "PNG")
    return img.size

# ============================================================
folder = sys.argv[1] if len(sys.argv) > 1 else "."
files  = sorted(glob.glob(os.path.join(folder, PREFIX + "*.png")))

if not files:
    print(f"No {PREFIX}*.png files found in '{folder}'.")
    sys.exit(1)

print(f"Processing {len(files)} icons -> {CANVAS_SIZE}x{CANVAS_SIZE}, {PADDING}px padding\n")
for f in files:
    size = process(f)
    print(f"  ok  {os.path.basename(f):40s}  content {size[0]}x{size[1]}")

print("\nDone.")
