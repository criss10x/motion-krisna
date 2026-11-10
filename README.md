# motion-krisna

Skill dan template untuk membuat video motion graphic islami 9:16 (1080x1920) untuk **Muslim Leveling**, dibuat bersama Claude Code.

Contoh hasil: "Rakyat Diperas" (pajak), "Dua Tahun Berkuasa" (demo 5 tuntutan), "Islam Sudah Punya Definisi Korupsi", "Langit Kita Dibakar" (karhutla).

## Isi

| Path | Isi |
| --- | --- |
| `skills/gaya-muslim-leveling/SKILL.md` | Skill gaya + workflow VPS (Remotion): varian Klasik kubah & Neon, palet, font (Reem Kufi / Readex Pro / Amiri), safe zone, aturan fakta & dalil, TTS, QA contact sheet, render, caption 3 platform |
| `skills/gaya-muslim-leveling/assets/` | Contact sheet frame kunci (gaya dasar + latar ramai) |
| `templates/remotion/` | Template Remotion (proyek baru): salin ke `projects/<topik>/film-remotion`, lihat README-nya |
| `templates/cues.py` | Transkrip take terpilih → `public/cues.json` (adegan + waktu kata) untuk Remotion |
| `templates/tighten.py` | Pangkas jeda narasi + atempo, timestamp kata ikut dihitung ulang (take terlalu panjang) |
| `templates/sinematik/` | Varian **Sinematik**: `env.tsx` (langit, gunung, rumah Makkah, Ka'bah, kurma, siluet, debu/bara, sinar, mihrab, kartu nubuat) + contoh lengkap `contoh-AbuLahab.tsx` |
| `templates/preview.html` | Jalur lama: animasi HTML + GSAP dengan adaptor `window.__film` untuk `tools/record.mjs` |
| `templates/gen.py` | Narasi Gemini TTS (Vertex AI) + transkrip timestamp per kata |
| `templates/timeline.example.json` | Contoh daftar SFX untuk mix audio |
| `templates/caption.example.md` | Contoh caption TikTok / Instagram Reels / YouTube Shorts |
| `templates/logo.png` | Logo Muslim Leveling (latar transparan) |
| `tools/` | `vertex.py` (Gemini TTS + transkrip), `record.mjs` (render headless Chrome), `mix.py` (SFX + mix): dari anatomy-studio, MIT |
| `projects/` | Proyek jadi seri Mukjizat Quran: `romawi-akan-menang`, `quran-birmingham` (naskah, caption, preview.html, narasi, timeline SFX, MP4 versi HP) |
| `REQUIREMENTS.md` | Semua kebutuhan software, akun, cara pasang, spesifikasi VPS (hasil ukur) |
| `setup-ubuntu.sh` | Pasang semua kebutuhan di Ubuntu 24.04 (VPS/WSL) sekali jalan |

## Pasang skill

**Claude Code:** salin folder skill ke folder skill pribadi.

```bash
cp -r skills/gaya-muslim-leveling ~/.claude/skills/
```

**claude.ai:** zip folder `skills/gaya-muslim-leveling` (folder di dalam zip bernama `gaya-muslim-leveling`), lalu Customize → Skills → + → Upload a skill.

Pakai dengan menyebut "pakai gaya-muslim-leveling" saat membuat video. Setelah skill diubah, salin ulang dan buka sesi Claude baru supaya terbaca.

## Kebutuhan

Lihat [REQUIREMENTS.md](REQUIREMENTS.md). Ringkasnya: Ubuntu 24.04 (atau WSL), Node.js 22, Python 3 + numpy, ffmpeg, Google Chrome, gcloud yang login ke project Vertex AI, dan Claude Code. VPS minimal 2 vCPU / 4 GB RAM / 25 GB SSD, disarankan 4 vCPU / 8 GB.

```bash
bash setup-ubuntu.sh
```

Workflow di SKILL.md sudah cukup untuk produksi; tidak butuh skill lain.

## Prinsip konten

- Fakta dan angka harus bersumber (lembaga + tanggal); pernyataan pejabat dibedakan dari aturan resmi.
- Hanya ayat dan hadis shahih/hasan, dengan nomor rujukan; derajat dicek sebelum dipakai.
- Yang dikritik kebijakannya, bukan pribadi; tanpa ajakan anarkis.
