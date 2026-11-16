"""Download every source in src/deadisland/data/sources.json into media/deadisland/raw/<id>.<ext>.
Plain HTTPS only (Steam store CDN and the Internet Archive); no DRM or login is involved.
A URL ending in '/' is an archive.org item directory: the largest video file in the item is taken."""
import json, os, subprocess, sys, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
ROOT = "media/deadisland/raw"
VID = (".mp4", ".mkv", ".webm", ".flv", ".mov", ".m4v")
def resolve(src):
    url = src["url"]
    if url.endswith("/"):
        ident = url.rstrip("/").split("/")[-1]
        meta = json.load(urllib.request.urlopen(f"https://archive.org/metadata/{ident}"))
        files = [f for f in meta["files"] if f["name"].lower().endswith(VID)]
        best = max(files, key=lambda f: int(f.get("size", 0)))
        url = url + urllib.parse.quote(best["name"])
    return url
def fetch(src):
    try:
        url = resolve(src)
        hls = ".m3u8" in url
        ext = ".mp4" if hls or "range" in src else os.path.splitext(urllib.parse.unquote(url))[1].lower()
        out = f"{ROOT}/{src['id']}{ext}"
        if os.path.exists(out) and os.path.getsize(out) > 1e5:
            return src["id"], "exists", url
        tmp = out + ".part" + ext
        if hls:
            cmd = ["ffmpeg", "-v", "error", "-y", "-i", url, "-c", "copy", tmp]
        elif "range" in src:
            a, b = src["range"]
            cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-i", url, "-t", str(b - a), "-c", "copy", tmp]
        else:
            cmd = ["curl", "-sSL", "--fail", "--retry", "5", "--retry-delay", "5", "-C", "-", "-o", tmp, url]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            return src["id"], "FAILED " + r.stderr[-300:], url
        os.rename(tmp, out)
        return src["id"], "ok %d MB" % (os.path.getsize(out) / 1e6), url
    except Exception as e:
        return src["id"], f"FAILED {e}", src["url"]
if __name__ == "__main__":
    os.makedirs(ROOT, exist_ok=True)
    srcs = json.load(open("src/deadisland/data/sources.json"))
    only = set(sys.argv[1:])
    if only: srcs = [s for s in srcs if s["id"] in only]
    resolved = {}
    with ThreadPoolExecutor(10) as ex:
        for i, status, url in ex.map(fetch, srcs):
            print(i, "|", status, flush=True); resolved[i] = url
    json.dump(resolved, open("media/deadisland/resolved_urls.json", "a"), indent=1)
