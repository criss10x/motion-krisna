# motion-krisna

Skill dan template untuk membuat video motion graphic islami 9:16 (1080x1920) untuk **Muslim Leveling**, dibuat bersama Claude Code.

Contoh hasil: "Rakyat Diperas" (pajak), "Dua Tahun Berkuasa" (demo 5 tuntutan), "Islam Sudah Punya Definisi Korupsi", "Langit Kita Dibakar" (karhutla).

## Isi

| Path | Isi |
| --- | --- |
| `skills/gaya-muslim-leveling/SKILL.md` | Skill gaya + workflow: palet, font (Reem Kufi / Readex Pro / Amiri), kubah logo sebagai objek utama, environment flat ramai, aturan fakta & dalil, TTS, render, caption 3 platform |
| `skills/gaya-muslim-leveling/assets/` | Contact sheet frame kunci (gaya dasar + latar ramai) |
| `templates/preview.html` | Template animasi HTML + GSAP (satu timeline, `window.seek`, adaptor `window.__film` untuk render headless). Salin, ganti `CUES` dan adegan |
| `templates/gen.py` | Narasi Gemini TTS (Vertex AI) + transkrip timestamp per kata |
| `templates/timeline.example.json` | Contoh daftar SFX untuk mix audio |
| `templates/caption.example.md` | Contoh caption TikTok / Instagram Reels / YouTube Shorts |
| `templates/logo.png` | Logo Muslim Leveling (latar transparan) |

## Pasang skill

**Claude Code:** salin folder skill ke folder skill pribadi.

```bash
cp -r skills/gaya-muslim-leveling ~/.claude/skills/
```

**claude.ai:** zip folder `skills/gaya-muslim-leveling` (folder di dalam zip bernama `gaya-muslim-leveling`), lalu Customize → Skills → + → Upload a skill.

Pakai dengan menyebut "pakai gaya-muslim-leveling" saat membuat video, bersama skill `start-motion`.

## Kebutuhan

- Skill `start-motion` (plugin anthropic-skills) untuk alur 6 tahap. Tidak disertakan di repo ini.
- Python 3.11, Node.js, ffmpeg, Google Chrome.
- Google Cloud SDK yang sudah login (`gcloud auth login`, `gcloud config set project …`) untuk Gemini TTS.
- `vertex.py`, `record.mjs`, `mix.py`: skrip render/TTS/mix dari skill anatomy-film (plugin anatomy-studio). Tidak disertakan di repo ini; `gen.py` dan workflow di SKILL.md mengharapkannya di folder `gorengan/tools/`.

## Prinsip konten

- Fakta dan angka harus bersumber (lembaga + tanggal); pernyataan pejabat dibedakan dari aturan resmi.
- Hanya ayat dan hadis shahih/hasan, dengan nomor rujukan; derajat dicek sebelum dipakai.
- Yang dikritik kebijakannya, bukan pribadi; tanpa ajakan anarkis.
