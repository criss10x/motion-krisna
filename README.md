# motion-krisna

Skill dan template untuk membuat video motion graphic islami 9:16 (1080x1920) untuk **Muslim Leveling**, dibuat bersama Claude Code.

Contoh hasil: "Rakyat Diperas" (pajak), "Dua Tahun Berkuasa" (demo 5 tuntutan), "Islam Sudah Punya Definisi Korupsi", "Langit Kita Dibakar" (karhutla).

## Isi

| Path | Isi |
| --- | --- |
| `skills/gaya-muslim-leveling/SKILL.md` | Skill gaya + workflow: palet, font (Reem Kufi / Readex Pro / Amiri), kubah logo sebagai objek utama, environment flat ramai, aturan fakta & dalil, TTS, render, caption 3 platform |
| `skills/gaya-muslim-leveling/assets/` | Contact sheet frame kunci (gaya dasar + latar ramai) |
| `skills/gaya-mindset-sehat/SKILL.md` | Skill gaya + workflow **Mindset.sehat8** (seri "Viral? Cek Dulu", konten kesehatan & affiliate): kertas krem, Fraunces + Plus Jakarta Sans, karakter produk (Si Chia, Si Zaitun), timbangan MASUK/KELUAR, stempel verdict, CTA keranjang kuning, narasi edge-tts, posting/jadwal lewat API Repliz (aturan caption & Threads) |
| `skills/gaya-mindset-sehat/assets/` | Contact sheet frame kunci + `template/` (preview.html, `tts.py`, `build_cues.py`, `render.py`, `mix.py`, `shots.py`), `repliz.py` + `plan.example.json` untuk posting ke TikTok/IG/YouTube/FB/Threads |
| `templates/preview.html` | Template animasi HTML + GSAP (satu timeline, `window.seek`, adaptor `window.__film` untuk render headless). Salin, ganti `CUES` dan adegan |
| `templates/gen.py` | Narasi Gemini TTS (Vertex AI) + transkrip timestamp per kata |
| `templates/timeline.example.json` | Contoh daftar SFX untuk mix audio |
| `templates/caption.example.md` | Contoh caption TikTok / Instagram Reels / YouTube Shorts |
| `templates/logo.png` | Logo Muslim Leveling (latar transparan) |
| `tools/` | `vertex.py` (Gemini TTS + transkrip), `record.mjs` (render headless Chrome), `mix.py` (SFX + mix): dari anatomy-studio, MIT. Di SKILL.md disebut `gorengan/tools` |
| `projects/` | Proyek jadi seri Mukjizat Quran: `romawi-akan-menang`, `quran-birmingham` (naskah, caption, preview.html, narasi, timeline SFX, MP4 versi HP) |
| `REQUIREMENTS.md` | Semua kebutuhan software, akun, cara pasang, spesifikasi VPS (hasil ukur) |
| `setup-ubuntu.sh` | Pasang semua kebutuhan di Ubuntu 24.04 (VPS/WSL) sekali jalan |

## Pasang skill

**Claude Code:** salin folder skill ke folder skill pribadi.

```bash
cp -r skills/gaya-muslim-leveling ~/.claude/skills/
```

**claude.ai:** zip folder `skills/gaya-muslim-leveling` (folder di dalam zip bernama `gaya-muslim-leveling`), lalu Customize → Skills → + → Upload a skill.

Pakai dengan menyebut "pakai gaya-muslim-leveling" saat membuat video, bersama skill `start-motion`.

## Kebutuhan

Lihat [REQUIREMENTS.md](REQUIREMENTS.md). Ringkasnya: Ubuntu 24.04 (atau WSL), Node.js 22, Python 3 + numpy, ffmpeg, Google Chrome, gcloud yang login ke project Vertex AI, dan Claude Code. VPS minimal 2 vCPU / 4 GB RAM / 25 GB SSD, disarankan 4 vCPU / 8 GB.

```bash
bash setup-ubuntu.sh
```

Skill `start-motion` (dari claude.ai) opsional. Workflow di SKILL.md sudah cukup untuk produksi.

## Prinsip konten

- Fakta dan angka harus bersumber (lembaga + tanggal); pernyataan pejabat dibedakan dari aturan resmi.
- Hanya ayat dan hadis shahih/hasan, dengan nomor rujukan; derajat dicek sebelum dipakai.
- Yang dikritik kebijakannya, bukan pribadi; tanpa ajakan anarkis.
