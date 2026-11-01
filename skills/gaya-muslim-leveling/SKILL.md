---
name: gaya-muslim-leveling
description: "Gaya & workflow pribadi Muslim Leveling untuk video motion graphic islami 9:16: latar hijau-hitam dengan pola geometris islami, kubah logo sebagai objek utama yang berubah (redup → retak → menyala → logo), judul Reem Kufi kapital, kartu hadis Arab Amiri + terjemahan, narasi Gemini TTS, SFX sintetis, caption TikTok/IG/Shorts. Pakai bersama start-motion saat user minta video/konten islami, dakwah, nasihat, atau isu berita dengan sudut islami untuk Muslim Leveling, atau menyebut gaya-muslim-leveling."
---

# Gaya Muslim Leveling

Cocok untuk: konten islami pendek (dakwah, nasihat, isu berita/kebijakan dari sudut islam, pengingat ibadah) untuk penonton muslim Indonesia. Tidak cocok untuk: konten ceria anak, promo diskon, hiburan murni.
Gaya ini mengalahkan preset bawaan start-motion. Aturan kerajinan umum di start-motion tetap berlaku.
Contoh acuan: `C:\Users\Administrator\Documents\Claude Code Ku\pajak-zalim\` (preview.html = template kode, salin lalu ubah adegan).

## Palet
| Peran | Hex | Dipakai untuk |
| --- | --- | --- |
| Latar | #06110E | background, isi stempel |
| Kartu | #0B1F19 | kartu hadis, tag, chip, pill gelap |
| Primary | #34D399 | kubah, progress bar, kata kunci positif, CTA |
| Teks | #FFF9EF | judul & isi |
| Tertiary | #00E1EF | aksen, rujukan hadis, chip, gelombang |
| Peringatan | #FF5A5F | HANYA kata "zalim/pajak/dipotong", retak, stempel (hemat) |
| Muted | #8FB5A8 | label sumber |

## Tipografi (Google Fonts)
- Judul: Reem Kufi 700, 96 px, KAPITAL, line-height 1.08, letter-spacing −1px, tengah, y=450.
- Isi/label: Readex Pro 500/700 — label 44 px, sumber 28 px (muted), terjemahan 40 px.
- Arab: Amiri 700, 70 px, line-height 1.75, direction rtl.
- Angka besar: Reem Kufi 150 px, count-up, warna peringatan bila soal beban rakyat.
- Penanda di judul: `*kata*` merah, `_kata_` hijau.

## Sistem layar (1080x1920)
- Progress bar 6 px #34D399 di y=236, x 80–1000.
- Watermark: logo 52 px + "Muslim Leveling" Reem Kufi 30 px, kiri atas (80, 262), muncul dtk 2, hilang di end card. Hook 0–2 dtk TANPA logo.
- Judul y=450 · label sumber y=600 · objek utama pusat (540,1080) · kerumunan/chip y 1250–1440 · bawah 1500 kosong.
- Kartu hadis 920 px lebar di (540,1030): Arab → terjemahan → "HR. Muslim no. …" (tertiary) → logo kecil + "Muslim Leveling".
- End card 2,5–3,5 dtk: kubah mengecil-pudar, logo 460 px di (540,900) tumbuh di titik sama, nama 92 px y=1220, pill "Download sekarang" tertiary y=1360.

## Latar & tekstur
3 lapis parallax: lingkaran radial lembut #123A2E, pola geometris islami (2 persegi bertumpuk 45° + lingkaran, stroke 2 px #34D399 opacity .09, tile 140 px) bergeser pelan, 26 partikel seeded naik pelan.

## Environment flat RAMAI (wajib, permintaan user 2026-11-01)
Latar polos terasa sepi. Setiap video wajib punya lingkungan ilustrasi flat yang sesuai topik, berlapis dan bergerak pelan (parallax beda kecepatan). Acuan: `langit-dibakar/preview.html`.
- Lapisan: langit gradasi (bisa berubah warna sesuai emosi: gelap → biru tosca saat harapan) · matahari/bulan · gunung jauh #0E241D · hutan jauh (pohon segitiga #123A2E, 20 buah) · objek utama kubah · hutan/kota dekat #174A3A · tanah #0A1C17 · bangunan (rumah, sekolah + bendera, klinik +, masjid, gedung) · kerumunan · efek (asap, bara, hujan, burung) di paling depan.
- Turunan warna palet boleh untuk ilustrasi: hijau gelap #0E241D/#123A2E/#163B31/#174A3A/#1F5A48, api gradasi #FF5A5F→#FFB38A.
- Elemen lingkungan ikut cerita: api membesar di klimaks lalu padam, asap tersibak saat dalil, langit cerah + burung di CTA.
- Semua deterministik (rnd seeded), dibuat lewat helper `add()` + `<symbol>` (tree, house, cloud, flame, bird, person bermasker).
- Teks di atas latar ramai: label sumber diberi pill gelap semi-transparan; judul diberi text-shadow 0 6px 0 #06110E.

## Objek utama: kubah logo
Path kubah bawang (lebar 560, tinggi 850), stroke 56 px gradasi #A7F3D0 → #34D399 → #00E1EF + garis dalam 10 px. Tanpa bulan sabit di kubah (bertabrakan dengan judul); bulan hanya di logo.
Status mengikuti cerita: redup (opacity .25) → retak (path merah 9 px digambar, shake) → pulih (retak ditarik balik) → menyala penuh (+halo 130 px opacity .12) → berubah jadi logo di end card. Napas ±2% sepanjang video.

## Ilustrasi
Vektor flat + gradasi: HP, grafik batang, ikon bank/e-wallet/keranjang dalam lingkaran kartu, kerumunan orang (ikon kepala+badan, 12x4, deterministik), timbangan keadilan, slip "PUNGUTAN" dicoret. Larangan: foto, emoji sebagai ilustrasi, logo instansi digambar ulang, wajah tokoh.

## Gerak khas
- Judul per kata mask reveal naik, `back.out(2)`, 0,45 dtk, stagger 0,08.
- Elemen masuk `back.out(1.8)` 0,5 dtk; keluar `power2.in` 0,3 dtk.
- Stempel ("BELUM RESMI"): slam `power4.in` dari scale 2,4 + shake 0,33 dtk.
- Teks Arab muncul per kata, stagger ±0,42 dtk mengikuti bacaan narasi.
- Klimaks = doa/dalil terkuat: kalimat kunci jadi merah + kartu pulse + shake 1,3.
- Kamera zoom 1,00 → 1,05 + rotasi ±0,8° per adegan.
- Tempo 3,5–9 dtk per adegan; adegan dalil lebih lambat.

## Suara
- Narasi: Gemini TTS `gemini-3.8-flash-tts` (Vertex, global), voice Sadachbia, style "suara dalam & tegas seperti pengkhotbah muda; melambat & khidmat saat hadis". Buat 2 take, pilih yang durasinya pas (≤ durasi − end card) dan transkripnya cocok.
- SFX halus sintetis, tanpa musik (default): clink (notif/chip), impact (angka/stempel/klimaks), whoosh (transisi), glasscrack (kubah retak), room (dasar adegan dalil), riser→impact (klimaks & CTA), scrape (coretan), powerup (kubah menyala). Mix −14 LUFS.

## Workflow (yang terbukti, 2026-11-01)
1. Topik: riset web berita terkini; tawarkan 4–5 sudut islami; ikuti sikap user (mis. berpihak ke rakyat) tapi kritik KEBIJAKAN, bukan pribadi; tanpa ajakan rusuh.
2. Fakta: angka harus bersumber (aturan/PMK, tanggal, lembaga). Pernyataan pejabat ≠ aturan resmi → sebut "belum resmi". Kutipan tokoh dicek tahun aslinya.
3. Dalil: hanya ayat & hadis shahih; cek derajat di web (mis. Abu Dawud 2937 "shahibul maks" = dha'if Albani → dibuang). Teks Arab yang tidak terverifikasi web → tandai [CEK] dan minta user cek ke ustadz/kitab.
4. Folder proyek `Documents\Claude Code Ku\<topik>\`: `voice/script.txt` (versi TTS: angka huruf, "onlen", "i-wolet", jeda "…"), `voice/gen.py` (salin dari pajak-zalim; impor `gorengan/tools/vertex.py`; PATH tambah `C:/Program Files (x86)/Google/Cloud SDK/google-cloud-sdk/bin`, `PYTHONIOENCODING=utf-8`).
5. CUES dari timestamp kata (`vertex.transcribe`) + silencedetect; batas adegan = tengah jeda sebelum kalimat baru.
6. Logo transparan: `ffmpeg -i logo.png -vf "colorkey=0x000000:0.10:0.18,format=rgba" logo.png`.
7. preview.html: salin dari pajak-zalim, ganti CUES & adegan; sertakan adaptor `window.__film` + `dataset.ready`. Server: `.claude/launch.json` "preview" (python http.server 8765).
8. QA frame: `node ..\gorengan\tools\record.mjs --project . --page preview.html --stills t1,t2,… --dir shots` → gabung hstack jadi satu contact sheet, lihat sekali, perbaiki tabrakan.
9. Audio: `film/timeline.json` (narration, beats [{at:0}], sfx) → `python -I ..\gorengan\tools\mix.py --project .` → pakai `film/audio-nomusic.wav`.
10. Video: `node ..\gorengan\tools\record.mjs --project . --page preview.html` (background) → mux: `ffmpeg -i film/video.mp4 -i film/audio-nomusic.wav -map 0:v -map 1:a -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart <topik>_9x16_v1.mp4`.
11. Caption 3 platform di `caption.md` (lihat bawah), kirim MP4 + caption.
12. Versi HP (batas kirim ke HP 30 MB): `ffmpeg -i <topik>_9x16_v1.mp4 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart <topik>_9x16_v1-hp.mp4` (±15 MB/70 dtk), kirim yang ini.

## Caption (tiga versi)
- TikTok: 2–3 baris pendek, hook = baris pertama, ajakan komentar satu kata ("Tulis ADIL"), 6–8 hashtag, akhiri #muslimleveling #fyp.
- Instagram Reels: paragraf pendek, kutip dalil + nomor HR, "📌 Simpan & bagikan", "📲 Muslim Leveling — link di bio", baris Sumber, ≤10 hashtag.
- YouTube Shorts: judul ≤100 karakter + #Shorts, deskripsi 3 paragraf (fakta + sumber, dalil, sikap), ajakan like/subscribe, 5–6 hashtag.

## Dilarang di gaya ini
- Hadis dha'if/palsu atau dalil tanpa nomor rujukan.
- Menghina pribadi/fisik tokoh, logo instansi, ajakan anarkis.
- Angka tanpa sumber; pernyataan pejabat disajikan sebagai aturan resmi.

## Cek khas gaya (sebelum preview & render)
- [ ] Palet hanya dari tabel; merah hanya untuk beban/kezaliman.
- [ ] Reem Kufi / Readex Pro / Amiri tampil (bukan font cadangan).
- [ ] Kubah muncul & berubah status di tiap bab; berakhir jadi logo.
- [ ] Watermark mulai dtk 2; tidak bertabrakan dengan judul (judul y≥450).
- [ ] Setiap kartu dalil ada nomor HR + label Muslim Leveling.
- [ ] Frame kunci: `assets/contact-sheet.jpg` (gaya dasar) + `assets/contact-sheet-environment.jpg` (latar ramai).
