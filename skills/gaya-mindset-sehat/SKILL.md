---
name: gaya-mindset-sehat
description: "Gaya & workflow pribadi Mindset.sehat8 (seri 'Viral? Cek Dulu') untuk video motion graphic kesehatan 9:16: kertas krem bertekstur, judul Fraunces italic dengan stabilo kunyit, karakter produk lucu (mis. Si Chia) sebagai objek utama, timbangan dua sisi MASUK/KELUAR, tracker '3 cara', stempel verdict WORTH IT/SKIP, CTA affiliate keranjang kuning, narasi Gemini TTS suara Leda, SFX sintetis halus, lalu posting/jadwal ke TikTok, Instagram, YouTube, Facebook & Threads lewat API Repliz (affiliate hanya TikTok & Facebook, Threads teks personal). Pakai bersama start-motion saat user minta video/konten kesehatan, makanan sehat, cara hidup sehat, cek fakta produk viral TikTok (chia seed, EVOO, teh rimpang, collagen, probiotik, dll.) atau affiliate produk sehat untuk Mindset.sehat8, atau menyebut gaya-mindset-sehat."
---

# Gaya Mindset Sehat ("Viral? Cek Dulu")

Cocok untuk: bedah produk/tren sehat yang viral di TikTok, tips makan & hidup sehat, video affiliate produk sehat. Penonton: perempuan 22–35 urban, TIDAK SABARAN → langsung ke inti. Tidak cocok untuk: berita duka/medis serius, konten anak.
Gaya ini mengalahkan preset bawaan start-motion. Aturan kerajinan umum start-motion tetap berlaku.
Contoh acuan: `C:\Users\Administrator\Documents\Claude Code\mindset-sehat\chia\` (chia_9x16_v1.mp4, 73,7 dtk). Template kode: `assets/template/` (preview.html + skrip) → salin ke `mindset-sehat\<topik>\`, ganti CUES, teks, ilustrasi; gerak & sistem layar dipertahankan.

## Palet (hanya ini + tint-nya)
| Peran | Hex | Dipakai untuk |
| --- | --- | --- |
| Latar | #F5F1E6 | kertas krem, isi lubang/kontras |
| Utama | #1E4D3A | judul, garis, pill gelap, timbangan, centang |
| Aksen | #E9A23B | stabilo di belakang kata kunci, progress bar, stempel, chip, keranjang. JANGAN jadi warna teks di krem |
| Peringatan | #E25C3B | "≠", kata negatif (TETAP), coretan, label MASUK, pill "tanya dokter", panah keranjang |
| Kartu | #FFFFFF | kartu, kalender, piring, gelas |
Ilustrasi boleh turunan: hijau #2d6b51/#3f7a5c, kunyit muda #f6c977, cokelat kayu #c98a2a, biji chia #33312c/#24221e.

## Tipografi (Google Fonts)
- Judul: Fraunces Italic 800, 130–170 px, line-height 1.04, tengah, top 350–380, maks 2 baris; auto-fit lebar ≤920 px (kecilkan 4 px per langkah).
- Penanda di `data-t`: `*kata` merah, `_kata` stabilo kunyit (bar .38em di bawah, scaleX dari kiri).
- Isi/label: Plus Jakarta Sans 800 — chip 40 px, pill 30–44 px, tracker 25 px, sumber 600 24 px.
- Handle end card: Plus Jakarta Sans 800 92 px; tagline "Viral? Cek dulu." Fraunces 64 px dengan stabilo.

## Sistem layar (1080x1920)
- Header y=250–306: kiri "VIRAL? CEK DULU · NO. XX", kanan label bab berganti (CHIA SEED / FAKTA / KENAPA? / KUNCINYA / CARA 1/3 … / ATURAN AMAN / VERDICT / REKOMENDASI / FOLLOW), 24 px 800 spasi .2em, garis bawah 2 px hijau 22%.
- Progress bar 6 px kunyit y=314, x 80–1000, terisi sepanjang video.
- Judul y 350–640 · ilustrasi y 700–1300 · tracker 3 cara y=1370 (3 pill 290×68, centang kunyit saat selesai, pill aktif berbingkai kunyit) · pill sumber y=1452 (tengah, hijau 8%) · y>1500 kosong.
- Objek utama di tengah (540, ~1100) skala 1,25–1,35 saat jadi fokus; mengecil 0,4–0,5 ke pinggir saat ilustrasi lain bicara.

## Latar & tekstur
Noise feTurbulence opacity .06 · 3 lingkaran besar (kunyit 13%/8%, hijau 7%) melayang pelan · daun hijau 10–16% di tepi bergoyang · 22 biji kecil seeded mengambang. Tidak pernah polos.

## Objek utama: karakter produk
Produk yang dibahas jadi karakter (contoh Si Chia: oval abu gelap gradasi radial, bintik seeded, highlight putih 16%, mata putih besar + pupil + kilau, pipi merah 45%, mulut krem; lengan & kaki kecil). Ekspresi: senyum / O kaget / datar; pupil melirik ke objek yang dibahas; napas ±2,5%; kedip seeded tiap 2,6–4,2 dtk.
Alur status: masuk bermahkota "VIRAL" → kena tanda larangan merah saat mitos dipatahkan, mahkota lepas → kecil di pinggir saat penjelasan → besar lagi di "jembatan" (angkat tangan + badge "3") → ikut aksi (mis. terjun ke gelas jadi gel) → berdiri di atas timbangan saat verdict → menunjuk produk di CTA → melambai di end card.

## Ilustrasi khas
Flat + gradasi lembut + highlight putih + bayangan elips hijau 15%. Komponen siap pakai di template: timbangan dua sisi (piring MASUK merah/KELUAR hijau, miring sesuai beban dengan `elastic.out`), kalender count-up, timbangan badan jarum goyang, donat dicoret, gelas puding berlapis, jam puasa 16:8, piring porsi mengecil, Isi Piringku tampak atas, gelas air, sendok, botol, kartu produk putih dengan foto asli, chip, pill keranjang kuning + panah.
Metafora wajib per video: timbangan MASUK vs KELUAR (atau setara) yang muncul di penjelasan lalu kembali seimbang di verdict.
Video ≤20 dtk (hook → 1 fakta → 1 aturan → verdict → end card 1,2 dtk): satu set panggung tetap (mis. wajan + termometer di EVOO), tanpa tracker; metafora setara cukup (termometer zona aman/bahaya). Acuan: `mindset-sehat\evoo\` (16,9 dtk).

## Gerak khas
- Judul per kata mask reveal naik `back.out(1.7)` 0,55 dtk, stagger 0,07, rotasi 5°→0; stabilo menyusul +0,3 dtk.
- Hook frame 0 SUDAH berteks (judul punch scale 1,16→1).
- Elemen masuk `back.out(1.8)` 0,5 dtk dari scale 0/geser; keluar `power2.in` 0,3 dtk; benda jatuh `bounce.out`; mendarat squash `elastic.out(1,.45)`.
- Kamera 1,00→1,035 per adegan. Shake 0,32 dtk saat larangan, "≈", stempel.
- Transisi: geser kiri (hook→fakta), zoom keluar (→penjelasan), naik (→jembatan), wipe diagonal hijau+kunyit −12° 0,75 dtk antar "cara", geser atas (→aturan, →CTA), potong langsung ke verdict.
- Klimaks: stempel "WORTH IT"/"SKIP" kunyit berbingkai hijau 12 px, rotasi −8°, slam `power4.in` dari scale 2,6 + shake + karakter lompat.
- Tempo 2,5–12 dtk per adegan; visual berubah tiap 3–5 dtk.

## Suara & SFX
- Narasi STANDAR (pilihan user 2026-11-05): **Gemini TTS suara `Leda`** lewat `assets/template/tts_gemini.py` (`python -I tts_gemini.py`, butuh `gcloud` login + `vertex.py` di `Documents\Claude Code Ku\gorengan\tools`). Style: "Perempuan Indonesia umur 25-an, ngobrol santai dan ceria seperti teman yang lagi bongkar fakta kesehatan di TikTok. Tempo cepat dan bertenaga, jeda singkat, natural, tidak seperti pembaca berita." Satu klip per adegan → `audio/sNN.wav`; `python -I tts_gemini.py 3 8` untuk ulang adegan tertentu. Gemini membaca nama merek Inggris dengan benar (tulis "Vitalife Magnesium Bisglycinate" apa adanya); singkatan tetap dieja ("be-pe-o-em"), "HP" → "hape". Leda ±15% lebih cepat dari edge-tts: 137 kata ≈ 60 dtk.
- JANGAN pakai edge-tts (`tts.py`, suara Gadis) lagi: user menilai "jelek sekali", robotik. Hanya cadangan darurat bila gcloud tidak tersedia, dan katakan ke user.
- Setelah TTS: trim hening per klip → `t01.wav…`, lalu `build_cues.py` (jeda 0,35 dtk, lead 0,1 dtk → narasi.wav/mp3 + cues.json; kata kunci dari faster-whisper base). Whisper base sering salah dengar → isi KW dengan alias `|` (mis. "lansia|landsia", "worth|urtir", "keranjang|keren"); END = durasi end card. Tempel cues ke `const CUES` di preview.html.
- SFX sintetis (`mix.py`, 17 dB di bawah narasi): pop, whoosh, tick, thud, ding, stamp, plung, sparkle. Tanpa musik. Loudnorm −14 LUFS, TP −1,5.

## Struktur naskah yang disukai user
Hook ≤9 kata yang mematahkan mitos + janji ("X nggak bikin kurus. Kecuali kamu lakukan ini.") → fakta/penelitian 1 kalimat → KENAPA dengan logika sederhana (mis. total kalori sehari masuk > keluar) → jembatan ("X bantu …, jadi … lebih gampang. Ini tiga caranya.") → 3 cara praktis (lokal, murah) → aturan aman + "tanya dokter" bila relevan → verdict 4 kata → CTA affiliate (nama produk, 3 fakta dari kemasan, "Cek di keranjang kuning ya"). Durasi ≤80 dtk, ±145 kata.

## Workflow (terbukti 2026-11-04)
1. Riset web: angka wajib bersumber; tampilkan sumber di pill y=1452.
2. Foto produk affiliate dari `Documents\Claude Code\Foto Affiliate\` → salin jadi `produk.png`; klaim hanya yang tertulis di kemasan.
3. `python -I tts_gemini.py` (Leda) → trim → `python build_cues.py` (edit LINES & KW dulu).
4. preview.html: tempel CUES, ubah adegan; cek `python shots.py t1 t2 …` → `qa/sheet.jpg`, lihat sekali, perbaiki tabrakan.
5. `python render.py 6` (background) → `python mix.py` → loudnorm → encode `<topik>_9x16_v1.mp4` (crf 18, aac 192k, faststart).
6. QA: ffprobe + 6 frame MP4 jadi satu sheet.
7. Versi tanpa CTA untuk IG & YouTube (lihat Posting langkah 1).
8. Tulis caption semua platform + Threads (aturan & template di bawah) → simpan `caption.md` dan `plan.json` di folder proyek, `at` diisi `"TANYA_USER"` dulu.
9. **TANYA user kapan posting** (tanggal, jam video, jam Threads) — boleh usul, tapi JANGAN isi waktu sendiri.
10. Tampilkan draf (tabel akun × waktu × caption) → tunggu "ya" → posting via Repliz → `list` untuk verifikasi.
Jebakan: jangan `autoAlpha:0` pada `.title` (reveal hanya menggerakkan `.i`, judul jadi tak pernah tampil); sembunyikan lewat `yPercent` kata saja. Elemen yang dipusatkan pakai `gsap.set({xPercent:-50})`, bukan CSS translate (GSAP menimpanya). Hindari `svgOrigin` + scale pada grup SVG berviewBox negatif; pakai opacity/geser atau `transformOrigin`.

## Caption (maks 5 hashtag, termasuk #Shorts di YouTube)
Baris 1 = hook. Nilai singkat + "Simpan…". Selalu: "Info umum, bukan pengganti saran dokter."
- **Affiliate hanya TikTok & Facebook.** TikTok: "Produk di keranjang kuning adalah link affiliate." Facebook: "Link produk ada di bio (link affiliate)."
- **Instagram & YouTube tanpa produk:** video versi tanpa adegan CTA + caption tanpa baris affiliate. YouTube: judul ≤100 karakter tanpa hashtag, deskripsi + baris Sumber, `tags`.
- Hashtag dasar: `#<produk> #<manfaat> #viralcekdulu #hidupsehat #mindsetsehat` (YouTube: `#Shorts` menggantikan `#viralcekdulu`).
- Template (contoh magnesium, `mindset-sehat\magnesium\caption.md`):
  - TikTok: `<Hook>… kecuali kamu lakuin 3 hal ini 👇` / `Simpan buat <kapan>!` / baris affiliate TikTok + dokter / hashtag.
  - IG (FB sama + baris affiliate FB): hook `👇` → daftar 1–3 cara (≤10 kata/butir) → 1 kalimat aturan aman → `📌 Simpan buat pengingat.` → dokter → hashtag.
  - YouTube: judul = hook tanpa emoji; deskripsi 1–2 kalimat nilai → `Sumber: …` → dokter → hashtag; `tags` 4 frasa pencarian.

## Threads (teks berantai, tanpa video, tanpa CTA produk)
Suara manusia pribadi, santai kekinian, huruf kecil boleh. Hook (post utama) ≤12 kata, pakai "aku" (bukan "kita harus"), diakhiri titik dua atau bikin penasaran, JANGAN langsung isi. Isi baru di reply 1. Pola hook yang work: before-after jujur ("Dulu aku kira X. Ternyata:"), baru sadar tubuh, hari ini belajar, pertanyaan menohok/myth busting, tubuh berbicara, butuh didengar, parabel. Reply 2 = "jadi sekarang aku nyoba begini:" + 3 butir; reply 3 = catatan aman + pertanyaan ke pembaca. Tanpa klaim hasil pribadi ("turun X kilo"). `topic` 1 kata/frasa, tanpa hashtag.

## Posting via Repliz (terbukti 2026-11-05)
Kredensial dari user, pakai env `REPLIZ_AUTH="key:secret"`; JANGAN tulis ke file. Script: `assets/template/repliz.py` (+ `plan.example.json`, ID akun Mindset Sehat sudah terisi).
1. Versi tanpa CTA untuk IG & YouTube: potong sebelum transisi ke adegan CTA (mulai adegan CTA di CUES − 0,33 dtk), tahan frame akhir 1,2 dtk:
   `ffmpeg -t <potong> -i <topik>_9x16_v1.mp4 -vf "tpad=stop_mode=clone:stop_duration=1.2" -af "afade=t=out:st=<potong-0.25>:d=0.25,apad=whole_dur=<potong+1.2>" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart <topik>_9x16_v1-tanpa-cta.mp4` (`-t` SEBELUM `-i`). Cek frame akhir: tak ada sisa produk.
2. Tulis `plan.json` (salin contoh): satu entri per akun; `video` = file lokal (diunggah sekali, dipakai ulang), `info` = opsi platform: TikTok `isDraft: true` (keranjang kuning tak bisa lewat API → user tambah produk di app lalu publish) + `isAiGenerated: true`; IG `isShareToFeed: true`; YouTube `isAiGenerated`, `privacy`, `tags`; FB `isAiGenerated`. Waktu (`at`, ISO +07:00): TIDAK ada default — selalu tanya user dulu (tanggal, jam video, jam Threads); usulan boleh (mis. video 10.00 atau 19.00 WIB, Threads 12.00), sebut juga bila hari itu sudah ada jadwal lain (`repliz.py list`).
3. Tampilkan draf ke user (tabel akun × waktu × caption) dan TUNGGU "ya" sebelum posting. Persetujuan waktu ≠ persetujuan caption; butuh keduanya.
4. `python repliz.py post plan.json` → `python repliz.py list 6` (status `pending`). Ubah jadwal yang sudah ada: tambahkan `"scheduleId"` di entri → PUT (body lengkap diganti, status tetap). `python repliz.py accounts` untuk ID akun lain.

## Dilarang di gaya ini
- Bukti lemah/membosankan sebagai solusi (mis. "6 bulan turun 2 kilo"); utamakan logika yang gampang dipahami.
- Klaim "best seller", "menyembuhkan", angka atau testimoni tanpa bukti; klaim produk di luar kemasan.
- Pembuka lambat, intro brand, kalimat panjang; teks layar >4 kata per baris.
- Merah sebagai warna dominan; kunyit sebagai warna teks; foto stok; emoji sebagai ilustrasi.

## Cek khas gaya (sebelum preview & render)
- [ ] Palet hanya dari tabel; Fraunces & Plus Jakarta Sans tampil (bukan font cadangan).
- [ ] Frame 0 berteks hook; header + progress bar ada di semua adegan.
- [ ] Karakter produk tampil & berubah ekspresi/posisi di tiap bab.
- [ ] Ada metafora timbangan + stempel verdict + tracker 3 cara.
- [ ] Pill "LINK AFFILIATE" terlihat selama CTA; tidak ada yang melewati y=1500.
- [ ] Frame kunci: `assets/contact-sheet.jpg`.
