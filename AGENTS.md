# AGENTS.md: motion-krisna

Panduan untuk agent (Claude Code) dan manusia yang menjalankan workflow video **Muslim Leveling** di VPS Ubuntu. Koneksi ke VPS memakai **Claude desktop app → tab Code → koneksi SSH**.

## 1. VPS

- **OS:** Ubuntu **24.04 LTS** (versi yang sudah diuji; versi lain belum).
- **Spesifikasi:** minimal 4 vCPU / 8 GB RAM / 40 GB SSD; disarankan 8 vCPU / 16 GB / 80 GB. GPU tidak perlu.
- **Akses:** SSH dengan kunci, bukan password. Tidak perlu control panel (cPanel/aaPanel), karena semua kerja lewat Claude desktop app.

### Pasang & login Claude
**Di PC (Windows/Mac): Claude desktop app**
1. Download dari https://claude.ai/download, lalu install.
2. Buka aplikasinya, lalu login dengan akun Claude (Google atau email). Claude Code butuh paket **Pro atau Max** (atau Team/Enterprise).
3. Buka tab **Code**. Dari sini kamu ngobrol dengan Claude dan memberi perintah ke VPS.

**Di VPS: Claude Code (CLI)**, dipakai oleh sesi SSH dari desktop app
1. Pasang. `setup-ubuntu.sh` sudah memasangnya; kalau mau manual, pilih salah satu:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash      # installer resmi
   sudo npm install -g @anthropic-ai/claude-code       # atau lewat npm (Node 22)
   ```
2. Login sekali. VPS tidak punya browser, jadi caranya:
   ```bash
   claude
   ```
   Pilih login dengan akun Claude (langganan). CLI menampilkan sebuah URL; buka URL itu di browser PC, login, lalu salin kode yang muncul dan tempel di terminal VPS. Ketik `/status` untuk memastikan akun sudah benar, lalu `/exit`.
3. Cek: `claude --version`.

### Hubungkan Claude desktop app ke VPS
1. Di PC, buat kunci SSH: `ssh-keygen -t ed25519`, lalu `ssh-copy-id user@IP_VPS`.
2. Tambahkan host di `~/.ssh/config` PC:
   ```
   Host ml-vps
     HostName IP_VPS
     User user
     IdentityFile ~/.ssh/id_ed25519
   ```
3. Claude desktop app → Code → buat sesi baru → pilih koneksi SSH `ml-vps`, folder kerja `~/motion-krisna`.
4. Opsional: pasang Tailscale di PC dan VPS, lalu pakai IP Tailscale sebagai HostName. Dengan begitu port SSH tidak perlu dibuka ke publik.

## 2. Yang dipasang di VPS

Jalankan sekali dari root repo:

```bash
git clone https://github.com/criss10x/motion-krisna && cd motion-krisna && bash setup-ubuntu.sh
```

`setup-ubuntu.sh` memasang:

| Software | Versi | Dipakai untuk |
|---|---|---|
| Node.js | 22.x | Remotion (render video), `tools/record.mjs` |
| Python + numpy | 3.12 / 1.26 (`python3-numpy` sistem) | `tools/vertex.py` (TTS + transkrip), `tools/mix.py` (SFX) |
| ffmpeg | 6.1 + libx264 | atempo narasi, encode versi HP, cek loudness |
| Google Chrome | stable | render `preview.html` (proyek lama) |
| Google Cloud CLI | terbaru | token Vertex AI |
| Claude Code | terbaru | agent |
| tmux | – | render panjang tetap jalan saat koneksi putus |
| swap 2 GB | – | pengaman RAM saat render |
| skill `gaya-muslim-leveling` | dari repo | disalin ke `~/.claude/skills/` |

Per proyek Remotion (`projects/<topik>/film-remotion/`, disalin dari `templates/remotion/`): jalankan `npm i`, lalu `npx remotion browser ensure` (mengunduh Chrome headless untuk Remotion).

Login sekali setelah setup:

```bash
claude                                  # login Claude (lihat bagian 1)
gcloud auth login --no-launch-browser   # buka link-nya di browser PC, tempel kodenya
gcloud config set project <PROJECT_ID>
```

## 3. Google Cloud yang dibutuhkan

| Kebutuhan | Cara |
|---|---|
| Project dengan **billing aktif** | console.cloud.google.com → Billing |
| **Vertex AI API** menyala | `gcloud services enable aiplatform.googleapis.com` |
| Akun login punya peran **Vertex AI User** (`roles/aiplatform.user`) | Owner project sudah otomatis punya |
| Lokasi | `global` (default `VERTEX_LOCATION`) |
| Model TTS | `gemini-3.8-flash-tts` (env `TTS_MODEL`) |
| Model transkrip | `gemini-3.5-transcribe-preview` (env `TRANSCRIBE_MODEL`) |
| Suara | Sadachbia (pria, default), Sulafat (perempuan, untuk gaya neon) |
| Opsional | Budget alert di Billing supaya biaya tidak kebablasan |

Otentikasi memakai `gcloud auth print-access-token`, jadi tidak perlu file service account. Project bisa ditentukan lewat `gcloud config set project` atau env `VERTEX_PROJECT`. Cek koneksi:

```bash
gcloud auth print-access-token >/dev/null && echo TOKEN_OK
```

## 4. Workflow 1 video (Remotion, template `templates/remotion/`)

Langkah lengkapnya ada di `templates/remotion/README.md`. Ringkasnya:


1. Riset dan naskah (dalil shahih bernomor) → `naskah.md`
2. Salin template: `cp -r templates/remotion projects/<topik>/film-remotion`, `cp templates/cues.py templates/gen.py templates/tighten.py projects/<topik>/voice/`. Tulis `voice/script.txt` (versi TTS), atur `VOICE`/`STYLE`/`VOCAB` di `voice/gen.py`, jalankan `/usr/bin/python3 -I voice/gen.py` (2 take), lalu pilih take.
3. Durasi: kalau take terlalu panjang, pangkas jeda + percepat sekaligus: `/usr/bin/python3 -I voice/tighten.py take1 1.15` → `voice/narasi.wav` + `voice/narasi.json` (lalu `SPEED = 1.0` di `cues.py`). Kalau cukup dipercepat: `ffmpeg -i voice/take2.wav -af atempo=1.12 voice/narasi.wav && cp voice/take2.json voice/narasi.json`.
4. Isi `OPENERS` dan `FIX` di `voice/cues.py` (atau `BOUNDS` manual bila adegan dibuka bacaan Arab, yang tidak ikut ditranskrip), lalu `/usr/bin/python3 -I voice/cues.py` → `film-remotion/public/cues.json`
5. Edit `film-remotion/src/Video.tsx` (adegan dan waktu kata kunci `K`), ganti id komposisi di `src/Root.tsx`
6. QA: `npx remotion bundle --out-dir=build`, lalu `npx remotion still build <Id> ../shots/fN.jpg --frame=N --gl=swangle --scale=0.5` per frame, gabungkan jadi contact sheet
7. SFX: `film/timeline.json` → `/usr/bin/python3 -I ../../tools/mix.py --project .` → normalisasi −14 LUFS: `ffmpeg -i film/audio-nomusic.wav -af loudnorm=I=-14:TP=-1.0:LRA=11 -ar 48000 film-remotion/public/narasi.wav`
8. Render (di dalam tmux): `npx remotion render build <Id> ../<topik>_9x16_v1.mp4 --gl=swangle --codec=h264 --crf=18 --audio-codec=aac` (bundle ulang dulu kalau `Video.tsx` berubah)
9. Versi HP (<30 MB): `ffmpeg -i <topik>_9x16_v1.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart <topik>_9x16_v1-hp.mp4`
10. `caption.md` (TikTok, IG, Shorts). Hasil video dan folder proyek **tidak** di-commit; yang di-commit hanya perubahan workflow (tools, templates, skill, panduan).

## 5. Aturan penting

- **VPS tidak punya GPU:** selalu pakai `--gl=swangle`. `--gl=angle` hanya untuk Windows dengan GPU.
- **Safe zone TikTok/Reels (1080×1920):** teks penting di y 250–1440, kanan x≥940 kosong (tombol), 480 px bawah kosong (caption platform).
- Python dijalankan dengan `/usr/bin/python3 -I`, jadi numpy harus dari paket sistem (`python3-numpy`).
- Jaringan putus (error SSL `bad record mac`) → ulangi perintahnya. `gen.py` aman diulang per take: `/usr/bin/python3 -I voice/gen.py 2`.
- Ambil file hasil (MP4) dari VPS lewat Claude desktop app, atau `scp ml-vps:~/motion-krisna/projects/<topik>/*.mp4 .`
- Jangan commit `node_modules/`, `voice/take*`, `shots/`, atau `film-remotion/public/narasi.wav` (sudah di `.gitignore`).
- Remotion gratis untuk tim ≤3 orang (https://www.remotion.pro/license).
