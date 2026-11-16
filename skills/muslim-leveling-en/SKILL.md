---
name: muslim-leveling-en
description: "SOP membuat ulang video Muslim Leveling (seri \"Bukan Karangan Manusia\") dalam bahasa Inggris untuk akun YouTube @muslim.levelingup: urutan episode, naskah Inggris yang natural (bukan terjemahan kaku, istilah Islami umum tetap), ayat Saheeh International, TTS Gemini en-US, teks layar Inggris di Remotion, modifikasi sidik digital (latar dibalik + zoom 105% + animasi 103%, transisi zoom-out, grading), musik latar baru yang lebih kecil, SFX tambahan, metadata YouTube, dan jadwal Repliz di jam penonton Amerika. Pakai saat user minta versi Inggris/English, video untuk penonton global/Amerika, akun @muslim.levelingup, atau menyebut muslim-leveling-en."
---

# Muslim Leveling EN: SOP versi bahasa Inggris

Mengubah video Indonesia yang sudah jadi menjadi video bahasa Inggris yang **terasa baru**: suara, teks, musik, SFX, dan susunan visual berbeda. Video Indonesia **tidak pernah diubah**; semua kerja ada di `projects/<topik>/en/`.

Baca juga: `AGENTS.md` (VPS, Vertex, aturan render), skill `gaya-muslim-leveling` (gaya, safe zone, aturan dalil). Contoh lengkap yang sudah tayang: **`projects/raja-lebah/en/`** (komposisi `RajaLebahEN`); bandingkan `en/film-remotion/src/Video.tsx` dengan `film-remotion/src/Video.tsx` untuk melihat setiap perubahan.

## Keputusan user (jangan ditanya ulang)
| Hal | Ketetapan |
|---|---|
| Kanal | **YouTube saja**: `@muslim.levelingup` (nama akun "Muslim Leveling"). Bukan TikTok/IG/FB/Threads. |
| Nama seri | Berbentuk pertanyaan: **`SERIES: COULD A HUMAN WRITE THIS? · N`**, N mulai dari 1 |
| Urutan | Ikuti nomor seri Indonesia, mulai dari yang paling awal (`tools/en_project.py status`). Nomor ganda (mis. dua proyek "17") → tanyakan urutannya ke user. |
| Watermark / end card | "Muslim Leveling" / **"Follow for more"** |
| Suara | Sadachbia, gaya narator dokumenter berbahasa Inggris |
| Bahasa | Natural untuk penutur asli, **bukan** terjemahan kata per kata. Istilah Islami umum tetap: Dunya, Akhirah, Tawakkul, Sabr, Barakah, Sunnah, Tahajjud, Surah, Qur'an. |
| Musik | Lebih kecil dari versi pertama (musik saja ±−24 LUFS, ±10 dB di bawah total), nada berbeda dari versi Indonesia |
| SFX | Banyak, supaya penonton terpaku (v2 Raja Lebah: 62 → 109 SFX) |

## Gerbang persetujuan (wajib)
1. **Draf naskah EN** (`en/naskah-en.md`) → tunjukkan narasi lengkap, lalu **tunggu persetujuan sebelum TTS**. Persetujuan untuk satu episode tidak berlaku untuk episode lain.
2. **Video jadi** → kirim versi HP via SendUserFile, sebut apa yang belum kamu cek (gerak/suara tidak bisa kamu tonton).
3. **Jadwal** → hanya `--kirim` kalau user minta dijadwalkan.

## Langkah

### 0. Pilih episode & cek sumber
```bash
/usr/bin/python3 -I tools/en_project.py status
```
Kolom `sumber`: `remotion` = bisa langsung; `mp4 saja` (quran-birmingham, romawi-akan-menang) = Video.tsx harus dibangun ulang dari `templates/remotion`; `kosong` = lewati. Kolom `EN`: `-`, `draf`, `narasi`, `video`, `terjadwal`.

### 1. Siapkan folder `en/`
```bash
/usr/bin/python3 -I tools/en_project.py init projects/<topik>
```
Membuat `en/film-remotion/` (salinan tanpa `build`, `node_modules` di-symlink ke target asli), `en/voice/gen.py` (dari `templates/gen-en.py`, transkrip en-US), `tighten.py`, `cues.py`, dan `en/film/timeline.id.json` (SFX versi Indonesia, sumber remap).

### 2. Naskah Inggris → `en/naskah-en.md` + `en/voice/script.txt`
Baca `naskah.md`, `voice/script.txt`, dan semua teks di `film-remotion/src/Video.tsx` versi Indonesia.
- **Narasi**: pertahankan beat (hook, fakta, ayat, "to be fair"/jujur, ummi, refrein, CTA), tulis ulang dengan kalimat Inggris alami. Panjang ±220–240 kata untuk ±85 dtk.
- **Ayat**: TTS **tidak** membaca Arab. Format: `In Surah An-Nahl, verse sixty-eight, Allah says: "<terjemahan>"`. Terjemahan **Saheeh International**, cek tiap ayat:
  `curl -s https://quranenc.com/api/v1/translation/aya/english_saheeh/16/68`. Merapikan urutan kata di narasi boleh (catat di naskah); kartu ayat di layar memakai teks asli.
- **Hal yang hilang dalam bahasa Inggris** harus dijelaskan dalam satu kalimat (contoh: perintah berbentuk perempuan → "In Arabic, every one of them is in the feminine form.").
- Shalawat: "Prophet Muhammad, peace be upon him" di narasi, ﷺ di teks.
- Refrein tetap: **"He couldn't read or write… so who taught him?"**; CTA "Save this." + teaser episode berikutnya (judul Inggrisnya). Teaser selalu mengikuti **urutan seri EN**, bukan teaser versi Indonesia: seri ID dulu dibagi per musim ("episode terakhir · 4/4"), seri EN terus bersambung → tulis "Next episode: …" dan kartu "NEXT · EPISODE N+1". Nomor N dihitung dari episode EN yang sudah dibuat (Abu Lahab = EN 3 walau bukan BKM).
- Angka tulis dengan kata atau digit biasa ("two thousand", "394"); hindari singkatan yang ambigu.
- `naskah-en.md` berisi: narasi, ayat (Saheeh, tanggal cek), tabel teks layar ID → EN, rencana modifikasi visual/audio. Lalu **minta persetujuan**.

### 3. TTS + durasi
Isi `VOCAB` (nama yang sulit, maks ±4) dan baris per-video di `STYLE` (`en/voice/gen.py`), lalu dari `projects/<topik>/en/`:
```bash
/usr/bin/python3 -I voice/gen.py                 # take1 + take2
/usr/bin/python3 -I voice/tighten.py take2 1.06 0.7   # EN memakai tempo 1.06 (bukan 1.10): ±165 kata/menit
```
**Bandingkan transkrip tiap take dengan script.txt** dan pilih take yang bersih (Raja Lebah take1 menyisipkan "seventh second century"). Ulangi satu take: `voice/gen.py 2`.

### 4. Cues
```bash
/usr/bin/python3 -I tools/en_project.py words projects/<topik>   # index:word@detik
```
Di `en/voice/cues.py`: `OPENERS` = kata pembuka tiap adegan (sama jumlahnya dengan adegan ID), `BOUNDS = []`, `FIX` = indeks → ejaan caption (tanda baca, "Prophet", "Him,", kutip “ ”), `EXTRA["ayat"]` = bagian Arab untuk sorotan **yang diwaktukan ke frasa terjemahan Inggrisnya** (bagi rata berurutan sepanjang frasa), `ref` gaya Inggris `An-Nahl 16:68`. Lalu `/usr/bin/python3 -I voice/cues.py`.

### 5. Video.tsx versi EN
**Cara cepat (sejak Ep 12):** tulis `en/edits.py` berisi `N` (nomor episode EN), `K = dict(...)` (detik kata Inggris, nama kunci sama dengan versi ID), `NEXT` (opsional) dan `EDITS = [(lama, baru[, jumlah]), ...]`, lalu
```bash
/usr/bin/python3 -I tools/en_project.py tsx projects/<topik>
```
Alat ini selalu membangun ulang dari Video.tsx Indonesia (aman diulang) dan otomatis: label seri, blok K, `Bg`/`BT` + bungkus baris `<Sky|Stars|Clouds .../>`, refrein, kartu Al-'Ankabut 48 & An-Najm 3–4, SIMPAN, BERIKUTNYA, Download sekarang, transisi zoom-out, grading, nama komposisi `…EN` di Root.tsx. Ia mencetak `TIDAK KENA` (EDITS yang tidak cocok) dan `SISA?` (teks yang masih mirip Indonesia). `SISA?` tidak lengkap: tetap periksa daftar `grep -o 'text="[^"]*"\|label="[^"]*"\|id="[^"]*"…'` dan contact sheet. Proyek yang menghitung K dengan `kw("kata")` saat runtime (mis. Maryam): K tetap ditulis sebagai angka; `export` fungsi `kw`/`kwe` agar tsc tidak protes.
Setelah `remap`, jalankan `tools/en_project.py autosfx projects/<topik>` (whoosh tiap Title, thunk tiap kartu/pill, riser→impact tiap ayat), lalu tambahkan manual: hook, refrein, SFX tema. Proyek tanpa data ayat di cues tidak mendapat drop musik otomatis: isi `bed.drops` di timeline.json.

Semua edit di `en/film-remotion/src/`. Ganti nama komposisi di `Root.tsx` dan nama export → `<Nama>EN`.
1. **K**: ganti **nilai** saja (detik kata Inggris yang setara), **nama kunci tetap** (dipakai `remap`). Kata yang urutannya berubah dalam bahasa Inggris: pilih kata yang maknanya sama.
2. **Semua teks layar** ke Inggris: `Title`, `Pill`, chip, label kartu, hook (`HookLine`), refrein, CTA, teaser, `AyahCard` (`id` = Saheeh, `refT` = `Al-'Ankabut 29:48`), label seri, end card "Follow for more" (proyek ID lama ada yang masih "Download sekarang"; selalu ganti). Tulisan Arab tetap. Cari sisa teks Indonesia:
   `grep -nE ">[^<>{}]*[A-Za-z]{3,}[^<>{}]*<|text=\"|id=\"|refT=" src/Video.tsx`
3. **Adegan ayat**: dulu sorotan Arab ikut bacaan Arab; sekarang ikut terjemahan Inggris. Kalau judul dan sorotan Arab berebut tempat, sembunyikan sorotan di kata kunci berikutnya (pola `hide` di Scene5 Raja Lebah) dan ganti judul dengan `Pill` di dekat objek.
   Pola yang dipakai di Ep 5–11 (proyek ID yang menampilkan bacaan Arab dulu, lalu judul terjemahan): `rec` jangan dipudarkan di kata terjemahan (`K.dan3` dsb. kini = `A1.s`), pindahkan `Sweep` ke **bawah judul** (top ±640–720) dengan latar `rgba(8,10,24,0.62)` + `borderRadius: 28` (Arab di atas awan/objek terang jadi terbaca), dan pill rujukan `until={S[n].end + 0.3}` di bawah sorotan.
   **Jendela waktu yang jadi negatif bikin render error** (`inputRange must be strictly monotonically increasing`): `Pill`/`win()` dengan `until` = kata yang dulu sesudah bacaan Arab, kini sama atau lebih awal dari `at`. Cari `until={K.` dan `win(t, <angka>` di adegan ayat.
   **Angka detik tertulis langsung** (`flashAt(t, [30.4, ...])`, `win(t, 22.9, ...)`) tidak ikut `K`: hitung ulang ke waktu Inggris.
   **Label seri** di proyek yang lebih baru berupa teks langsung di `SeriesLabel` (`SERI: BUKAN KARANGAN MANUSIA · N`), bukan konstanta `SERIES`.
   **CTA ajakan komentar** (mis. Kulit) diganti teaser episode EN berikutnya.
4. **Sidik digital** (salin pola dari `raja-lebah/en`):
   ```tsx
   const BT = 1.03; // animasi latar 103%
   const Bg: React.FC<{ children: React.ReactNode; dy?: number }> = ({ children, dy = 0 }) => (
     <AbsoluteFill style={{ transform: `translateY(${dy}px) scaleX(-1) scale(1.05)` }}>{children}</AbsoluteFill>
   );
   ```
   - Bungkus **lapisan latar** tiap adegan (Sky, Stars, Clouds, Mountain, Valley, HexField, Dust, Rays, Swarm, sarang/objek dekor yang menempel di latar) dengan `<Bg>`, dan beri `t={t * BT}` (juga `pan`/`x` yang memakai `lt`). **Jangan** bungkus teks, kartu, ayat, objek utama yang punya label, atau **diagram berskala/penampang** (mis. penampang gunung + braket km di Gunung Pasak): diagram yang dibalik membuat label dan panah salah arah; cukup beri zoom ringan tanpa flip (`BgZ`).
   - Kalau objek latar yang dibalik menabrak teks, geser dengan `dy` **dan** taruh `<Bg><Sky .../></Bg>` di belakangnya (tanpa itu bagian atas jadi hitam). Overlay gelap penuh layar taruh di luar `Bg`.
   - Matahari/bulan dari `Valley` pindah ke kiri setelah dibalik: turunkan `sun.y` kalau menabrak judul.
   - Transisi adegan di komponen utama: `scale` **1.05 → 1.005** (zoom-out, versi ID zoom-in) dan `rotate` dengan tanda **terbalik**.
   - Grading: overlay `linear-gradient(180deg, rgba(255,150,80,0.10), rgba(90,40,140,0.08))` dengan `mixBlendMode: "soft-light"` di atas adegan, sebelum `Leaks`.
5. QA still (dari `en/film-remotion/`): `npx tsc --noEmit -p .`, `npx remotion bundle --out-dir=build`, still tiap ±2–3 dtk (`--gl=swangle --scale=0.5`) → contact sheet → cek: teks Indonesia tersisa, teks keluar safe zone (y 250–1440, x<940), tabrakan teks vs objek yang dibalik, bagian hitam akibat `dy`, panjang baris Inggris (hook `whiteSpace: nowrap` bisa melebar).

### 6. Audio: SFX + musik
```bash
/usr/bin/python3 -I tools/en_project.py remap projects/<topik>
```
Memindah SFX Indonesia ke waktu Inggris (peta K lama → K baru + batas adegan), memasang bed EN (`EN_BED`: bpm 84, akor Dm/A–Bb–F/A–C/G, pad 0.19, groove 0.14, arp 0.1, bright 0.22, duck 0.6) dan drop musik di adegan ayat.

Lalu **tambah SFX penegas** ke `en/film/timeline.json` (Raja Lebah v2 menambah 47):
| Momen | SFX (gain kira-kira) |
|---|---|
| Lingkungan bertema (lebah, laut, angin…) | `bees` (0.03–0.045, `until`, `n`), `blub`/`plip` untuk air, `room` |
| Sebelum kata kunci hook | `riser` 1–1.5 dtk (0.05) → `impact` tepat di kata (0.09) |
| Tiap judul layar berganti | `whoosh` dur 0.5 (0.07) |
| Kartu/catatan muncul | `thunk` (0.06–0.07) |
| Masuk ayat | `riser` pendek → `impact` lembut (0.06), `clink` pitch 1.6 (0.04) |
| Sesuatu hancur/dicoret | `impact` + `glasscrack` (0.07) |
| Cairan/isi naik | `pour` (`until`, start/end, height) |
| Pengungkapan/kilau | `clink` pitch 1.4–2.0 (0.05–0.06), `powerup` |
| Sebelum refrein "so who taught him?" | `riser` (0.04) |
| Teaser episode berikutnya | SFX sesuai tema teaser |

Mix dan normalisasi:
```bash
/usr/bin/python3 -I tools/mix.py --project projects/<topik>/en
/usr/bin/python3 -I tools/en_project.py loudnorm projects/<topik>   # target -14.0 LUFS, peak ≤ -1.0, musik saja ±-24
```

### 7. Render + versi HP
Dari `en/film-remotion/` di tmux (±15 menit), tunggu dengan `while tmux has-session -t =render; do sleep 10; done` (pakai `=`: tanpa itu tmux mencocokkan awalan, jadi `render` juga cocok dengan `render2` dan antrean menunggu dirinya sendiri; untuk render kedua pakai nama sesi yang tidak berawalan sama, mis. `render-b`) di background:
```bash
tmux new-session -d -s render "cd $PWD && npx remotion bundle --out-dir=build > ../render.log 2>&1 && npx remotion render build <Nama>EN ../<topik>-en_9x16_v1.mp4 --gl=swangle --codec=h264 --crf=18 --audio-codec=aac >> ../render.log 2>&1"
cd .. && ffmpeg -i <topik>-en_9x16_v1.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart <topik>-en_9x16_v1-hp.mp4
```
Cek durasi, −14 LUFS, beberapa frame dari MP4. Kirim HP mp4 + `caption-en.md` via SendUserFile. Revisi → naikkan versi (`_v2`).

### 8. Metadata YouTube → `en/caption-en.md`
Format yang dibaca `repliz.py video-en`:
```
**Title (≤100 chars):**
<judul Inggris yang memancing rasa ingin tahu> #Shorts

**Description:**
<ringkasan fakta, ayat Arab + Saheeh International (Qur'an 16:68–69), poin 🐝🍯🔬, Qur'an 29:48 + refrein, "Series: Could a Human Write This? · Episode N", ajakan follow>

#quran #islam #couldahumanwritethis #muslimleveling

**Tags:** 6–8 frasa dipisah koma
```
**Maks 5 hashtag termasuk `#Shorts` di judul** → deskripsi maks 4 hashtag (selalu ada `#muslimleveling`). `repliz.py` menolak kalau lebih.

### 9. Jadwal Repliz (hanya jika diminta)
Slot penonton Amerika (riset 2026-11-15, blog vendor; perbarui dengan data YouTube Studio):
| ET | PT | UTC (Repliz menyimpan) | WIB untuk `--jam` |
|---|---|---|---|
| 12.00 | 09.00 | 17.00 | 00.00 hari berikutnya |
| 15.00 | 12.00 | 20.00 | 03.00 hari berikutnya |
| 19.00 | 16.00 | 00.00 hari berikutnya | 07.00 hari berikutnya |

Saat DST Amerika (14 Mar – 7 Nov 2027, dst.) semua jam WIB/UTC maju 1 jam lebih awal (23.00, 02.00, 06.00 WIB). Cek slot terisi dulu (`repliz.py jadwal` hanya menampilkan 100 pertama; filter akun `@muslim.levelingup`).
```bash
/usr/bin/python3 -I tools/repliz.py video-en projects/<topik> --jam 2026-11-17T00:00+07:00          # simulasi
/usr/bin/python3 -I tools/repliz.py video-en projects/<topik> --jam 2026-11-17T00:00+07:00 --kirim  # kirim
```
Catat ID dan jam (ET, UTC, WIB) di `en/naskah-en.md` bagian `## Jadwal Repliz` (dipakai `status`). Salah jadwal: `repliz.py hapus <id>` lalu kirim ulang.

## Jebakan yang sudah terjadi
- `node_modules` proyek lama berupa symlink relatif; `init` mengikuti target aslinya. Jangan `rsync --exclude build` tanpa `/` (ikut menghapus folder `build` di dalam paket).
- Versi Indonesia lama membaca ayat dalam bahasa Arab dan memakai `BOUNDS` manual; versi EN memakai `OPENERS` karena semua kata ada di transkrip.
- `Bg` dengan `dy` tanpa `Sky` di belakangnya → pita hitam di atas.
- Gerbang hashtag menghitung `#Shorts` di judul.
- `tools/mix.py`: pad dulu berhenti di detik 64 (sudah diperbaiki: diulang sepanjang durasi); `bed.chords` dan SFX `bees` tersedia sejak versi EN.
- `tmux has-session -t render` mencocokkan awalan nama, jadi juga cocok dengan `render2`: antrean render kedua menunggu dirinya sendiri dan macet berjam-jam (Laut Gelap, 2026-11-15). Pakai `-t =nama` dan nama sesi yang tidak berawalan sama.
- Draf naskah EN juga ditulis di `en/naskah-en.md` bersama tabel teks layar ID → EN; di pesan persetujuan, sebut penyimpangan dari versi ID (teaser, end card, ayat yang digabung, terjemahan tafsir yang dirapikan) supaya user bisa menolak.
- TTS bisa **melewatkan satu kalimat** (Bahasa Semut: kalimat hook berkutip "language" hilang di dua take; Angin: take 2 melompat dari "Yet the Qur'an" ke kalimat berikutnya). Bandingkan jumlah kata transkrip dengan `wc -w script.txt`; kalau kurang, rapikan kalimatnya (buang kutip) lalu ulang take itu.
- Transkrip memecah kata berstrip jadi dua entri berturut ("pain", "pain-sensing"; "worst", "worst-burned"): di `FIX` isi entri pertama dengan kata lengkap dan entri kedua `""` (caption membuang kata kosong).
- `OPENERS` dicocokkan berurutan dari depan: "To be" ikut cocok dengan "to be felt" di adegan sebelumnya (Kulit). Pakai pembuka yang khas ("To be fair,") dan cek batas adegan hasil `cues.py`.
- Refrein + kartu jawaban An-Najm butuh ±2 dtk sebelum adegan CTA. Kalau jeda setelah "taught him?" < 1,5 dtk, sisipkan hening (Rumah Laba-laba: 1,6 dtk; geser `narasi.json` setelah titik sisip) dan geser batas adegan di `cues.py`.
- Antrean render banyak episode: satu sesi tmux per episode (`ep05`, `ep06`, …), tiap sesi menunggu sesi sebelumnya dengan `-t =epNN`.
- **Kalimat diakhiri elipsis bisa dilewati TTS di semua take** (Kahfi 309: "…and it turns out…" hilang di 4 take). Akhiri kalimat dengan titik/koma; elipsis hanya di tengah kalimat.
- Proyek lama (seri Mukjizat/Angka/Rahasia Bahasa) punya **waktu manual di Video.tsx**: `kw()`/`kwe()` runtime, `ansAt`, `times: [...]`, `until={19.4}`, `ramp(t, 31.2, 32)`, `WORDS.slice(24, 45)`, `INSERT`/`AYATS` berbasis indeks kata di `cues.py`. Cari dengan `grep -nE "(ramp|win|interpolate)\(t, [^)]*\b[1-9][0-9](\.[0-9]+)?\b"` dan petakan ulang ke detik EN; still gagal "inputRange must be strictly monotonically increasing" berarti dua K tertukar karena urutan kata Inggris beda ("vast desert", "iron ring", "rush… like moths") → tukar nilainya.
- `init` sekarang mengosongkan `BOUNDS` manual ID; proyek yang di-init sebelumnya cek `grep "^BOUNDS = \[[0-9]" projects/*/en/voice/cues.py`. `cues.py` sangat lama (Al-Fatihah) tanpa `OPENERS` → isi `BOUNDS` EN manual.
- Varian Neon (`<Background>`) tidak dikenali builder (0 lapisan Bg): bungkus manual `<Bg><Background t={t * BT} /></Bg>`. Komponen `Title` proyek lama tidak mengenal `_`: tambahkan `.replace(/_/g, " ")` atau pakai `*KATA* *KATA*`.
- Font KUFI tidak punya `×` (tampil sebagai titik): pakai kata "TIMES" atau bungkus `×` dengan `fontFamily: READEX`. Format angka ID (`toLocaleString("id-ID")`, `replace(".", ",")`, regex pemisah ribuan ".") → ubah ke format EN.
- Deskripsi YouTube: `#1`/`#2` (mis. "Secret #1") terhitung hashtag oleh `repliz.py` → tulis "Secret 1".
- Video yang bukan soal "siapa penulis Al-Qur'an" (Al-Fatihah, Aamiin, Allahu Akbar) diunggah lepas: tanpa label seri dan tanpa nomor episode.
- Judul 2 baris di atas kartu ayat/perkamen sering menimpa kartu karena teks Inggris lebih panjang: kecilkan `size` (60–70) atau pendekkan teks; cek di contact sheet.
- Jangan janjikan YouTube pasti menganggapnya konten baru; yang paling membedakan adalah bahasa, suara, dan teks.
