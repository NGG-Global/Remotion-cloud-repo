"""Contact sheets for footage review: media/deadisland/sheets/<id>_NN.jpg, each tile stamped with its source time.
Usage: python3 tools/deadisland/sheets.py [id ...]   (default: every raw file without sheets)"""
import glob, math, os, subprocess, sys
RAW, OUT = "media/deadisland/raw", "media/deadisland/sheets"
COLS, ROWS, W = 6, 6, 320
def dur(p):
    return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout.strip() or 0)
def make(p):
    i = os.path.splitext(os.path.basename(p))[0]
    d = dur(p)
    if d <= 0: print(i, "no duration"); return
    step = 2 if d < 80 else 3 if d < 150 else 5 if d < 420 else 10 if d < 1300 else 15 if d < 2700 else 20
    per = COLS * ROWS
    n = math.ceil(d / step / per)
    for k in range(n):
        out = f"{OUT}/{i}_{k:02d}.jpg"
        if os.path.exists(out): continue
        tiles = []
        for j in range(per):
            t = (k * per + j) * step
            if t >= d - 0.5: break
            tmp = f"{OUT}/.t_{i}_{j}.jpg"
            lab = f"{int(t//3600)}\\:{int(t%3600//60):02d}\\:{int(t%60):02d}"
            subprocess.run(["ffmpeg","-v","error","-y","-ss",str(t),"-i",p,"-frames:v","1","-vf",
                f"scale={W}:180:force_original_aspect_ratio=decrease,pad={W}:180:(ow-iw)/2:(oh-ih)/2,drawtext=text='{lab}':x=4:y=4:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6","-q:v","4",tmp])
            if os.path.exists(tmp): tiles.append(tmp)
        if not tiles: continue
        ins = sum([["-i", t] for t in tiles], [])
        subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",f"concat=n={len(tiles)}:v=1:a=0,tile={COLS}x{ROWS}:padding=2","-frames:v","1","-q:v","4",out])
        for t in tiles: os.remove(t)
    print(i, f"{d:.0f}s step {step}s sheets {n}", flush=True)
if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    ids = sys.argv[1:]
    files = [p for p in sorted(glob.glob(RAW + "/*")) if ".part" not in p and (not ids or os.path.splitext(os.path.basename(p))[0] in ids)]
    for p in files: make(p)
