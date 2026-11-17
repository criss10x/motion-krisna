---
name: dialog-karakter
description: "Workflow video Muslim Leveling 9:16 dengan KARAKTER YANG BERDIALOG: tokoh kisah (sahabat, prajurit, imam, dll.) bicara dengan suara TTS berbeda dari narator, tampil sebagai siluet tanpa wajah dengan balon dialog yang menempel di kepalanya, chip nama, indikator suara, caption berwarna per pembicara, dan SFX diredam saat karakter bicara. Rasulullah ﷺ tidak pernah disuarakan atau digambar; sabdanya dibacakan narator dengan cahaya dan kartu hadis. Dibuat dari ikhlas-dicintai (17 Nov 2026), yang dinilai user \"bagus sekali\". Pakai skill ini setiap kali user minta karakter ikut bicara/berdialog, \"pakai suara TTS lain\", \"seakan-akan karakternya ngomong\", percakapan antar-tokoh, drama kisah sahabat atau hadis, atau video \"seperti Al-Ikhlas yang dialog\", walaupun tidak menyebut nama skill. Dipakai BERSAMA kamera-virtual (kamera, dunia, HUD, render) dan gaya-muslim-leveling (dalil, palet, pipeline)."
---

# Dialog Karakter (Muslim Leveling)

Skill ini adalah **lapisan tambahan** di atas `kamera-virtual`. Dunia ilustrasi, gerak kamera, HUD, render, dan jadwal tetap mengikuti `skills/kamera-virtual/SKILL.md`, sedangkan aturan dalil dan palet mengikuti `gaya-muslim-leveling`. Yang ditambahkan di sini:
- narasi multi-suara;
- balon dialog;
- caption per pembicara;
- peredaman SFX;
- rambu adab untuk tokoh yang bicara.

Contoh lengkap yang sudah lolos render dan dijadwalkan ada di `assets/contoh-ikhlas-dicintai/`:
- `naskah.md`: tabel suara, naskah per pembicara, sumber, catatan akurasi, dan storyboard.
- `gen_multi.py` dan `cues.py`: versi terisi.
- `Video.tsx`, `timing.ts`, `Root.tsx`, `make_timeline.py`, `caption.md`, `threads.txt`.
- `contact-sheet-final.jpg`.
- `env.tsx` sama dengan milik kamera-virtual (`skills/kamera-virtual/assets/contoh-gunung-akar/env.tsx`).

**Baca `references/desain-dialog.md` sebelum menulis storyboard dialog atau `Video.tsx`.**

## Urutan kerja (tunggu user di tiap ⏸)

1. **Hook** ⏸: sama seperti kamera-virtual. Tawarkan 5–7 hook yang benar secara harfiah, lalu beri rekomendasi.
2. **Naskah dialog** ⏸
   - Tulis tabel **Suara** (Peran, Suara TTS, Visual) dan tabel **Naskah** (#, Blok, Siapa, Kalimat). Tambahkan **Sumber** (nomor hadis atau ayat, sudah dicek) dan **Catatan akurasi**.
   - **Catatan akurasi** menandai kalimat mana yang lafaz hadis dan mana yang *dramatisasi*. Contoh: "Ya Rasulullah, imam kami …" adalah dramatisasi dari «ذكروا ذلك للنبي ﷺ».
   - Dramatisasi hanya boleh mengungkapkan ulang apa yang memang diriwayatkan. Jangan menambah peristiwa, emosi yang mengubah makna, atau nama yang tidak disebut di riwayat. Kalau namanya tidak disebut, tulis "seorang sahabat" atau "sang imam".
   - Komposisi: narator ditambah 1–3 karakter. Kalimat karakter pendek (paling banyak ±12 kata) supaya muat 2–3 baris di balon.
   - Panjang ±150–170 kata, sekitar 75 dtk pada tempo 1.08. Bloknya tetap: hook, kisah, ayat atau sabda, pelajaran, lalu CTA pola lama.
3. **Suara**
   - Isi `SPEAKERS`, `SEGMENTS`, `GAP`, dan `VOCAB` di `voice/gen_multi.py` (salin dari `scripts/gen_multi.py`).
   - Satu segmen = satu giliran bicara. Teks harus persis seperti naskah, ditambah catatan emosi per segmen.
   - `gen` membuat 2 take per segmen. `cek` membandingkan transkrip dengan naskah.
     - Pilih take yang **kata-katanya utuh**; TTS kadang mengganti kata, misalnya "spam" menjadi "membaca".
     - Kalau yang beda hanya salah dengar transkrip ("Beritukan"), take itu tetap aman; perbaiki tulisannya nanti lewat FIX.
     - Ulang satu segmen dengan `gen 3 n1`.
   - `build n1=2 p1=1 …`, lalu `sampel` menghasilkan `shots/sampel-dialog.m4a`. Kirim sampel ini ke user dengan SendUserFile.
     - Kalau user sudah bilang "lanjut sampai render", sampel cukup dikirim sebagai info.
     - Kalau belum, tunggu ⏸ sampai suara disetujui.
   - `tighten.py mix 1.08 0.7` → `narasi.wav/json`.
4. **cues**
   - Salin `scripts/cues.py` (versi dialog) ke `voice/cues.py`.
   - Tampilkan indeks kata dengan perintah di docstring-nya. Isi `OPENERS` (pakai **int** bila kata pembuka sudah muncul lebih awal, misalnya "Rasulullah" di hook) dan `FIX`.
     - "shallallahu 'alaihi wasallam" dari transkrip menjadi `ﷺ` ditambah 2 entri kosong.
     - Kutipan karakter diberi tanda kutip di kata pertama dan terakhirnya.
   - Hasilnya `cues.json` dengan `words[].k` dan `speech[]`.
5. **Storyboard → frame contoh → QA → SFX → render → kirim HP → jadwal**: ikuti langkah 3–9 kamera-virtual, ditambah:
   - Storyboard memuat bagian **Karakter** (siluet, warna rim = warna balon) dan **Dialog** (balon, chip nama, VoiceBars, caption berwarna). Setiap shot dialog dipicu run pembicara, dan kamera mendorong ke pembicara ±0,35 dtk sebelum ia bicara.
   - `make_timeline.py` meredam semua SFX ×0,35 selama run karakter (`inrun`, `a`, `bed`) dan memberi bunyi `bubble()` saat balon muncul.
   - QA memakai daftar di bagian 7 `references/desain-dialog.md`.

## Rambu adab (wajib)

- **Rasulullah ﷺ tidak pernah menjadi pembicara TTS dan tidak pernah digambar.**
  - Sabdanya dibacakan NARATOR dengan pola: "Beliau bersabda: '…'".
  - Visualnya hanya cahaya lembut, misalnya ambang pintu yang bercahaya, ditambah kartu HUD `SABDA RASULULLAH ﷺ` yang memuat teks Arab hadis.
  - Hal yang sama berlaku untuk para nabi lain. Malaikat dan Allah tidak digambar dalam bentuk apa pun.
- **Sahabat dan tokoh lain** tampil sebagai siluet tanpa wajah dan boleh bersuara. Dialog berbahasa Indonesia, tanpa TTS Arab; teks Arab hanya tampil visual.
- **Tokoh perempuan (sahabiyah)** belum pernah diberi suara. Tanyakan dulu ke user sebelum memberinya suara TTS.
- Dialog yang merupakan dramatisasi harus ditandai di naskah (Catatan akurasi), bukan disajikan sebagai lafaz hadis.

## Suara yang sudah teruji

| Peran | Suara | Catatan gaya |
|---|---|---|
| Narator | Sadachbia | hangat dan akrab, seperti kakak bercerita |
| Tokoh muda (prajurit, penanya) | Puck | heran, penasaran, sopan |
| Tokoh dewasa (imam, orang tua) | Algenib | hangat, tulus, lembut, terdengar jelas berbeda dari narator |
| Narator perempuan (gaya neon) | Sulafat | — |

Untuk tokoh dengan watak baru, buat 1 segmen pendek dengan 2–3 suara kandidat, lalu pilih bersama user lewat sampel.

## Pelajaran dari ikhlas-dicintai

- **TTS mengubah kata per segmen.** Take 1 n1 mengganti "spam" dengan "membaca" dan "Dengerin" dengan "Dengar". Selalu jalankan `cek`; karena take dipilih per segmen, tidak perlu mengulang semuanya.
- **Kata pembuka berulang.** "Rasulullah" muncul di hook dan di kisah. Kalau ditulis sebagai teks, OPENERS menempel ke yang pertama. Gunakan indeks int.
- **Hasil:** 74,9 dtk, 379 SFX, −14,0 LUFS, HP 13,0 MB, terjadwal 19 Nov 2026 04.00 WIB.

## Hal yang mudah terlewat (sudah ditangani di kode contoh)

- **Caption:** kelompok caption dipecah saat pembicara berganti. Tanpa itu, satu baris bisa berisi kata narator dan karakter dengan warna yang salah.
- **Ekor balon:** setelah balon di-clamp ke x < 940, ekornya tetap menunjuk kepala (`tailX` di-clamp di dalam balon, ujungnya ke `sx`).
- **Ambience panjang** (api, angin) dipecah di batas run lewat `bed()`. Tanpa itu, peredaman tidak berlaku pada bunyi yang mulai sebelum karakter bicara.
