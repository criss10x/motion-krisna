---
name: gaya-muslim-leveling
description: "Gaya & workflow Muslim Leveling untuk video motion graphic islami 9:16 (1080x1920) yang dirender dengan Remotion di VPS Ubuntu: latar hijau-hitam berpola geometris islami, objek utama yang berubah status mengikuti cerita, judul Reem Kufi kapital, kartu dalil Arab Amiri + terjemahan + nomor rujukan, narasi Gemini TTS (Vertex), SFX sintetis, caption TikTok/IG/Shorts. Pakai saat user minta video/konten islami, dakwah, nasihat, kisah, mukjizat Quran, atau isu berita dengan sudut islami untuk Muslim Leveling, atau menyebut gaya-muslim-leveling."
---

# Gaya Muslim Leveling

Cocok untuk: konten islami pendek (dakwah, nasihat, kisah, mukjizat Quran, isu berita/kebijakan dari sudut islam, pengingat ibadah) untuk penonton muslim Indonesia. Tidak cocok untuk: konten ceria anak, promo diskon, hiburan murni.

Repo: `~/motion-krisna` (lihat `AGENTS.md` untuk VPS & Google Cloud, `templates/remotion/README.md` untuk template). Semua path di bawah relatif ke root repo kecuali disebut lain.

## Pilih varian dulu
| Varian | Kapan | Titik awal | Objek utama |
| --- | --- | --- | --- |
| **Neon** (default baru) | Ibadah, keutamaan surah, kisah, mukjizat; nuansa khidmat-elegan | `templates/remotion/` (contoh Al-Ikhlas, komposisi `AlIkhlas`) | Bintang 8 sudut / mushaf / pintu cahaya, glow + light leak |
| **Klasik kubah** | Isu berita/kebijakan, kritik kezaliman, nasihat tegas | `templates/remotion/` + gaya di bawah (kubah, palet klasik, latar flat ramai). Acuan visual: `assets/contact-sheet*.jpg`, `projects/romawi-akan-menang/preview.html` | Kubah logo: redup → retak → menyala → logo |

Kalau user tidak menyebut, usulkan varian sesuai topik dalam satu kalimat lalu lanjut.

## Palet
| Peran | Klasik | Neon | Dipakai untuk |
| --- | --- | --- | --- |
| Latar | #06110E | #030B09 | background |
| Kartu | #0B1F19 | #0B1F19 | kartu dalil, tag, chip, pill gelap |
| Primary | #34D399 | #2EF2A4 | objek utama, progress bar, kata kunci positif, CTA |
| Teks | #FFF9EF | #FFF9EF | judul & isi |
| Tertiary | #00E1EF | #00E1EF | aksen, rujukan hadis, chip |
| Emas | – | #E9C46A | kata kunci utama, angka, cahaya |
| Peringatan | #FF5A5F | #FF5A5F | HANYA beban/kezaliman ("zalim/pajak/dipotong"), retak, stempel (hemat) |
| Muted | #8FB5A8 | #8FB5A8 | label sumber |

Turunan untuk ilustrasi (klasik): hijau gelap #0E241D/#123A2E/#163B31/#174A3A/#1F5A48, api #FF5A5F→#FFB38A.

## Tipografi (`@remotion/google-fonts`, sudah di template)
- Judul: Reem Kufi 700, 96 px, KAPITAL, line-height 1.08, letter-spacing −1px, tengah, y≈450.
- Isi/label: Readex Pro 500/700: label 44 px, sumber 28 px (muted), terjemahan 40 px, caption karaoke 50 px.
- Arab: Amiri 700, 64–70 px, line-height 1.75, `direction: rtl`.
- Angka besar: Reem Kufi 150 px, count-up; merah bila soal beban rakyat, emas di varian neon.
- Teks di atas latar ramai: pill gelap semi-transparan; judul diberi shadow `0 6px 0 <latar>` (neon: + glow).

## Sistem layar (1080x1920, safe zone TikTok/Reels)
- Teks penting di y 250–1440; kolom kanan x≥940 kosong (tombol); 480 px bawah kosong (caption platform).
- Progress bar 6 px primary di y=236, x 80–1000 (neon: titik per bab, `CHAPTERS`).
- Watermark: logo 52 px + "Muslim Leveling" Reem Kufi 30 px di (80, 262), muncul dtk 2, hilang di end card. Hook 0–2 dtk TANPA logo.
- Judul y=450 · label sumber y=600 · objek utama pusat (540,1080) · kerumunan/chip y 1250–1440 · caption karaoke berakhir y≤1400.
- Kartu dalil 920 px lebar di (540,1030): Arab → terjemahan → "HR. Muslim no. …" / "QS. Ar-Rum: 2–4" (tertiary) → logo kecil + "Muslim Leveling".
- End card 2,5–3,5 dtk (`END_CARD` di `cues.py`): objek utama mengecil-pudar, logo 460 px di (540,900) tumbuh di titik sama, nama 92 px y=1220, pill "Download sekarang" tertiary y=1360.

## Latar & tekstur
3 lapis parallax: lingkaran radial lembut, pola geometris islami (2 persegi bertumpuk 45° + lingkaran, stroke 2 px primary opacity .09, tile 140 px) bergeser pelan, 26 partikel seeded naik pelan. Neon: + light leak WebGL (`Leaks`, potong di batas adegan).

### Environment flat RAMAI (wajib untuk varian klasik, permintaan user 2026-11-01)
Latar polos terasa sepi. Buat lingkungan ilustrasi flat sesuai topik, berlapis, parallax beda kecepatan:
- Lapisan: langit gradasi (gelap → tosca saat harapan) · matahari/bulan · gunung jauh #0E241D · hutan jauh (20 pohon segitiga #123A2E) · objek utama · hutan/kota dekat #174A3A · tanah #0A1C17 · bangunan (rumah, sekolah + bendera, klinik +, masjid, gedung) · kerumunan · efek (asap, bara, hujan, burung) paling depan.
- Lingkungan ikut cerita: api membesar di klimaks lalu padam, asap tersibak saat dalil, langit cerah + burung di CTA.
- Deterministik: pakai `random("seed-i")` dari `remotion`, jangan `Math.random()`. Bentuk berulang (pohon, rumah, awan, api, burung, orang) jadi komponen kecil yang di-`map`.

## Objek utama
- **Kubah logo (klasik):** path kubah bawang (lebar 560, tinggi 850), stroke 56 px gradasi #A7F3D0 → #34D399 → #00E1EF + garis dalam 10 px. Tanpa bulan sabit (bulan hanya di logo). Status: redup (opacity .25) → retak (path merah 9 px digambar, shake) → pulih (retak ditarik balik) → menyala penuh (+halo 130 px opacity .12) → logo di end card. Napas ±2% sepanjang video.
- **Neon:** `Star` / `Book` / `Arch` di template; garis digambar (`draw`), lalu glow (`neon()`), lalu terisi. Tetap satu objek utama yang berubah status per bab.

## Ilustrasi
Vektor flat + gradasi (klasik) atau garis neon (neon): HP, grafik batang, ikon bank/e-wallet/keranjang dalam lingkaran kartu, kerumunan (kepala+badan, 12x4, deterministik), timbangan keadilan, mushaf, slip "PUNGUTAN" dicoret.
Larangan: foto, emoji sebagai ilustrasi, logo instansi digambar ulang, wajah tokoh. Figur orang = siluet tanpa wajah. **Nabi ﷺ hanya berupa cahaya** (pintu/sinar), tanpa tubuh, siluet, atau wajah; begitu juga para sahabat dan malaikat tidak digambar berwajah.

## Gerak khas (Remotion: semua dari `t = frame/fps`, pakai helper `ramp`/`win`/`BACK`/`OUT`/`IN` di template)
- Judul per kata mask reveal naik, `BACK` (≈back.out 1.8–2), 0,45 dtk, stagger 0,08.
- Elemen masuk `BACK` 0,5 dtk; keluar `IN` 0,3 dtk.
- Stempel ("BELUM RESMI"): slam dari scale 2,4 dengan easing in kuat + shake 0,33 dtk.
- Teks Arab muncul per kata mengikuti bacaan narasi (`Arabic` dengan `step` ≈0,42 dtk, atau waktu kata dari `cues.json`).
- Klimaks = dalil/doa terkuat: kalimat kunci jadi merah/emas + kartu pulse + shake 1,3.
- Kamera zoom 1,00 → 1,05 + rotasi ±0,8° per adegan.
- Tempo 3,5–9 dtk per adegan; adegan dalil lebih lambat.
- Semua waktu kata kunci diambil dari `cues.json` (konstanta `K`), jangan ditebak.

## Suara
- Narasi: Gemini TTS `gemini-3.8-flash-tts` (Vertex, `global`). Klasik: voice **Sadachbia** (pria), style "suara dalam & tegas seperti pengkhotbah muda; melambat & khidmat saat hadis". Neon: Sadachbia atau **Sulafat** (perempuan, lembut). Buat 2 take, pilih yang durasinya pas (≤ target − end card) dan transkripnya cocok.
- SFX halus sintetis, tanpa musik (default), lewat `tools/mix.py`: `clink` (notif/chip), `pop`, `impact` (angka/stempel/klimaks), `whoosh` (transisi), `glasscrack` (kubah retak), `room` (dasar adegan dalil), `riser`→`impact` (klimaks & CTA), `scrape` (coretan), `hiss`, `powerup` (objek menyala). Target −14 LUFS.

## Workflow di VPS (Remotion, terbukti 2026-11-02)
Jalankan dari `~/motion-krisna`. Render & langkah lama jalankan di dalam `tmux` (koneksi SSH bisa putus).

1. **Topik.** Riset web berita/sumber terkini; tawarkan 4–5 sudut islami; ikuti sikap user (mis. berpihak ke rakyat) tapi kritik KEBIJAKAN, bukan pribadi; tanpa ajakan rusuh.
2. **Fakta.** Angka harus bersumber (aturan/PMK, tanggal, lembaga). Pernyataan pejabat ≠ aturan resmi → sebut "belum resmi". Kutipan tokoh dicek tahun aslinya.
3. **Dalil.** Hanya ayat & hadis shahih/hasan dengan nomor; cek derajat di web (mis. Abu Dawud 2937 "shahibul maks" = dha'if Albani → dibuang). Teks Arab yang tidak terverifikasi → tandai [CEK] dan minta user cek ke ustadz/kitab. Tulis `projects/<topik>/naskah.md` (naskah + daftar dalil bernomor + sumber), minta user setujui sebelum TTS.
4. **Siapkan proyek.**
   ```bash
   T=<topik>; mkdir -p projects/$T/voice projects/$T/film
   cp -r templates/remotion projects/$T/film-remotion
   cp templates/cues.py templates/gen.py projects/$T/voice/
   (cd projects/$T/film-remotion && npm i && npx remotion browser ensure) &
   ```
   Ganti id komposisi `AlIkhlas` di `src/Root.tsx` dengan nama topik (PascalCase, mis. `PajakZalim`) bila mau; pakai id yang sama di semua perintah di bawah.
5. **Narasi.** `voice/script.txt` = versi TTS: angka ditulis huruf, ejaan bunyi ("onlen", "i-wolet"), jeda "…". Di `voice/gen.py` atur `VOICE`, `STYLE`, `VOCAB` (istilah/nama untuk transkrip). Lalu dari `projects/<topik>/`:
   ```bash
   gcloud auth print-access-token >/dev/null && echo TOKEN_OK
   python3 -I voice/gen.py          # take1 + take2; ulangi satu take: python3 -I voice/gen.py 2
   ```
   Error SSL `bad record mac` = jaringan, ulangi saja.
6. **Pilih & percepat take.** Cek durasi + transkrip yang dicetak. `ffmpeg -i voice/take2.wav -af atempo=1.12 voice/narasi.wav && cp voice/take2.json voice/narasi.json`. Atempo harus sama dengan `SPEED` di `cues.py` (1.0 = tanpa percepatan, cukup `cp` wav-nya).
7. **Cues.** Isi `OPENERS` (kata pembuka tiap adegan, urut) dan `FIX` (salah dengar → teks naskah) di `voice/cues.py`, lalu `python3 -I voice/cues.py` → `film-remotion/public/cues.json` (adegan, durasi, waktu tiap kata). Batas adegan = tengah jeda sebelum kalimat baru.
8. **Adegan.** Edit `film-remotion/src/Video.tsx`: `C` (palet varian), `K` (waktu kata kunci dari `cues.json`), `CHAPTERS`, cut di `Leaks`, `END = S[n].start`, dan komponen `Scene1…SceneN` (satu per adegan + end card). Cek tipe: `npx tsc --noEmit`.
9. **QA frame (contact sheet).** Bundle sekali, lalu still cepat; lihat sheet sekali, perbaiki tabrakan/safe zone, ulangi.
   ```bash
   cd film-remotion && npx remotion bundle --out-dir=build && mkdir -p ../shots
   for f in 45 300 600 900 1200 1500; do npx remotion still build AlIkhlas ../shots/f$f.jpg --frame=$f --gl=swangle --scale=0.5; done
   ffmpeg -y -loglevel error $(for f in 45 300 600 900 1200 1500; do echo -i ../shots/f$f.jpg; done) -filter_complex hstack=6 ../shots/sheet.jpg
   ```
   Pilih frame = tengah tiap adegan + momen klimaks + end card (frame = detik × 30). Bandingkan dengan `assets/contact-sheet*.jpg`.
10. **Audio.** `film/timeline.json` (contoh `templates/timeline.example.json`: `narration`, `beats [{at:0}]`, `sfx` dengan waktu dari `K`/`cues.json`) → `python3 -I ../../tools/mix.py --project .` → `cp film/audio-nomusic.wav film-remotion/public/narasi.wav`. Cek loudness: `ffmpeg -i film/audio-nomusic.wav -af ebur128 -f null - 2>&1 | grep "I:" | tail -1`.
11. **Render (tmux).**
    ```bash
    tmux new -s render
    cd projects/<topik>/film-remotion && npx remotion render AlIkhlas ../<topik>_9x16_v1.mp4 --gl=swangle --codec=h264 --crf=18 --audio-codec=aac
    ```
    Lepas: `Ctrl-b d`; kembali: `tmux attach -t render`. Sebelum render penuh, ulangi `bundle` bila `Video.tsx` berubah setelah QA (render langsung dari `src` juga boleh).
12. **Versi HP (<30 MB).** `ffmpeg -i <topik>_9x16_v1.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart <topik>_9x16_v1-hp.mp4`. Cek ukuran (`ls -lh`); kalau masih >30 MB naikkan CRF 1–2.
13. **Caption & kirim.** `caption.md` 3 platform (contoh `templates/caption.example.md`), lalu kirim MP4 versi HP + caption (user mengambil lewat Claude desktop app atau `scp ml-vps:~/motion-krisna/projects/<topik>/*.mp4 .`).

Yang di-commit hanya perubahan workflow (tools, templates, skill, panduan). Folder proyek, MP4, `node_modules/`, `voice/take*`, `shots/`, `build/`, `public/narasi.wav` tidak di-commit.

Jalur lama (`preview.html` + GSAP + `tools/record.mjs`, Chrome headless) masih bisa untuk membuka proyek lama di `projects/`: `node tools/record.mjs --project projects/<topik> --page preview.html` lalu mux dengan audio. Proyek baru pakai Remotion.

## Caption (tiga versi)
- TikTok: 2–3 baris pendek, hook = baris pertama, ajakan komentar satu kata ("Tulis ADIL"), 6–8 hashtag, akhiri #muslimleveling #fyp.
- Instagram Reels: paragraf pendek, kutip dalil + nomor HR/QS, "📌 Simpan & bagikan", "📲 Muslim Leveling — link di bio", baris Sumber, ≤10 hashtag.
- YouTube Shorts: judul ≤100 karakter + #Shorts, deskripsi 3 paragraf (fakta + sumber, dalil, sikap), ajakan like/subscribe, 5–6 hashtag.

## Dilarang di gaya ini
- Hadis dha'if/palsu atau dalil tanpa nomor rujukan.
- Menggambar Nabi ﷺ dalam bentuk apa pun selain cahaya.
- Menghina pribadi/fisik tokoh, logo instansi, ajakan anarkis.
- Angka tanpa sumber; pernyataan pejabat disajikan sebagai aturan resmi.

## Cek khas gaya (sebelum render penuh)
- [ ] Palet hanya dari tabel varian; merah hanya untuk beban/kezaliman.
- [ ] Reem Kufi / Readex Pro / Amiri tampil (bukan font cadangan) di contact sheet.
- [ ] Objek utama muncul & berubah status di tiap bab; berakhir jadi logo.
- [ ] Watermark mulai dtk 2, hook tanpa logo; judul y≥450 tidak tabrakan dengan watermark.
- [ ] Safe zone: tidak ada teks penting di x≥940 atau y>1440; caption karaoke ≤1400.
- [ ] Setiap kartu dalil ada nomor HR/QS + label Muslim Leveling; teks Arab terverifikasi atau ditandai [CEK].
- [ ] Durasi video = `cues.json` duration; narasi selesai sebelum end card.
- [ ] Audio ≈ −14 LUFS; versi HP < 30 MB.
