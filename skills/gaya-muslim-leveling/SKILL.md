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

## Workflow di VPS (Remotion, terbukti 2026-11-03: Al-Fatihah 62,8 dtk)
Jalankan dari `~/motion-krisna`. Python selalu `/usr/bin/python3 -I` (lihat Pelajaran teknis). Render & langkah lama di dalam `tmux`.

1. **Sudut dulu, bukan naskah.** Dari topik user, riset lalu tawarkan 4–5 sudut (judul kerja · inti · hook · dalil utama) + rekomendasi dan alasannya (manfaat amal untuk penonton, potensi simpan/bagikan). **Tunggu user memilih.** Isu berita: ikuti sikap user (mis. berpihak ke rakyat) tapi kritik KEBIJAKAN, bukan pribadi; tanpa ajakan rusuh.
2. **Fakta.** Angka harus bersumber (aturan/PMK, tanggal, lembaga). Pernyataan pejabat ≠ aturan resmi → sebut "belum resmi". Kutipan tokoh dicek tahun aslinya.
3. **Dalil & naskah.** Hanya ayat & hadis shahih/hasan dengan nomor; cek derajat di web (Dorar, Sunnah.com; mis. Abu Dawud 2937 "shahibul maks" = dha'if Albani → dibuang). Hadis yang diperselisihkan sanadnya → tulis siapa yang menshahihkan ("shahih menurut Al-Albani"). Teks Arab → [CEK], minta user cocokkan dengan mushaf/kitab. Panjang `script.txt` **maksimal 170 kata** (termasuk transliterasi ayat); di bawah itu boleh, tapi jangan terlalu pendek. Patokan durasi: 125 kata ≈ 75 dtk take mentah ≈ 59 dtk setelah `tighten.py` (1.15), jadi 170 kata ≈ 80 dtk setelah tighten (+ end card 3 dtk). Wajib ada **value**: ajakan amal konkret (mis. 3 langkah praktis) di akhir. Tulis `projects/<topik>/naskah.md` (tabel adegan, dalil, catatan akurasi, sumber) + `voice/script.txt`, **minta user setujui sebelum TTS**.
4. **Siapkan proyek.**
   ```bash
   T=<topik>; mkdir -p projects/$T/voice projects/$T/film
   cp -r templates/remotion projects/$T/film-remotion
   cp templates/cues.py templates/gen.py templates/tighten.py projects/$T/voice/
   (cd projects/$T/film-remotion && npm i && npx remotion browser ensure) &
   ```
   Ganti id komposisi `AlIkhlas` di `src/Root.tsx` (import, `id`, `component`) dengan nama topik PascalCase (mis. `AlFatihah`); pakai id itu di semua perintah di bawah.
5. **Narasi.** `voice/script.txt` = versi TTS: angka ditulis huruf, ejaan bunyi ("onlen", "i-wolet"), ayat ditulis **transliterasi** ("Alhamdulillahi rabbil 'aalamiin"), jeda "…". Di `voice/gen.py` atur `VOICE`, `STYLE` (arah emosi per bagian), `VOCAB` (pendek). Lalu dari `projects/<topik>/`:
   ```bash
   gcloud auth print-access-token >/dev/null && echo TOKEN_OK
   /usr/bin/python3 -I voice/gen.py          # take1 + take2; ulangi satu take: /usr/bin/python3 -I voice/gen.py 2
   ```
   Error SSL `bad record mac` = jaringan, ulangi saja.
6. **Pilih take & atur durasi.** Pilih take yang lebih ringkas dan transkripnya cocok. TTS cenderung lebih panjang dari perkiraan (Al-Fatihah: 75 dtk untuk naskah 60 dtk). Kalau > target:
   ```bash
   /usr/bin/python3 -I voice/tighten.py take1 1.15     # pangkas jeda >0,32 dtk + atempo -> narasi.wav/.json final
   ```
   lalu `SPEED = 1.0` di `cues.py`. Jangan atempo > 1.2 (terdengar terburu-buru). Kalau cukup dipercepat: `ffmpeg -i voice/take2.wav -af atempo=1.12 voice/narasi.wav && cp voice/take2.json voice/narasi.json` (SPEED = atempo).
7. **Cues.** Di `voice/cues.py`: `OPENERS` (kata pembuka tiap adegan), `FIX` (ejaan transkrip → naskah, mis. "salat"→"shalat", "hambaku"→"hamba-Ku"). Bacaan Arab **tidak ikut ditranskrip** (muncul sebagai celah 2–4 dtk): ambil awal/akhirnya dengan `ffmpeg -i voice/narasi.wav -af silencedetect=n=-38dB:d=0.18 -f null - 2>&1 | grep silence_`, isi `BOUNDS` manual bila adegan dibuka ayat, dan taruh rentang ayat di `EXTRA` (mis. `{"ayat": [{"s":..,"e":..,"ar":..,"lat":..,"no":..}]}`). Lalu `/usr/bin/python3 -I voice/cues.py` → `film-remotion/public/cues.json`.
8. **Adegan.** Edit `film-remotion/src/Video.tsx`: `C` (palet varian), `K` (waktu kata kunci dari `cues.json`), `CHAPTERS`, `CUTS` untuk `Leaks`, `END = S[n].start`, komponen adegan. Bagian berulang dengan layout sama (mis. dialog ayat ↔ jawaban) → **satu lapisan kontinu** di luar daftar adegan (objek utama tidak berkedip antar-adegan; isi kartu berganti per rentang waktu). Teks Arab muncul per kata dibagi rata di rentang bacaannya. Cek tipe: `npx tsc --noEmit`.
9. **QA frame (contact sheet).** Bundle sekali, lalu still cepat; lihat sheet, perbaiki, ulangi sampai bersih (Al-Fatihah: 3 putaran).
   ```bash
   cd film-remotion && npx remotion bundle --out-dir=build && mkdir -p ../shots
   F="45 300 600 900 1200 1500"   # tengah tiap adegan + klimaks + end card (frame = dtk × 30)
   for f in $F; do npx remotion still build <Id> ../shots/f$f.jpg --frame=$f --gl=swangle --scale=0.5; done
   ffmpeg -y -loglevel error $(for f in $F; do echo -i ../shots/f$f.jpg; done) -filter_complex hstack=6 ../shots/sheet.jpg
   ```
   Cek: tabrakan judul/objek, teks keluar kartu, kata terpotong di tanda hubung, glyph kotak (ﷺ, emoji), safe zone. Bandingkan dengan `assets/contact-sheet*.jpg`.
10. **Audio.** `film/timeline.json` (contoh `templates/timeline.example.json`; waktu SFX dari `K`/`cues.json`) → mix → normalisasi:
    ```bash
    /usr/bin/python3 -I ../../tools/mix.py --project .
    ffmpeg -y -i film/audio-nomusic.wav -af loudnorm=I=-14:TP=-1.0:LRA=11 -ar 48000 film-remotion/public/narasi.wav
    ```
    Pola SFX yang terbukti: `clink` dengan pitch naik bertahap di tiap "jawaban/poin", `riser`→`impact`+`powerup` di klimaks, `pop` per kartu, `whoosh` di tiap cut, `room` tipis di bagian dalil.
11. **Render (tmux).**
    ```bash
    cd projects/<topik>/film-remotion
    tmux new -d -s render "npx remotion render build <Id> ../<topik>_9x16_v1.mp4 --gl=swangle --codec=h264 --crf=18 --audio-codec=aac > ../render.log 2>&1; tmux wait -S render-done"
    tmux wait render-done; tail -3 ../render.log     # atau: tmux attach -t render
    ```
    Bundle ulang dulu bila `Video.tsx`/`public/` berubah setelah QA.
12. **Versi HP (<30 MB).** `ffmpeg -i <topik>_9x16_v1.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart <topik>_9x16_v1-hp.mp4` (Al-Fatihah: 30 MB → 14 MB). Ambil 4–5 frame dari MP4 final sebagai cek terakhir.
13. **Caption & kirim.** `caption.md` 3 platform (contoh `templates/caption.example.md`), kirim MP4 versi HP + caption (SendUserFile, atau user ambil lewat Claude desktop app / `scp ml-vps:~/motion-krisna/projects/<topik>/*.mp4 .`). Ingatkan user menonton & mendengar sekali (fasih tidaknya bacaan ayat TTS tidak bisa dicek dari frame) dan mencocokkan teks Arab [CEK].

Yang di-commit hanya perubahan workflow (tools, templates, skill, panduan). Folder proyek, MP4, `node_modules/`, `voice/take*`, `shots/`, `build/`, `public/narasi.wav` tidak di-commit.

Jalur lama (`preview.html` + GSAP + `tools/record.mjs`, Chrome headless) masih bisa untuk membuka proyek lama di `projects/`: `node tools/record.mjs --project projects/<topik> --page preview.html` lalu mux dengan audio. Proyek baru pakai Remotion.

## Pelajaran teknis (Remotion di VPS)
- **Python:** `python3` di PATH bisa menunjuk ke venv lain tanpa numpy → `ModuleNotFoundError: numpy`. Selalu `/usr/bin/python3 -I` (numpy dari `python3-numpy`).
- **Font:** Readex Pro tidak punya glyph ﷺ → tampil kotak. Bungkus ﷺ dengan `<span style={{ fontFamily: AMIRI }}>`. VPS tidak punya font emoji → jangan pakai emoji di video (ganti ikon SVG kecil); emoji di caption.md aman.
- **Kata bertanda hubung** ("hamba-Ku", "sungguh-sungguh") bisa patah di tengah. Beri `whiteSpace: "nowrap"` per kata, **tapi spasi antarkata harus di luar span** (kalau di dalam, baris tak bisa patah dan teks keluar kartu).
- **Teks Arab selalu emas** (`C.gold`), kata yang sedang dibaca `#FFE7A3` + glow; transliterasi kecil (muted) di bawahnya.
- **Karaoke caption vs kartu:** sembunyikan `Captions` saat kartu di layar sudah menampilkan kalimat yang sama (hindari dobel teks & tabrakan di y 1300–1400).
- **Judul 3 baris** menabrak objek di y≈800: pakai `size={80}` atau pindahkan objek ke bawah.
- **Loudness:** `mix.py` keluar ≈ −15 LUFS; loudnorm satu-pass memberi ≈ −14,7 LUFS (cukup).
- **Bundle sekali** lalu `still build`/`render build`: jauh lebih cepat daripada `still` dari `src` yang bundle ulang tiap frame.

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
- [ ] Tidak ada glyph kotak (ﷺ di Amiri, tanpa emoji) dan tidak ada kata terpotong di tanda hubung.
- [ ] Ada value/ajakan amal konkret sebelum CTA.
- [ ] Audio ≈ −14 LUFS; versi HP < 30 MB.
