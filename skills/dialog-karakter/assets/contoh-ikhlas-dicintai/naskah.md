# Al-Ikhlas: Sahabat yang Dicintai Allah. Naskah v1

Seri: Surah Pendek yang Kamu Baca Tiap Shalat · 3 · Muslim Leveling · 9:16 · kamera virtual + DIALOG KARAKTER
Target: ±165 kata → ±75 dtk (tempo 1.08) + end card. Tanpa musik, −14 LUFS.

## Suara
| Peran | Suara TTS (usulan, sampel dikirim dulu) | Visual |
|---|---|---|
| NARATOR | Sadachbia (biasa) | — |
| PRAJURIT (anggota pasukan) | Puck (muda, penasaran) | siluet tanpa wajah + balon dialog + label "PRAJURIT" |
| SANG IMAM (komandan pasukan) | Algenib (hangat, berat) | siluet tanpa wajah + balon dialog + label "SANG IMAM" |
| Rasulullah ﷺ | **TIDAK disuarakan karakter dan tidak digambar.** Sabdanya dibacakan NARATOR ("Beliau bersabda: …"), visual = cahaya + kartu hadis | cahaya |

Dialog karakter dibacakan dalam bahasa Indonesia (tanpa TTS Arab); teks Arab hadis hanya tampil di kartu.

## Naskah
| # | Blok | Siapa | Kalimat |
|---|---|---|---|
| 1 | Hook | NARATOR | Kamu spam Al-Ikhlas tiap hari? Ada sahabat yang juga begitu, dan Rasulullah ﷺ bilang: Allah mencintainya. Dengerin alasannya. |
| 2 | Kisah | NARATOR | Rasulullah ﷺ mengutus seorang sahabat memimpin pasukan. Setiap menjadi imam shalat, ia selalu menutup bacaannya dengan surat Al-Ikhlas. |
| 3 | Lapor | NARATOR | Sepulangnya, pasukan itu melapor. |
|   |   | PRAJURIT | "Ya Rasulullah, imam kami selalu menutup bacaannya dengan Al-Ikhlas." |
|   |   | NARATOR | Beliau bersabda: "Tanyakan kepadanya, kenapa ia melakukan itu?" |
| 4 | Dialog | PRAJURIT | "Kenapa kamu selalu menutup dengan Al-Ikhlas?" |
|   |   | SANG IMAM | "Karena surat ini menyebut sifat Ar-Rahman. Dan aku suka membacanya." |
| 5 | Puncak | NARATOR | Mendengar itu, Rasulullah ﷺ bersabda: "Beritahukan kepadanya, Allah mencintainya." |
| 6 | Isi surat | NARATOR | Sifat apa yang ia cintai? Empat ayat: Allah Maha Esa. Tempat meminta segala sesuatu. Tidak beranak dan tidak diperanakkan. Dan tidak ada yang setara dengan-Nya. |
| 7 | Pelajaran | NARATOR | Sahabat itu dicintai Allah karena mencintai surat yang menyebut sifat-Nya. Maka bacalah Al-Ikhlas bukan sekadar hafalan, tapi dengan cinta kepada Allah yang kamu sebut di dalamnya. |
| 8 | CTA | NARATOR | Tulis "Aku cinta Al-Ikhlas" di kolom komentar. Simpan, dan bagikan. |

## Sumber (sudah dicek)
- HR. Bukhari 7375 (Kitab At-Tauhid) & Muslim 813, dari Aisyah: «بعث رجلا على سرية، وكان يقرأ لأصحابه في صلاتهم فيختم بـ قل هو الله أحد… سلوه لأي شيء يصنع ذلك… لأنها صفة الرحمن وأنا أحب أن أقرأ بها… أخبروه أن الله يحبه» (dikutip Ibnu Katsir 112:1).
- Terjemah ayat: Kemenag 2019.

## Catatan akurasi
- Nama sahabat tidak disebut di hadis → disebut "seorang sahabat" / "sang imam".
- Kalimat PRAJURIT "Ya Rasulullah, imam kami…" = dramatisasi dari «ذكروا ذلك للنبي ﷺ» (mereka menceritakannya kepada Nabi). Pertanyaan PRAJURIT "Kenapa kamu…" = pelaksanaan perintah «سلوه».
- Kisah serupa di Masjid Quba (Bukhari 774 mu'allaq, «حبك إياها أدخلك الجنة») orangnya berbeda → TIDAK dicampur.

## Storyboard v1: kisah sahabat + dialog karakter, desain kamera virtual

### A. Sistem desain
1. **Lapisan**
   | Lapisan | Isi |
   |---|---|
   | DUNIA A (panorama, GY 700, x −600…7600) | Madinah fajar hangat (rumah bata, palem, ambang pintu bercahaya = kehadiran Rasulullah ﷺ, TANPA sosok), lintasan gurun + bukit pasir, kemah malam (2 tenda, api unggun, imam + 3 shaf di belakangnya). Langit mengikuti kamera: Madinah DAWN → kemah NIGHT. |
   | DUNIA B (lembar Al-Ikhlas) | Lembar 4 ayat yang sama dengan video 1 (bingkai emas, bintang 8, penanda ①–④) di langit indigo. |
   | DUNIA C (kamar malam) | Kamar modern: jendela + bulan, rak buku, lampu meja, sajadah, siluet tanpa wajah duduk dengan mushaf di rehal. |
   | LABEL-DUNIA | Balon dialog (ukuran tetap) menempel di kepala karakter + label "MADINAH", "KEMAH PASUKAN", "SANG IMAM". |
   | HUD | Hook, judul, kartu hadits kaca (Arab + terjemah menyala), pill sumber, caption berwarna per pembicara + chip nama, progres, watermark. |
2. **Zona layar:** judul y 250–440 · jendela kamera 480–1180 (jangkar 540, 830) · pill 1200–1290 · caption 1300–1420 · x ≥ 940 kosong.
3. **Karakter:** siluet tanpa wajah. PRAJURIT (lebih muda/ramping, tombak + perisai bundar, rim **teal**). SANG IMAM (jubah lebar + sorban, rim **emas**). Pasukan = siluet bertombak. Rasulullah ﷺ **tidak digambar dan tidak disuarakan**: hanya cahaya lembut di ambang pintu; sabdanya dibacakan narator.
4. **Dialog:** saat karakter bicara kamera mendorong ke dia; balon kaca menempel di kepalanya (border warna pembicara, tag nama + indikator suara 4 bar yang berdenyut hanya selama run "speech"-nya), teks muncul kata per kata (kunci "k" di cues.json). Caption bawah ikut berwarna (PRAJURIT teal, IMAM emas) + chip nama.
5. **Bahasa kamera:** push-in lambat (hook), whip panjang kemah→Madinah, track barisan pasukan, push ke pembicara, flash-zoom ke lembar (A→B), crossfade B→A, match-cut imam → "kamu" (A→C), crane ke jendela (CTA). Blur hanya di atas ±30 px/frame.

### B. Shot list
| Shot | Kata pemicu | Kamera | HUD | Label-dunia |
|---|---|---|---|---|
| 1 hook | frame 0 | kemah malam, imam + shaf, push-in pelan | hook penuh, "Allah mencintainya" emas | — |
| 2a | "Rasulullah ﷺ mengutus" | whip ke Madinah, ambang pintu bercahaya | judul DIUTUS MEMIMPIN PASUKAN | MADINAH |
| 2b | "memimpin pasukan" | track mengikuti barisan bertombak keluar kota ke gurun | — | SANG IMAM |
| 2c | "Setiap menjadi imam shalat" | tiba di kemah, imam di depan 3 shaf | SETIAP JADI IMAM SHALAT | KEMAH PASUKAN |
| 2d | "menutup … Al-Ikhlas" | push-in ke imam; قُلْ هُوَ اللَّهُ أَحَدٌ menyala di atasnya (visual saja) | SELALU DITUTUP AL-IKHLAS | — |
| 3a | "Sepulangnya" | whip panjang balik ke Madinah, pasukan tiba | PASUKAN MELAPOR | — |
| 3b | PRAJURIT "Ya Rasulullah…" | push ke prajurit menghadap cahaya pintu | balon PRAJURIT + caption teal | — |
| 4 | "Beliau bersabda" | tilt ke cahaya | kartu hadits سَلُوهُ لِأَيِّ شَيْءٍ يَصْنَعُ ذَلِكَ + terjemah menyala · pill HR. Bukhari 7375 · Muslim 813 | — |
| 5 | PRAJURIT "Kenapa kamu…" | whip ke prajurit berhadapan imam | balon PRAJURIT | — |
| 6 | IMAM "Karena surat ini…" | push-in ke imam | balon IMAM + kartu Arab لِأَنَّهَا صِفَةُ الرَّحْمَنِ / وَأَنَا أُحِبُّ أَنْ أَقْرَأَ بِهَا | — |
| 7 | "Mendengar itu … mencintainya" | kembali ke cahaya → tarik lebar (cahaya, prajurit, imam) | kartu أَخْبِرُوهُ أَنَّ اللَّهَ يُحِبُّهُ → judul besar ALLAH MENCINTAINYA + ledakan bintang di imam | — |
| 8 | "Sifat apa…" → 4 sifat | flash-zoom ke lembar; baris per baris | SIFAT APA YANG IA CINTAI? → 4 AYAT → MAHA ESA → TEMPAT MEMINTA → TIDAK BERANAK & TIDAK DIPERANAKKAN → TIDAK ADA YANG SETARA · pill QS. Al-Ikhlas: 1–4 | — |
| 9a | "Sahabat itu dicintai Allah…" | kembali ke imam bercahaya di Madinah | SAHABAT ITU DICINTAI ALLAH → KARENA MENCINTAI SURAT INI | — |
| 9b | "Maka bacalah…" | match-cut imam → "kamu" di kamar malam, mushaf | BACALAH AL-IKHLAS → BUKAN SEKADAR HAFALAN (teks hafalan abu-abu berulang) → BACA DENGAN CINTA (mushaf menyala hangat) | — |
| 10 | "Tulis…" | crane ke jendela, bulan | TULIS "AKU CINTA AL-IKHLAS", kotak komentar mengetik, SIMPAN/BAGIKAN | — |
| 11 | end card | — | logo, Download sekarang | — |

### C. Audio
Tanpa musik, SFX padat (±200+): langkah pasukan, angin gurun (room+hiss), kain tenda, gumam pasukan (rattle pelan), api unggun (sizzle+klik), pop + tick saat balon muncul, whoosh/whip/judul. SFX diredam (×0,35) selama run suara PRAJURIT & IMAM. −14 LUFS.
