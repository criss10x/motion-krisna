# Gunung Punya Akar: versi anak (Naskah v2 ringkas, remake #15 gunung-pasak, menunggu persetujuan)

Muslim Leveling · 9:16 · ≤120 dtk (tempo 1.10) · **Narasi untuk anak kecil**: kalimat pendek, kata sehari-hari, nada mendongeng
Varian: **tema #15 gunung-pasak, desain baru** yang dioptimasi untuk kamera virtual · **Tanpa musik** (narasi + SFX padat) · −14 LUFS · Suara: Sadachbia, hangat seperti kakak/ayah yang bercerita · Tanpa TTS Arab
Motif: **penampang bumi** (bagian atas gunung terlihat, lalu tanah "dibuka" dan akar terlihat) ↔ **pasak tenda** (bagian atas kecil, bagian tertanam panjang). Keduanya disejajarkan di akhir.
Label: "MUKJIZAT AL-QUR'AN · UNTUK ANAK".

Teks hook di layar (frame 0): **"Di umur berapa kalian tahu kalau GUNUNG itu punya AKAR?"**

## Narasi (v2 ringkas, target ±55–65 dtk)
1. **Hook:** Di umur berapa kalian tahu kalau gunung itu punya akar?
2. **Sains:** Yang kita lihat cuma puncaknya. Padahal di bawah tanah, akar gunung menghujam puluhan kilometer! Ilmuwan baru menduganya tahun 1855, lalu membuktikannya dengan getaran gempa.
3. **Ayat:** Tapi lebih dari 1400 tahun lalu, dalam surat An-Naba ayat 6 dan 7, Allah berfirman: "Bukankah Kami telah menjadikan bumi sebagai hamparan, dan gunung-gunung sebagai pasak?"
4. **Pasak:** Pasak itu tongkat untuk mengikat tenda. Yang kelihatan cuma ujungnya, bagian terbesarnya tertanam di dalam tanah. Persis seperti gunung, kan?
5. **Siapa:** Nabi Muhammad ﷺ tidak bisa melihat ke dalam bumi. Yang memberi tahu adalah Allah, yang menciptakan gunung itu.
6. **Pesan:** Pelajarannya: gunung kuat karena akarnya tertanam dalam. Kita juga begitu. Kekuatan kita ada di dalam hati, yaitu iman. Tanam akarnya setiap hari: shalat, doa, dan kebaikan kecil walau tidak ada yang melihat.
7. **CTA:** Tulis "Subhanallah" di kolom komentar. Simpan, dan bagikan.

±140 kata → ±65 dtk narasi + end card ≈ 70 dtk.

## Storyboard v3: DESAIN BARU (tema #15) yang dibangun untuk kamera virtual
Tema tetap dari #15:
- Malam ungu → senja, garis tanah emas, kerak coklat, mantel merah, akar biru bercahaya.
- Huruf Readex putih–emas.

Semua tata letak dibuat ulang supaya cocok dengan kamera yang bergerak.

### A. Sistem desain
**1. Tiga lapisan**

| Lapisan | Ikut kamera? | Isi |
|---|---|---|
| **DUNIA** | ya, penuh | Kanvas tinggi 1080×3600: langit dan bintang (y 0–1100), pegunungan dan garis tanah (y ≈1300), kerak (sampai y ≈2300), mantel dan akar (sampai y ≈3400). |
| **LABEL-DUNIA** | posisi ikut, **ukuran tidak** | Label yang menempel pada benda ("PUNCAK", "AKAR", "±9 km", "PASAK"). Skalanya dikoreksi 1/zoom supaya ukuran huruf di layar selalu tetap (34–44 px). Label hanya muncul kalau bendanya ada di bingkai, dan memakai garis penunjuk tipis emas. |
| **HUD (layar)** | tidak | Judul atas, caption bawah, pill sumber, progress bar, watermark, dan dua alat bantu baru (lihat poin 3). |

**2. Zona layar 1080×1920**
- **y 250–440: Judul HUD.** Satu frasa kinetik, 2–4 kata. Kata kuncinya emas dan "pop" saat diucapkan.
- **y 480–1180: jendela kamera.** Subjek shot selalu dibingkai di sini, dengan titik fokus di sekitar y 830.
- **y 1200–1290:** pill sumber.
- **y 1300–1420:** caption kata per kata, dengan pita gelap semi-transparan supaya tetap terbaca di atas latar apa pun.
- **x ≥ 940** dikosongkan.
- 480 px bawah hanya berisi latar dunia, tanpa teks.

**3. Alat bantu kamera (HUD baru)**
- **Penggaris kedalaman / ketinggian** di sisi kiri (x 40–110). Garis vertikal tipis dengan angka yang berputar mengikuti posisi kamera, misalnya "+8.849 m" saat di puncak, lalu "0 km", "−10 km", sampai "−40 km" saat kamera turun ke akar. Penonton langsung paham sedang berada di atas atau di bawah tanah.
- **Mini-map** kecil di kiri atas di bawah watermark (100×150 px): siluet penampang dengan kotak emas yang menunjukkan posisi kamera. Ini menjaga orientasi saat shot berpindah cepat.

**4. Kedalaman visual (parallax)**
- Bintang bergerak 0,2×, gunung jauh 0,5×, gunung utama 1×.
- Debu/partikel latar depan 1,4×, dibuat blur sehingga lewat di depan lensa saat kamera bergerak.
- Fokus dangkal: saat close-up, latar di-blur 3–6 px. Vignette makin kuat saat zoom.

**5. Bahasa gerak kamera**
- **Push / pull:** zoom halus 0,6–1,2 dtk (easing in-out).
- **Whip vertikal:** 0,3 dtk dengan motion blur arah gerak dan suara whoosh, untuk perpindahan atas ↔ bawah tanah.
- **Match-cut:** bentuk pasak berubah menjadi bentuk akar gunung (siluet yang sama, posisi sama di layar).
- **Napas kamera:** saat diam, kamera tetap bergerak sangat pelan (zoom 1,00 → 1,03) supaya tidak terasa beku.
- Getaran kecil (shake 2–4 px) hanya saat "getaran gempa" dan saat impact.
- Shot berganti setiap 2–4 dtk dan selalu dipicu oleh kata yang diucapkan.

**6. Aturan teks dengan kamera**
- Teks panjang (ayat, terjemah) **tidak pernah** diletakkan di lapisan DUNIA. Selalu di HUD dengan panel kaca gelap (blur latar + border emas 1 px), supaya tetap tajam saat kamera bergerak.
- Teks HUD masuk **setelah** gerak kamera selesai (selisih 0,15 dtk), tidak bersamaan, supaya mata tidak terbelah.
- Maksimal 1 judul + 1 label-dunia + caption dalam satu waktu.

### B. Shot list

| # | Narasi (pemicu) | Kamera | Judul HUD | Visual & label-dunia | SFX |
|---|---|---|---|---|---|
| 1 | Hook "Di umur berapa…" | **WIDE** (zoom 0,55): seluruh gunung dan garis tanah; kamera *push-in* pelan. | Teks hook penuh sejak frame 0: "Di umur berapa kalian tahu kalau **GUNUNG** itu punya **AKAR**?" | Tanah di bawah garis gelap pekat, dengan "?" biru berdenyut dari dalam. | whoosh, riser → impact |
| 2a | "cuma **puncaknya**" | **PUSH-IN ke puncak** (zoom 2,2). Penggaris: +8.849 m. | YANG KITA **LIHAT** | Salju puncak berkilau, angin salju. Label-dunia "PUNCAK". | whoosh naik, clink |
| 2b | "di **bawah tanah**" | **WHIP DOWN** menembus garis tanah. Penggaris berputar ke −10 km. | YANG **TERSEMBUNYI** | Tanah terbuka seperti tirai (efek gores cahaya emas). | whoosh turun, drop |
| 2c | "**menghujam** puluhan kilometer" | **TRACK DOWN** mengikuti akar yang tumbuh sampai ujung (zoom 1,6). Penggaris berhenti di −40 km. | AKAR **GUNUNG** | Akar biru tumbuh ke bawah; label-dunia "AKAR"; braket "PULUHAN KM". | riser, klik per 10 km, impact |
| 2d | "Ilmuwan… **1855**" | **PULL-OUT** ke wide penampang (zoom 0,7), latar di-blur. | **1855** (angka berputar naik) | Kartu HUD kaca: ikon teleskop, "George Airy · ilmuwan Inggris · menduga". | klik ×4, pop |
| 2e | "**getaran gempa**" | WIDE + shake halus. | **TERBUKTI** ✓ | Gelombang gempa melingkar dari permukaan, memantul di dasar akar, lalu garis akar menyala terang. | thread getar, snap, powerup |
| 3 | "**1400** tahun lalu… Allah berfirman…" | **CRANE UP** panjang dari akar ke langit berbintang (zoom 0,9); kamera berhenti di langit. Penggaris memudar. | **1400+** TAHUN LALU | Panel kaca HUD: ayat An-Naba 6–7 (Arab) dengan sapuan emas, terjemah muncul per frasa mengikuti narasi, kata **pasak** berkilau. Pill "QS. An-Naba': 6–7". | whoosh mundur, riser, clink ×2 |
| 4a | "mengikat **tenda**" | **CUT** (whip ke samping) ke perkemahan di lereng, wide. | APA ITU **PASAK**? | Tenda berkibar, tali tegang. | whoosh angin, pop |
| 4b | "cuma **ujungnya**" | **CLOSE-UP** kepala pasak (zoom 2,5). | YANG **KELIHATAN** | Palu (ikon, tanpa tangan) memukul 3×, debu memercik. Label-dunia "UJUNG". | thunk ×3 |
| 4c | "**tertanam** di dalam tanah" | **TILT DOWN** mengikuti batang pasak (zoom 1,8). | YANG **TERTANAM** | Tanah tembus pandang; batang pasak menyala biru seperti akar. | slide, clink |
| 4d | "Persis seperti **gunung**, kan?" | **MATCH-CUT** pasak → akar gunung, lalu PULL-OUT ke wide (zoom 0,6). | **MIRIP**, KAN? | Siluet pasak menimpa akar gunung dan pas ✓. Dua label-dunia: "PASAK" dan "GUNUNG". | impact, clink shimmer |
| 5 | "tidak bisa melihat ke **dalam bumi**" → "**Allah**" | Langit Makkah malam (wide), lalu *push-in* pelan ke cahaya. | SIAPA YANG **MEMBERI TAHU**? → **ALLAH** | Ikon mata dan alat ukur dicoret (Nabi ﷺ tidak digambar). Cahaya turun dari langit. | scrape, powerup |
| 6a | "gunung kuat karena **akarnya**" | **WHIP DOWN** ke akar (zoom 1,8). | KUAT KARENA **AKAR** | Akar menyala; label-dunia berubah menjadi **"IMAN"**. | whoosh, powerup |
| 6b | "**shalat**, **doa**, dan **kebaikan**" | Kamera tetap; zoom naik kecil pada setiap kata (1,8 → 1,9 → 2,0). | TANAM **SETIAP HARI** | Tiga cabang akar tumbuh, masing-masing berlabel SHALAT · DOA · KEBAIKAN. | klik ×3 bertingkat |
| 6c | "walau tidak ada yang **melihat**" | **PULL-OUT** ke wide; angin bertiup di permukaan dan gunung tetap kokoh. | **KOKOH** | Partikel angin melintas; puncak tidak bergeser. | whoosh angin, impact lembut |
| 7 | CTA "Tulis **Subhanallah**…" | WIDE dengan napas kamera. | Tulis **"Subhanallah"** | Ikon komentar + "SIMPAN & BAGIKAN", lalu end card. | pop, clink |

### C. Audio
- Tanpa musik. SFX padat (±120–150 untuk ±70 dtk), mengikuti setiap gerak kamera dan setiap label yang muncul.
- **Volume kembali −14 LUFS** (permintaan user 16 Nov).

## Dalil & sumber
- **QS. An-Naba' 6–7**: أَلَمْ نَجْعَلِ ٱلْأَرْضَ مِهَٰدًا ۝ وَٱلْجِبَالَ أَوْتَادًا (Kemenag: "Bukankah Kami telah menjadikan bumi sebagai hamparan dan gunung-gunung sebagai pasak?")
- **Ibnu Katsir 78:7**: «أرساها بها وثبتها وقررها» (dipakai: "menancapkan gunung-gunung dan meneguhkan bumi dengannya").
- **Airy 1855**: hipotesis "akar gunung" (Airy isostasy), Philosophical Transactions vol. 145; Oxford DNB.
- **Konfirmasi dengan gelombang gempa (seismik)**: penebalan kerak di bawah pegunungan diukur dengan seismologi abad ke-20; kerak di bawah Himalaya/Tibet ±70–75 km, dua kali rata-rata (Geological Society).
- **Everest 8.849 m** → "hampir sembilan kilometer".

## Catatan akurasi
- **Tidak ada klaim "gunung mencegah gempa"**, dan "tidak bergoyang" dari Ibnu Katsir tidak dinarasikan.
- "Sekitar 170 tahun lalu" = 1855 → 2026 (171 tahun). "Lebih dari 1400 tahun lalu" = wahyu 610–632 M.
- "Akar menghujam sampai puluhan kilometer" = penebalan kerak di bawah pegunungan (akar Airy), bukan total kerak.
- "Ilmuwan menduga… lalu mengukur dengan getaran gempa" = hipotesis 1855, dikonfirmasi seismologi kemudian.
- Al-Qur'an menyebut **pasak**, bukan "akar"; narasi menjelaskan kemiripannya ("mirip sekali, kan?"), bukan mengklaim ayat itu uraian geologi.
