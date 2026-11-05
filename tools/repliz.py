#!/usr/bin/env python3
"""Jadwalkan posting Muslim Leveling lewat Repliz (https://docs.repliz.com).

DEFAULT = SIMULASI: hanya membaca daftar akun (GET) lalu mencetak payload.
Tidak ada upload atau jadwal yang dibuat kecuali ditambah --kirim.

  /usr/bin/python3 -I tools/repliz.py akun
  /usr/bin/python3 -I tools/repliz.py jadwal
  /usr/bin/python3 -I tools/repliz.py video   projects/<topik> [--jam 2026-11-06T19:00+07:00|sekarang] [--kecuali instagram,...] [--kirim]
  /usr/bin/python3 -I tools/repliz.py threads projects/<topik> [--jam ...] [--kirim]
  /usr/bin/python3 -I tools/repliz.py hapus <scheduleId>

Sumber konten per proyek:
  video   -> <topik>_9x16_v1-hp.mp4 + caption.md (## TikTok / ## Instagram Reels / ## YouTube Shorts)
  threads -> threads.txt (teks saja; post utama + balasan dipisah baris '---', tiap bagian maks 500 karakter)
Kredensial: .env di root repo (tidak di-commit): REPLIZ_KEY=..., REPLIZ_SECRET=...
"""
import base64, datetime as dt, glob, json, os, re, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.repliz.com/public"

# Akun tujuan (type -> username di Repliz). Akun lain di Repliz TIDAK pernah dipakai.
# Dicocokkan ke username ATAU nama akun (page Facebook username-nya "Digital creator", jadi pakai nama).
VIDEO_TARGETS = {"tiktok": "muslim.leveling", "instagram": "muslim.leveling", "youtube": "@muslim.levelingidn",
                 "facebook": "Muslim Leveling"}
TEXT_TARGETS = {"threads": "krisnasuryana"}
THREADS_MAX = 500
HASHTAG_MAX = 5  # permintaan user: maks 5 hashtag per posting di semua channel


def creds():
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                env[k] = v
    key = os.environ.get("REPLIZ_KEY", env.get("REPLIZ_KEY"))
    sec = os.environ.get("REPLIZ_SECRET", env.get("REPLIZ_SECRET"))
    if not key or not sec:
        sys.exit("REPLIZ_KEY / REPLIZ_SECRET belum ada di .env")
    return "Basic " + base64.b64encode(f"{key}:{sec}".encode()).decode()


def call(method, path, body=None, auth=True, url=None, data=None, ctype="application/json"):
    req = urllib.request.Request(url or API + path, method=method)
    if auth:
        req.add_header("Authorization", creds())
    if body is not None:
        data = json.dumps(body).encode()
    if data is not None:
        req.add_header("Content-Type", ctype)
    try:
        with urllib.request.urlopen(req, data=data, timeout=600) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw and raw[:1] in b"[{" else raw.decode(errors="replace"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")


def accounts():
    st, d = call("GET", "/account?page=1&limit=100")
    if st != 200:
        sys.exit(f"Gagal baca akun: HTTP {st} {d}")
    return d["docs"]


def pick(accs, targets):
    out = {}
    for typ, user in targets.items():
        hit = [a for a in accs if a["type"] == typ and user in (a["username"], a["name"]) and a.get("isConnected")]
        if not hit:
            print(f"! akun {typ} '{user}' tidak ditemukan / tidak terhubung, dilewati")
        else:
            out[typ] = hit[0]
    return out


def sections(md):
    parts, cur = {}, None
    for line in md.splitlines():
        m = re.match(r"^## (.+)", line)
        if m:
            cur = m.group(1).strip()
            parts[cur] = []
        elif cur:
            parts[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in parts.items()}


def youtube_fields(txt):
    m_t = re.search(r"\*\*Judul[^*]*\*\*\s*\n(.+)", txt)
    m_d = re.search(r"\*\*Deskripsi:?\*\*\s*\n(.*)", txt, re.S)
    title = m_t.group(1).strip() if m_t else ""
    desc = m_d.group(1).strip() if m_d else txt
    tags = re.findall(r"#([A-Za-z]\w*)", desc)
    return title, desc, [t for t in tags if t.lower() != "shorts"]


def hashtags(text):
    return re.findall(r"(?<![\w&])#\w+", text)


def check_tags(label, *texts):
    tags = [t for x in texts for t in hashtags(x)]
    if len(tags) > HASHTAG_MAX:
        sys.exit(f"{label}: {len(tags)} hashtag (maks {HASHTAG_MAX}): {' '.join(tags)}. Rapikan caption-nya dulu.")


def info(**kw):
    base = {"isAiGenerated": False, "isDraft": False, "isAutoAddMusic": False, "isShareToFeed": False,
            "privacy": "public", "trialParams": {"graduationStrategy": ""}, "collaborators": [],
            "music": {"id": "", "artist": "", "name": "", "thumbnail": "", "volume": {"video": 50, "music": 100}},
            "products": [], "tags": [], "mentions": [], "targetCountries": []}
    base.update(kw)
    return base


def payload(acc, typ, desc, when, title="", medias=None, topic="", **extra):
    return {"title": title, "description": desc, "topic": topic, "type": typ, "medias": medias or [],
            "meta": {"title": "", "description": "", "url": ""}, "additionalInfo": info(**extra),
            "replies": [], "accountId": acc["_id"], "scheduleAt": when}


def when_arg(args):
    if "--jam" in args:
        s = args[args.index("--jam") + 1]
        if s == "sekarang":  # Repliz memproses jadwal yang sudah lewat dalam ±1 menit
            return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds")
        t = dt.datetime.fromisoformat(s)
        if t.tzinfo is None:
            sys.exit("--jam wajib pakai zona waktu, mis. 2026-11-06T19:00+07:00")
        return t.isoformat(timespec="milliseconds")
    if "--kirim" in args:
        sys.exit("--kirim butuh --jam (contoh: --jam 2026-11-06T19:00+07:00)")
    wib = dt.timezone(dt.timedelta(hours=7))
    t = (dt.datetime.now(wib) + dt.timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    return t.isoformat(timespec="milliseconds")


def upload(path):
    size = os.path.getsize(path)
    st, d = call("POST", "/storage/file/init", {"filename": os.path.basename(path), "size": size, "mimetype": "video/mp4"})
    if st not in (200, 201):
        sys.exit(f"init upload gagal: HTTP {st} {d}")
    with open(path, "rb") as f:
        st2, d2 = call("PUT", "", auth=False, url=d["upload"], data=f.read(), ctype="video/mp4")
    if st2 not in (200, 201, 204):
        sys.exit(f"PUT upload gagal: HTTP {st2} {d2}")
    st3, d3 = call("POST", f"/storage/file/{d['id']}/complete", data=b"")
    if st3 not in (200, 201, 204):
        sys.exit(f"complete upload gagal: HTTP {st3} {d3}")
    return d["url"]


def show(label, p):
    q = json.loads(json.dumps(p))
    q["additionalInfo"] = {k: v for k, v in q["additionalInfo"].items() if v not in (False, [], "", None)
                           and k not in ("music", "trialParams")}
    print(f"\n----- {label} -----")
    print(json.dumps(q, ensure_ascii=False, indent=1))


def send(label, p):
    st, d = call("POST", "/schedule", p)
    ok = st in (200, 201)
    print(f"{'OK ' if ok else 'GAGAL'} {label}: HTTP {st} {d}")
    return ok


def cmd_video(proj, args):
    kirim = "--kirim" in args
    mp4 = sorted(glob.glob(os.path.join(proj, "*_9x16_v*-hp.mp4")))
    if not mp4:
        sys.exit("Tidak ada *_9x16_v*-hp.mp4 di " + proj)
    mp4 = mp4[-1]
    cap = sections(open(os.path.join(proj, "caption.md"), encoding="utf-8").read())
    when = when_arg(args)
    skip = args[args.index("--kecuali") + 1].split(",") if "--kecuali" in args else []
    tgt = pick(accounts(), {k: v for k, v in VIDEO_TARGETS.items() if k not in skip})
    print(f"Video : {mp4} ({os.path.getsize(mp4)/1e6:.1f} MB)\nJadwal: {when}\nMode  : {'KIRIM' if kirim else 'SIMULASI (tidak ada yang dikirim)'}")
    url = upload(mp4) if kirim else "<URL Repliz Storage setelah upload>"
    media = [{"alt": "", "customThumbnail": False, "type": "video", "thumbnail": "", "url": url}]
    jobs = []
    if "tiktok" in tgt:
        jobs.append(("TikTok @" + tgt["tiktok"]["username"], payload(tgt["tiktok"], "video", cap["TikTok"], when, medias=media)))
    if "instagram" in tgt:
        jobs.append(("Instagram @" + tgt["instagram"]["username"],
                     payload(tgt["instagram"], "reel", cap["Instagram Reels"], when, medias=media, isShareToFeed=True)))
    if "youtube" in tgt:
        title, desc, tags = youtube_fields(cap["YouTube Shorts"])
        if not title or len(title) > 100:
            sys.exit(f"Judul YouTube kosong/>100 karakter: {title!r}")
        jobs.append(("YouTube " + tgt["youtube"]["username"], payload(tgt["youtube"], "video", desc, when, title=title, medias=media, tags=tags)))
    if "facebook" in tgt:
        title, _, _ = youtube_fields(cap["YouTube Shorts"])
        fb = cap.get("Facebook") or cap["Instagram Reels"].replace("link di bio", "cek profil kami")
        jobs.append(("Facebook " + tgt["facebook"]["name"],
                     payload(tgt["facebook"], "video", fb, when, title=title.replace("#Shorts", "").strip(), medias=media)))
    for label, p in jobs:
        check_tags(label, p["title"], p["description"])
    for label, p in jobs:
        send(label, p) if kirim else show(label, p)


def cmd_threads(proj, args):
    """threads.txt: post utama + balasan (thread), dipisah baris '---'. Tiap bagian maks 500 karakter."""
    kirim = "--kirim" in args
    raw = open(os.path.join(proj, "threads.txt"), encoding="utf-8").read()
    parts = [x.strip() for x in re.split(r"(?m)^---\s*$", raw) if x.strip()]
    for i, t in enumerate(parts, 1):
        if len(t) > THREADS_MAX:
            sys.exit(f"threads.txt bagian {i}: {len(t)} karakter, maks {THREADS_MAX}")
    check_tags("threads.txt", *parts)
    when = when_arg(args)
    tgt = pick(accounts(), TEXT_TARGETS)
    print(f"Threads: {len(parts)} post ({', '.join(str(len(t)) for t in parts)} karakter)\nJadwal : {when}\n"
          f"Mode   : {'KIRIM' if kirim else 'SIMULASI (tidak ada yang dikirim)'}")
    for typ, acc in tgt.items():
        p = payload(acc, "text", parts[0], when)
        p["replies"] = [{"title": "", "description": t, "topic": "", "type": "text", "medias": [], "delay": 0}
                        for t in parts[1:]]
        send("Threads @" + acc["username"], p) if kirim else show("Threads @" + acc["username"], p)


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    c = a[0]
    if c == "akun":
        for x in accounts():
            ids = (x["username"], x["name"])
            used = (VIDEO_TARGETS.get(x["type"]) in ids and "video") or (TEXT_TARGETS.get(x["type"]) in ids and "teks") or "-"
            print(f"{x['_id']}  {x['type']:<9} {x['username']:<22} {x['name']:<22} dipakai: {used}")
    elif c == "jadwal":
        st, d = call("GET", "/schedule?page=1&limit=100")
        for s in (d.get("docs", []) if isinstance(d, dict) else []):
            print(s["_id"], s["status"], s["scheduleAt"], s["type"], (s.get("account") or {}).get("username", s["accountId"]), (s.get("description") or "")[:50].replace("\n", " "))
        print(f"HTTP {st}, total {d.get('totalDocs') if isinstance(d, dict) else d}")
    elif c == "video":
        cmd_video(a[1], a[2:])
    elif c == "threads":
        cmd_threads(a[1], a[2:])
    elif c == "hapus":
        st, d = call("DELETE", "/schedule/" + a[1])
        print(f"HTTP {st} {d}")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
