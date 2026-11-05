# Posting ke Repliz: upload video lokal ke Repliz Storage, buat/update jadwal dari plan.json, cek status.
# Kredensial dari env REPLIZ_AUTH="accessKey:secretKey" (jangan ditulis ke file).
#   python repliz.py post plan.json      -> buat jadwal baru (entri ber-"scheduleId" di-update via PUT)
#   python repliz.py list [n]            -> n jadwal terbaru + status
#   python repliz.py accounts            -> daftar akun terhubung (_id untuk plan)
import base64, json, os, sys, urllib.request

API = "https://api.repliz.com/public"
AUTH = "Basic " + base64.b64encode(os.environ["REPLIZ_AUTH"].encode()).decode()


def call(method, path, body=None, url=None, headers=None, data=None):
    h = headers or {"Authorization": AUTH, "Content-Type": "application/json"}
    if data is None and body is not None:
        data = json.dumps(body).encode()
    req = urllib.request.Request(url or API + path, method=method, headers=h, data=data)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            raw = r.read()
            return r.status, json.loads(raw) if raw[:1] in (b"{", b"[") else raw.decode(errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="ignore")


def upload(path, _cache={}):
    # ponytail: satu upload per file per proses; file yang sama di beberapa entri plan dipakai ulang
    if path in _cache:
        return _cache[path]
    name = os.path.basename(path)
    s, init = call("POST", "/storage/file/init", {"filename": name, "size": os.path.getsize(path), "mimetype": "video/mp4"})
    assert s in (200, 201), (s, init)
    with open(path, "rb") as f:
        s2, _ = call("PUT", "", url=init["upload"], headers={"Content-Type": "video/mp4"}, data=f.read())
    assert s2 in (200, 201), ("put", s2)
    s3, done = call("POST", f"/storage/file/{init['id']}/complete", {})
    assert s3 in (200, 201, 204), (s3, done)  # 204 = sukses tanpa isi
    print("uploaded", name, init["url"])
    _cache[path] = init["url"]
    return init["url"]


def info(**kw):
    base = {"isAiGenerated": False, "isDraft": False, "isAutoAddMusic": False, "isShareToFeed": False,
            "privacy": "public", "trialParams": {"graduationStrategy": ""}, "collaborators": [],
            "music": {"id": "", "artist": "", "name": "", "thumbnail": "", "volume": {"video": 100, "music": 0}},
            "products": [], "tags": [], "mentions": [], "targetCountries": []}
    base.update(kw)
    return base


def body(p):
    url = p.get("url") or (upload(p["video"]) if p.get("video") else None)
    replies = [{"type": "text", "description": t, "medias": [], "topic": "", "title": "", "delay": 0} for t in p.get("replies", [])]
    return {"title": p.get("title", ""), "description": p["desc"], "type": p["type"], "topic": p.get("topic", ""),
            "medias": [{"type": "video", "url": url, "thumbnail": "", "customThumbnail": False, "alt": ""}] if url else [],
            "meta": {"title": "", "description": "", "url": ""}, "additionalInfo": info(**p.get("info", {})),
            "replies": replies, "scheduleAt": p["at"]}


def post(plan_path):
    plan = json.load(open(plan_path, encoding="utf-8"))
    for p in plan:
        assert p["desc"].count("#") <= 5, f"{p.get('name')}: hashtag > 5"
        assert p["at"] != "TANYA_USER", f"{p.get('name')}: waktu posting belum ditanyakan ke user"
    for p in plan:
        b = body(p)
        if p.get("scheduleId"):
            s, r = call("PUT", f"/schedule/{p['scheduleId']}", b)
        else:
            s, r = call("POST", "/schedule", {**b, "accountId": p["account"]})
        print(p.get("name", p.get("account")), s, r if s >= 300 else "ok")


def show(path, fields):
    s, d = call("GET", path)
    for x in d.get("docs", []):
        print(*[fields(x)])


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "post":
        post(sys.argv[2])
    elif cmd == "accounts":
        show("/account?page=1&limit=100", lambda a: f"{a['_id']}  {a['type']:<9} {a.get('username')}  ({a.get('name')})")
    elif cmd == "list":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        # ponytail: API urut lama→baru, ambil 100 dan tampilkan n terakhir; pakai paging bila jadwal >100
        s, d = call("GET", "/schedule?page=1&limit=100")
        for x in d.get("docs", [])[-n:]:
            print(f"{x['_id']}  {x['status']:<8} {x['scheduleAt']}  {(x.get('account') or {}).get('type', ''):<9} {x['type']:<5} {(x.get('description') or '')[:40]!r}")
