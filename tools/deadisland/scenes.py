"""Shot detection for edited sources (trailers, cinematics): media/deadisland/scenes/<id>.json lists every
internal cut, and media/deadisland/sheets/<id>_shots_NN.jpg shows one tile per shot, stamped 'start (length)'.
Usage: python3 tools/deadisland/scenes.py <id> [<id> ...]"""
import glob, json, math, os, re, subprocess, sys
RAW, OUT, SH = "media/deadisland/raw", "media/deadisland/scenes", "media/deadisland/sheets"
COLS, ROWS, W = 6, 6, 320
def run(i):
    p = [x for x in glob.glob(f"{RAW}/{i}.*") if ".part" not in x][0]
    js = f"{OUT}/{i}.json"
    d = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout)
    if os.path.exists(js):
        cuts = json.load(open(js))["cuts"]
    else:
        r = subprocess.run(["ffmpeg","-hide_banner","-i",p,"-an","-vf","scale=320:-2,select='gt(scene,0.28)',showinfo","-f","null","-"],capture_output=True,text=True)
        cuts = [0.0] + [float(x) for x in re.findall(r"pts_time:([0-9.]+)", r.stderr)]
        cuts = [c for k, c in enumerate(cuts) if k == 0 or c - cuts[k-1] > 0.25]
        json.dump({"id": i, "duration": d, "cuts": cuts}, open(js, "w"))
    shots = [(a, b - a) for a, b in zip(cuts, cuts[1:] + [d]) if b - a >= 0.8]
    per = COLS * ROWS
    for k in range(math.ceil(len(shots) / per)):
        out = f"{SH}/{i}_shots_{k:02d}.jpg"
        if os.path.exists(out): continue
        tiles = []
        for n, (a, L) in enumerate(shots[k*per:(k+1)*per]):
            t = f"{SH}/.tmp_{i}_{n}.jpg"
            lab = f"{int(a//60)}\\:{a%60:05.2f} ({L:.1f}s)"
            subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{a + L/2:.2f}","-i",p,"-frames:v","1","-vf",
                            f"scale={W}:180:force_original_aspect_ratio=decrease,pad={W}:180:(ow-iw)/2:(oh-ih)/2,drawtext=text='{lab}':x=4:y=4:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6","-q:v","4",t])
            if os.path.exists(t): tiles.append(t)
        if not tiles: continue
        ins = sum([["-i", t] for t in tiles], [])
        subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",f"concat=n={len(tiles)}:v=1:a=0,tile={COLS}x{ROWS}:padding=2","-frames:v","1","-q:v","4",out])
        for t in tiles: os.remove(t)
    print(i, f"{len(cuts)} cuts, {len(shots)} shots >= 0.8s", flush=True)
if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True); os.makedirs(SH, exist_ok=True)
    for i in sys.argv[1:]: run(i)
