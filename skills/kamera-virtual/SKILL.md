---
name: kamera-virtual
description: "Workflow video Muslim Leveling 9:16 bergaya KAMERA VIRTUAL (Remotion): dunia ilustrasi besar yang dijelajahi kamera (push-in, whip, track, crane, morph/match-cut), shot berganti tiap 2–4 dtk mengikuti kata narasi, label-dunia dengan ukuran tetap, HUD diam (judul, caption, panel ayat kaca), narasi ringkas ±60–70 dtk, pesan/pelajaran sebelum CTA, SFX padat tanpa musik, −14 LUFS. Dibuat dari remake gunung-akar (17 Nov 2026) yang disukai user. Pakai skill ini setiap kali user minta remake/buat ulang konten lama \"dengan workflow tadi / kamera virtual / seperti gunung akar\", minta kamera zoom ke bagian yang sedang dibahas, minta video yang bikin penonton terpaku, atau minta video mukjizat/kisah singkat untuk Muslim Leveling dengan gerak kamera, walaupun tidak menyebut nama skill. Gabungkan dengan gaya-muslim-leveling (palet, aturan dalil, pipeline umum)."
---

# Kamera Virtual (Muslim Leveling)

Skill ini mencatat workflow yang dipakai untuk **gunung-akar** (remake #15, terjadwal 17 Nov 2026 18:00, respons user: "Bagus banget"). Skill ini *menambah* `gaya-muslim-leveling`, tidak menggantikannya. Aturan dalil, palet, safe zone, TTS tanpa Arab, Repliz, dan pipeline Remotion dasar tetap dari sana dan dari `AGENTS.md`.

Ide pokoknya: **video bukan lagi deretan adegan datar, tapi satu (atau beberapa) dunia ilustrasi besar yang dijelajahi kamera.** Saat narasi menyebut "puncak", kamera ada di puncak. Saat menyebut "akar", kamera menyelam ke akar. Shot berganti tiap 2–4 detik, selalu dipicu kata yang diucapkan. Inilah yang membuat penonton terpaku.

Contoh lengkap yang sudah lolos render ada di `assets/contoh-gunung-akar/`:
- `Video.tsx`, `timing.ts`, `env.tsx`, `Root.tsx`
- `make_timeline.py`, `naskah.md` (narasi plus storyboard v3), `cues.py`, `gen.py`, `caption.md`, `threads.txt`
- Gambar acuan: `samples.jpg` dan `contact-sheet-final.jpg`

**Baca `references/desain-kamera.md` sebelum menulis storyboard atau `Video.tsx`.**

**Ada karakter yang ikut bicara dengan suara TTS lain?** Pakai juga skill `dialog-karakter`, yang mengatur narasi multi-suara, balon dialog, dan rambu adab untuk tokoh yang bicara. Skill ini tetap menjadi kerangka kamera dan render.

## Urutan kerja (tunggu user di tiap ⏸)

1. **Hook dulu** ⏸
   - Baca naskah lama (kalau remake) dan cek ulang dalilnya.
   - Tawarkan 5–7 hook. Semuanya harus benar secara harfiah, termasuk angka.
   - Format yang disukai user (gunung-akar): pertanyaan pribadi ke penonton, misalnya "Di umur berapa kalian tahu kalau …?" Pertanyaan "Kalau Rasulullah ﷺ mengarang Al-Qur'an, kenapa …?" cocok untuk seri Bukan Karangan Manusia.
   - Sertakan rekomendasi.
2. **Naskah ringkas** ⏸
   - Panjang ±130–160 kata, hasilnya ±60–70 dtk. Alasannya, menurut user, attention span penonton Indonesia pendek.
   - Strukturnya 7 blok:
     1. Hook
     2. Fakta atau kisah
     3. Ayat: "Dalam surat X ayat N, Allah berfirman: <terjemah>". Ayat **dibacakan terjemahnya**, sedangkan tulisan Arab hanya tampil di layar.
     4. Penjelasan dengan perumpamaan sederhana
     5. Siapa yang memberi tahu? Allah
     6. **Pelajaran**: satu pesan yang bisa diamalkan, supaya penonton dapat manfaat
     7. CTA pola lama: `Tulis "<kalimat>" di kolom komentar. Simpan, dan bagikan.`
   - Bahasa: sekali dengar langsung paham. Kalau user minta versi anak, pakai label "… · UNTUK ANAK", gaya kakak/ayah bercerita, dan kalimat pendek.
3. **Storyboard kamera** ⏸
   - Isinya dua bagian: sistem desain (lapisan, zona, alat bantu, bahasa kamera) dan shot list. Tiap shot mencantumkan kata pemicu, gerak kamera, teks HUD, label-dunia, dan SFX.
   - Kalau remake, pertahankan **tema warna** video lama ("aku suka desainnya"), tapi susun ulang tata letaknya untuk kamera.
4. **Frame contoh dulu** ⏸
   - Bangun `Video.tsx` dan `timing.ts`, lalu render 4 still kualitas penuh: hook di frame 0, satu shot zoom yang paling khas, panel ayat, dan match-cut atau klimaks.
   - Gabungkan jadi grid 2×2 dan kirim ke user dengan SendUserFile. Jangan render video penuh sebelum user setuju.
   - Pekerjaan ini panjang (±1 jam). Delegasikan ke agen fork. Briefnya mencakup STEP 1 (sample), STEP 2 (QA contact sheet 40-an still pada `--scale=0.5`, termasuk frame di tengah whip dan morph), dan menulis `shots/k.txt`. Larang agen merender video final.
5. **Narasi** (bisa jalan sejajar dengan langkah 4)
   - `voice/gen.py` (2 take), pilih take, lalu `tighten.py takeN <tempo> 0.7`.
   - **Tempo: 1.08** dipakai di gunung-akar atas permintaan user. Default repo 1.10; tanyakan kalau ragu.
   - Isi OPENERS dan FIX di `cues.py`, lalu `cues.json`.
   - Semua waktu kamera dihitung dari kata (`kw()`), jadi kalau tempo berubah cukup jalankan ulang tighten dan cues, lalu `k.txt`. Tidak ada angka detik manual yang perlu digeser.
6. **SFX dan audio**
   - Jalankan `node --experimental-strip-types skills/kamera-virtual/scripts/k.mts projects/<topik>` untuk menulis `shots/k.txt` dari `EV` di `timing.ts`.
   - Tulis `film/make_timeline.py` yang membaca `k.txt` (contoh: `assets/contoh-gunung-akar/make_timeline.py`). Tiap gerak kamera, whip, judul, label, pukulan, dan morph mendapat bunyi. Targetnya ±150–250 SFX.
   - Jalankan `/usr/bin/python3 -I ../../tools/mix.py --project .`. Pakai **`film/audio-nomusic.wav`** (tanpa musik sejak 15 Nov).
   - Normalisasi: `ffmpeg -i film/audio-nomusic.wav -af loudnorm=I=-14:TP=-1.0:LRA=11 -ar 48000 film/audio-norm.wav`, lalu salin ke `film-remotion/public/narasi.wav`.
   - Cek keseimbangan dengan `/usr/bin/python3 -I skills/kamera-virtual/scripts/sfxratio.py projects/<topik>`. SFX/voice sekitar −19 sampai −22 dB sudah pas (gunung-akar −21,9).
7. **Render** di tmux: bundle, `render … --gl=swangle --codec=h264 --crf=18 --audio-codec=aac`, lalu encode HP (`-crf 25 -preset slow`).
   - Setelah selesai, ambil sekitar 12 frame dari mp4 HP menjadi contact sheet dan periksa: judul bertabrakan, label keluar layar, teks di x ≥ 940.
8. **Kirim versi HP saja** (SendUserFile), lalu tawarkan slot jadwal kosong berikutnya ⏸.
9. **Jadwal**: dry-run `tools/repliz.py video|threads`, lalu `--kirim`. Catat ID-nya di memori antrian topik.

## Prinsip desain (ringkas, detail di references)

- **Tiga lapisan:**
  - **DUNIA** ikut kamera sepenuhnya.
  - **LABEL-DUNIA** posisinya ikut benda, tapi ukurannya dikoreksi 1/zoom sehingga 34–44 px di layar.
  - **HUD** diam: judul, caption, pill, panel ayat kaca, progress bar, watermark.
- **Zona layar:**
  - Judul HUD di y 250–440.
  - Jendela kamera di y 480–1180, dengan titik fokus (540, 830).
  - Pill di y 1200–1290; caption di y 1300–1420.
  - x ≥ 940 dan 480 px bawah tanpa teks.
- **Kamera:**
  - Push/pull 0,6–1,2 dtk; whip 0,3 dtk dengan motion blur; track lambat tetap tajam (blur hanya di atas ±30 px/frame).
  - Morph atau match-cut antar-dunia, "napas" zoom saat diam, dan shake hanya di impact.
- **Teks:**
  - Ayat dan teks panjang **selalu di HUD**, tidak pernah di dunia.
  - Teks HUD masuk 0,15 dtk *setelah* gerak kamera berhenti.
  - Paling banyak 1 judul + 1 kelompok label + caption dalam satu waktu.
- **Orientasi:** kalau dunia punya sumbu yang jelas (kedalaman, waktu, jarak), tampilkan alat bantu HUD seperti penggaris atau mini-map supaya penonton tidak tersesat saat shot berganti cepat.
- **Adab:** Nabi ﷺ, Jibril, dan Allah tidak digambar; Nabi ﷺ cukup berupa cahaya. Sahabat atau tokoh tampil sebagai siluet tanpa wajah atau ikon. Tidak ada darah.

## Hal yang dipelajari dari gunung-akar

- **Zoom track akar:** zoom 1,6 di storyboard terlalu dekat, karena bentuk U akar tidak terlihat. Yang dipakai 1,05. Pilih zoom yang memperlihatkan *bentuk* benda yang sedang dibicarakan.
- **Posisi mini-map:** jangan di kiri atas, karena bertabrakan dengan judul. Taruh di kiri bawah jendela kamera.
- **Motion blur:** blur di semua gerak membuat label kabur. Batasi blur hanya di atas ambang kecepatan (whip saja).
- **Urutan label dan narasi:** label IMAN sempat muncul sebelum kata "iman" diucapkan. Kunci setiap label ke `kw()` kata itu, jangan ke awal adegan.
- **Tanda ✓ tertinggal:** ✓ dari satu shot sempat terbawa ke shot berikut. Beri setiap elemen HUD jendela `at`/`until` yang tegas.
- **Panel ayat:** atur lebarnya supaya baris Arab tidak patah dan terjemah tidak menyisakan satu kata di baris baru.
- **Waktu jadi:** QA agen ±1 jam, render ±15 menit untuk 67 dtk, dan HP ±11–12 MB.
