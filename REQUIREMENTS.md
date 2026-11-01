# Requirements: semua yang dibutuhkan untuk membuat 1 video

Workflow `gaya-muslim-leveling` berjalan di Linux. Di Windows pakai WSL Ubuntu, di VPS pakai Ubuntu 24.04. Yang sudah diuji: WSL Ubuntu 24.04, i5-12400F, 1 November 2026.

## 1. Software

| Software | Versi teruji | Dipakai untuk |
|---|---|---|
| Claude Code | terbaru | menjalankan skill, menulis naskah dan animasi |
| Node.js | 22.x (wajib ≥ 22, butuh WebSocket bawaan) | `tools/record.mjs`: render frame lewat Chrome headless |
| Python | 3.12 (≥ 3.10) + **numpy** 1.26 | `tools/vertex.py` (TTS + transkrip), `tools/mix.py` (SFX sintetis + mix) |
| ffmpeg | 6.1 dengan libx264 | encode video, atempo narasi, versi HP, cek loudness |
| Google Chrome | 156 | render frame headless (tanpa GPU) |
| Google Cloud CLI (`gcloud`) | 590 | token untuk Vertex AI (Gemini TTS + transkripsi) |
| Internet | – | Google Fonts (Reem Kufi, Readex Pro, Amiri) dan GSAP 3.12.5 dari cdnjs dimuat saat render |

Catatan numpy: semua skrip dijalankan dengan `python3 -I`, yang mengabaikan site-packages milik user. Jadi numpy harus terpasang untuk interpreter sistem (`apt install python3-numpy`). Cara lain: pakai venv lalu aktifkan sebelum menjalankan skrip. `pip install --user` tidak akan terbaca.

## 2. Akun & layanan

- **Google Cloud project** dengan billing aktif dan Vertex AI API menyala. Model yang dipakai `gemini-3.8-flash-tts` (voice Sadachbia) dan `gemini-3.5-transcribe-preview` (bisa diganti lewat env `TTS_MODEL` / `TRANSCRIBE_MODEL`). Biayanya kecil: 2 take per video.
- **Claude Code**: langganan atau API.

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud services enable aiplatform.googleapis.com
```

## 3. Isi repo yang dipakai

| Path | Peran |
|---|---|
| `skills/gaya-muslim-leveling/` | skill gaya + workflow 12 langkah (salin ke `~/.claude/skills/`) |
| `tools/vertex.py`, `tools/record.mjs`, `tools/mix.py` | skrip TTS, render, dan mix (dari anatomy-studio, MIT, lihat `tools/LICENSE-anatomy-studio`). Di SKILL.md folder ini disebut `gorengan/tools`. |
| `templates/` | titik awal: `preview.html`, `gen.py`, contoh timeline SFX & caption, logo |
| `projects/<topik>/` | proyek jadi: naskah, caption, `preview.html`, `voice/` (script, gen.py, narasi.wav, narasi.json), `film/timeline.json`, MP4 versi HP |

Proyek baru dibuat di `projects/<topik>/`, supaya `voice/gen.py` menemukan `../../../tools`.

## 4. Pasang di Ubuntu 24.04 (VPS atau WSL)

Jalankan `bash setup-ubuntu.sh`, atau pasang manual dengan langkah yang sama:

```bash
sudo apt update && sudo apt install -y ffmpeg python3 python3-numpy git curl ca-certificates gnupg
# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
# Google Chrome
curl -fsSLo /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt install -y /tmp/chrome.deb
# Google Cloud CLI
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt update && sudo apt install -y google-cloud-cli
# Claude Code
sudo npm install -g @anthropic-ai/claude-code
# Skill
mkdir -p ~/.claude/skills && cp -r skills/gaya-muslim-leveling ~/.claude/skills/
```

## 5. Spesifikasi VPS

Hasil ukur 1 video (72,8 dtk, 2.184 frame, 1080×1920 @30fps):

| Tahap | Waktu (i5-12400F) | Beban |
|---|---|---|
| 2 take TTS + transkrip | ±1–2 mnt | ringan (diproses di Google) |
| 16 foto QA | ±30 dtk | Chrome |
| Mix SFX | beberapa detik | numpy |
| Render video | **151 dtk** | CPU ±20–25% dari 12 thread (setara 2–3 core), RAM tambahan ±1,4 GB |
| Encode versi HP | ±30 dtk | ffmpeg |
| Disk per proyek | ±110 MB (termasuk take mentah & foto QA) | |

Render bekerja frame demi frame secara berurutan, jadi **kecepatan per core lebih penting daripada jumlah core**. GPU tidak dipakai.

| | Minimal | Disarankan |
|---|---|---|
| vCPU | 2 | 4 (clock tinggi) |
| RAM | 4 GB + swap 2 GB | 8 GB |
| Disk | 25 GB SSD | 40–50 GB SSD/NVMe |
| GPU | tidak perlu | tidak perlu |
| OS | Ubuntu 24.04 | Ubuntu 24.04 |
| Perkiraan render 1 video | ±6–8 mnt | ±3–4 mnt |

Perkiraan waktu render di VPS adalah ekstrapolasi dari mesin uji, bukan hasil uji di VPS.

Swap 2 GB sebagai pengaman Chrome:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 6. Cek cepat setelah pasang

```bash
node --version && python3 -I -c "import numpy; print('numpy', numpy.__version__)" && ffmpeg -version | head -1 && google-chrome --version && gcloud auth print-access-token >/dev/null && echo OK
```

Uji render tanpa TTS (memakai narasi yang sudah ada):

```bash
cd projects/quran-birmingham
node ../../tools/record.mjs --project . --page preview.html --stills 5,30,60 --dir shots
```

## 7. Bersih-bersih setelah video final

`voice/take*`, `shots/`, `film/video.mp4`, dan `film/audio*.wav` bisa dihapus (sudah di `.gitignore`). Simpan `voice/narasi.wav`, `voice/narasi.json`, `preview.html`, dan `film/timeline.json` supaya video bisa dirender ulang.
