#!/usr/bin/env python3
"""
Builds the "clean plate" for the English version of the Comfort Zone film.

The Hebrew master has two kinds of baked-in text: burned-in subtitles along
the bottom, and 3D words / thought ribbons animated inside the picture. The
Remotion composition (src/comfort-zone) overlays English versions of both, so
this script first removes the Hebrew from the pixels:

  * Subtitles: within each cue, white pixels with a dark halo in the subtitle
    band are inpainted (Telea).
  * 3D words (drone shots): the background drifts slowly, so the previous
    clean frame, shifted by the measured camera motion, is the reference.
    Inside the sky band every pixel that differs from it is filled from it,
    frame after frame; the words (which move against the background) vanish
    while the clouds and hills, which match the reference, are left alone. The
    first frame of a shot that already shows a word is inpainted from the
    hand-keyed track in src/comfort-zone/data/words.json.
  * Thought ribbons and the close-up words (static camera): a temporal median
    of the shot is the background. Bright moving pixels are replaced by it;
    inside the actor's box they are inpainted instead so he keeps his edges.

Usage:
  python3 tools/comfort-zone/clean_plate.py public/video/comfort-zone-he.mp4 \
      public/video/comfort-zone-clean.mp4 [--from S --to S] [--preview DIR]

With --preview, sample frames (every second of the range) are written as JPEG
side by side with the source instead of encoding a video.

Requires opencv-python-headless and numpy; ffmpeg must be on PATH for the encode.
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
WORDS = json.load(open(os.path.join(ROOT, "src/comfort-zone/data/words.json"), encoding="utf-8"))
# Where the Hebrew subtitles are burned into the master (not the English cues).
CUES = json.load(open(os.path.join(ROOT, "src/comfort-zone/data/burned-in-he.json"), encoding="utf-8"))
FPS = WORDS["fps"]

# Subtitle band in the master (1920x1080).
SUB_Y0, SUB_Y1, SUB_X0, SUB_X1 = 950, 1060, 250, 1670

# Frames of clean history kept per drone shot (see the fade-in note below).
HISTORY = 14

# Drone shots with 3D words: the band of sky the words live in.
SKY_SHOTS = [
    {"name": "ideal-real", "frames": [1409, 1548], "band": (60, 420, 1900, 650)},
    {"name": "names", "frames": [2166, 2377], "band": (60, 270, 1900, 660)},
    {"name": "adjectives", "frames": [4417, 4505], "band": (60, 270, 1900, 660)},
]

# Static-camera shots: region of interest and the "dynamic" box (the actor),
# where the median plate must not be used.
STATIC_SHOTS = [
    {"name": "ribbons", "frames": WORDS["ribbonShot"], "roi": (420, 150, 1500, 790), "dynamic": (820, 560, 1190, 790),
     "sigma": 12, "contrast": 16, "diff": 26, "bright": 150},
    {"name": "closeup", "frames": WORDS["closeupShot"], "roi": (0, 0, 1920, 345), "dynamic": (990, 0, 1360, 345),
     "sigma": 20, "contrast": 20, "diff": 30, "bright": 170},
]


def lerp_key(keys, f, lead=6):
    """Linear interpolation of a word's track at frame f (None outside the keys).

    The first box is also used for `lead` frames before the first key, so the
    word is caught while it is still fading in."""
    if keys[0]["f"] - lead <= f < keys[0]["f"]:
        return {k: keys[0][k] for k in ("x", "y", "w", "h")}
    if f < keys[0]["f"] or f > keys[-1]["f"]:
        return None
    for a, b in zip(keys, keys[1:]):
        if a["f"] <= f <= b["f"]:
            t = 0 if b["f"] == a["f"] else (f - a["f"]) / (b["f"] - a["f"])
            return {k: a[k] + (b[k] - a[k]) * t for k in ("x", "y", "w", "h")}
    return None


def contrast_mask(bgr, sigma, thr, bright, sat_max=80):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2].astype(np.int16)
    bg = cv2.GaussianBlur(hsv[:, :, 2], (0, 0), sigma).astype(np.int16)
    return ((v - bg > thr) & (v > bright) & (hsv[:, :, 1] < sat_max)).astype(np.uint8)


def inpaint_region(frame, mask, x0, y0, x1, y1, radius=5):
    """Inpaint `mask` inside the box only, working on a crop for speed."""
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(frame.shape[1], x1), min(frame.shape[0], y1)
    sub = mask[y0:y1, x0:x1]
    if not sub.any():
        return
    frame[y0:y1, x0:x1] = cv2.inpaint(frame[y0:y1, x0:x1], sub, radius, cv2.INPAINT_TELEA)


def feather_fill(frame, source, mask, blur=9):
    """Replace masked pixels with `source`, with a soft edge."""
    a = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), blur / 3)[..., None]
    a = np.clip(a * 1.5, 0, 1)
    frame[:] = (frame * (1 - a) + source * a).astype(np.uint8)


def remove_subtitles(frame):
    band = frame[SUB_Y0:SUB_Y1, SUB_X0:SUB_X1]
    g = cv2.cvtColor(band, cv2.COLOR_BGR2GRAY)
    white = g > 200
    halo = cv2.erode(g, np.ones((9, 9), np.uint8)) < 140
    m = (white & halo).astype(np.uint8)
    if m.sum() < 60:
        return
    m = cv2.dilate(m, np.ones((5, 5), np.uint8), iterations=3)
    frame[SUB_Y0:SUB_Y1, SUB_X0:SUB_X1] = cv2.inpaint(band, m, 3, cv2.INPAINT_TELEA)


class StaticShot:
    def __init__(self, cfg, cap):
        self.cfg = cfg
        f0, f1 = cfg["frames"]
        frames = []
        for f in range(f0, f1, 3):
            cap.set(cv2.CAP_PROP_POS_FRAMES, f)
            ok, im = cap.read()
            if ok:
                frames.append(im)
        self.median = np.median(np.stack(frames), axis=0).astype(np.uint8)

    def apply(self, frame):
        c = self.cfg
        x0, y0, x1, y1 = c["roi"]
        roi = np.zeros(frame.shape[:2], np.uint8)
        roi[y0:y1, x0:x1] = 1
        m = contrast_mask(frame, c["sigma"], c["contrast"], c["bright"])
        diff = np.abs(frame.astype(np.int16) - self.median.astype(np.int16)).max(axis=2) > c["diff"]
        m = (m & diff & roi).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 9), np.uint8))
        m = cv2.dilate(m, np.ones((5, 5), np.uint8), iterations=2)
        dx0, dy0, dx1, dy1 = c["dynamic"]
        dyn = np.zeros_like(m)
        dyn[dy0:dy1, dx0:dx1] = 1
        feather_fill(frame, self.median, m * (1 - dyn), blur=5)
        inpaint_region(frame, m * dyn, dx0, dy0, dx1, dy1, radius=4)


def process(args):
    cap = cv2.VideoCapture(args.src)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    f0 = 0 if args.frm is None else int(round(args.frm * FPS))
    f1 = n if args.to is None else min(n, int(round(args.to * FPS)))

    statics = []
    for cfg in STATIC_SHOTS:
        s0, s1 = cfg["frames"]
        if s1 > f0 and s0 < f1:
            print(f"median plate for {cfg['name']}...", file=sys.stderr)
            statics.append(StaticShot(cfg, cap))

    skies = []
    for cfg in SKY_SHOTS:
        s0, s1 = cfg["frames"]
        if s1 > f0 and s0 < f1:
            if f0 > s0:
                sys.exit(f"--from must not start inside the {cfg['name']} shot (frame {s0}); start at {s0 / FPS:.2f}s or earlier")
            skies.append({**cfg, "ref": None, "win": cv2.createHanningWindow((w, h), cv2.CV_32F)})

    cue_frames = [(int(round((c["from"] - 0.1) * FPS)), int(round((c["to"] + 0.1) * FPS))) for c in CUES]

    enc = None
    if not args.preview:
        os.makedirs(os.path.dirname(os.path.abspath(args.dst)), exist_ok=True)
        cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", str(FPS),
               "-i", "-", "-i", args.src, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-preset", "medium",
               "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", args.dst]
        if f0 or args.to is not None:
            # Only the chosen range; audio is cut to match.
            cmd[cmd.index("-i", 10) : cmd.index("-i", 10)] = []
            cmd = cmd[:12] + ["-ss", f"{f0 / FPS}", "-t", f"{(f1 - f0) / FPS}"] + cmd[12:]
        enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    else:
        os.makedirs(args.preview, exist_ok=True)

    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    for f in range(f0, f1):
        ok, src = cap.read()
        if not ok:
            break
        frame = src.copy()

        # 0. Burned-in subtitles, first, so the reference frames below never
        #    carry them.
        if any(a <= f <= b for a, b in cue_frames):
            remove_subtitles(frame)

        # 1. Drone shots with 3D words.
        for sky in skies:
            s0, s1 = sky["frames"]
            if not (s0 <= f < s1):
                continue
            if sky.get("ref") is None or f == s0:
                # First frame of the shot: inpaint whatever word is already there.
                for wd in WORDS["words"]:
                    k = lerp_key(wd["keys"], f)
                    if k is None:
                        continue
                    bw, bh = k["w"] * 1.6 + 40, k["h"] * 2 + 40
                    x0, y0 = int(k["x"] - bw / 2), int(k["y"] - bh / 2)
                    x1, y1 = int(k["x"] + bw / 2), int(k["y"] + bh / 2)
                    m = np.zeros(frame.shape[:2], np.uint8)
                    m[max(0, y0):y1, max(0, x0):x1] = 1
                    inpaint_region(frame, m, x0 - 40, y0 - 40, x1 + 40, y1 + 40, radius=10)
                sky["ref"] = frame.copy()
                sky["prev"] = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32)
                sky["history"] = []  # (clean frame, shift since it) for the slow fade-ins
                continue
            g = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32)
            (dx, dy), _ = cv2.phaseCorrelate(sky["prev"], g, sky["win"])
            sky["prev"] = g
            M = np.float32([[1, 0, dx], [0, 1, dy]])
            refw = cv2.warpAffine(sky["ref"], M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            # Pixels the shifted reference cannot vouch for (slid in from
            # outside the frame) must never be filled from it.
            valid = cv2.warpAffine(np.full((h, w), 255, np.uint8), M, (w, h), flags=cv2.INTER_NEAREST, borderValue=0)
            valid = cv2.erode(valid, np.ones((17, 17), np.uint8))
            d = np.abs(frame.astype(np.int16) - refw.astype(np.int16)).max(axis=2)
            # A word that fades in slowly changes too little from one frame to
            # the next, so also compare with the clean frame from half a second
            # ago, shifted by the motion accumulated since.
            hist = [(fr, (sx + dx, sy + dy)) for fr, (sx, sy) in sky["history"]]
            if len(hist) >= HISTORY:
                old, (ox, oy) = hist[0]
                oldw = cv2.warpAffine(old, np.float32([[1, 0, ox], [0, 1, oy]]), (w, h),
                                      flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
                d2 = np.abs(frame.astype(np.int16) - oldw.astype(np.int16)).max(axis=2)
            else:
                d2 = np.zeros_like(d)
            bx0, by0, bx1, by1 = sky["band"]
            band = np.zeros((h, w), np.uint8)
            band[by0:by1, bx0:bx1] = 1
            # Inside the sky band a low threshold catches the words' soft
            # edges; outside it (hills, fields) only the big fly-out pieces,
            # which differ strongly, are touched.
            # Third net, for words that drift in so faintly that neither
            # comparison fires: anything in the sky band that is brighter than
            # its blurred surroundings. Haze and clouds are too soft to trip it.
            v = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.int16)
            crisp = (v - cv2.GaussianBlur(v.astype(np.uint8), (0, 0), 25).astype(np.int16) > 9)
            m = ((np.maximum(d, d2 - 4) > 11) & (band > 0)) | (crisp & (band > 0)) | ((np.maximum(d, d2 - 4) > 24) & (band == 0))
            m = m.astype(np.uint8)
            m[:16, :] = m[-16:, :] = 0
            m[:, :16] = m[:, -16:] = 0
            m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            # Small specks are texture and parallax, not letters: outside the
            # band only the big fly-out pieces count.
            n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
            for i in range(1, n):
                x, y, cw, ch, area = st[i]
                inside = band[y:y + ch, x:x + cw].mean() > 0.5
                if area < (40 if inside else 4000):
                    m[lab == i] = 0
            m = cv2.dilate(m, np.ones((9, 9), np.uint8), iterations=2)
            m = m * (valid > 0)
            feather_fill(frame, refw, m, blur=15)
            sky["ref"] = frame.copy()
            sky["history"] = (hist + [(frame.copy(), (0.0, 0.0))])[-HISTORY:]

        # 3. Static-camera shots (ribbons, close-up).
        for s in statics:
            s0, s1 = s.cfg["frames"]
            if s0 <= f < s1:
                s.apply(frame)

        if enc:
            enc.stdin.write(frame.tobytes())
        elif (f - f0) % args.every == 0:
            side = np.hstack([src, frame])
            cv2.putText(side, f"{f} {f / FPS:.2f}s", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)
            cv2.imwrite(os.path.join(args.preview, f"p_{f:05d}.jpg"), side, [cv2.IMWRITE_JPEG_QUALITY, 88])
        if (f - f0) % 300 == 0:
            print(f"frame {f}/{f1}", file=sys.stderr)

    if enc:
        enc.stdin.close()
        enc.wait()
        if enc.returncode:
            sys.exit(f"ffmpeg failed with {enc.returncode}")
    print("done", file=sys.stderr)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("dst", nargs="?")
    p.add_argument("--from", dest="frm", type=float)
    p.add_argument("--to", type=float)
    p.add_argument("--preview", help="write side-by-side sample frames to this directory instead of a video")
    p.add_argument("--every", type=int, default=30, help="with --preview, sample every N frames")
    a = p.parse_args()
    if not a.preview and not a.dst:
        p.error("dst is required unless --preview is given")
    process(a)
