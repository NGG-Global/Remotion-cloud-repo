"""Finish a slow archive.org download with parallel HTTP range requests.
Usage: python3 tools/deadisland/segfetch.py <source id> [connections]"""
import json, os, subprocess, sys, urllib.parse
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(__file__))
from fetch import resolve, ROOT
i = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
src = next(s for s in json.load(open("src/deadisland/data/sources.json")) if s["id"] == i)
url = resolve(src); ext = os.path.splitext(urllib.parse.unquote(url))[1].lower()
out = f"{ROOT}/{i}{ext}"; part = out + ".part" + ext
if os.path.exists(out): sys.exit(print(i, "exists"))
head = subprocess.run(["curl", "-sSLI", url], capture_output=True, text=True).stdout.lower()
total = int([l for l in head.splitlines() if l.startswith("content-length")][-1].split(":")[1])
have = os.path.getsize(part) if os.path.exists(part) else 0
step = (total - have) // n + 1
def get(k):
    a = have + k * step; b = min(total, a + step) - 1
    if a > b: return None
    p = f"{part}.seg{k}"
    done = os.path.getsize(p) if os.path.exists(p) else 0
    if done < b - a + 1:
        subprocess.run(["curl", "-sSL", "--fail", "--retry", "8", "--retry-delay", "3", "-r", f"{a + done}-{b}", url], stdout=open(p, "ab"), check=True)
    return p
with ThreadPoolExecutor(n) as ex: segs = [s for s in ex.map(get, range(n)) if s]
with open(part, "ab") as fh:
    for s in segs:
        with open(s, "rb") as g:
            while (chunk := g.read(1 << 24)): fh.write(chunk)
        os.remove(s)
assert os.path.getsize(part) == total, (os.path.getsize(part), total)
os.rename(part, out); print(i, "ok", total // 10**6, "MB")
