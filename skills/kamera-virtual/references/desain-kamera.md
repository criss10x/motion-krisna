# Desain kamera virtual: sistem dan arsitektur kode

Acuan implementasi: `assets/contoh-gunung-akar/Video.tsx` (±930 baris) dan `timing.ts`.

## Daftar isi
1. Arsitektur file
2. timing.ts: kata → kamera → event
3. Kamera: interpolasi, napas, motion blur, shake
4. Beberapa dunia dan peralihannya
5. Label-dunia dan HUD
6. Alat bantu orientasi
7. Templat storyboard
8. SFX dari event

## 1. Arsitektur file
```
film-remotion/src/
  env.tsx     palet C, langit (NIGHT/DAWN, lerpSky), Stars, Clouds, Rays, Vignette, ramp(), win(), W/H
  timing.ts   MURNI (tanpa import Remotion): makeTiming(words, starts) → { K, A, B, C, TR, EV, ... }
  Video.tsx   WorldA/WorldB/WorldC (SVG dunia), komponen HUD, komposisi utama
  Root.tsx    durationInFrames = ceil(cues.duration * 30), id komposisi PascalCase
```
`timing.ts` sengaja dibuat murni supaya `scripts/k.mts` bisa membacanya dengan node. Hasilnya `shots/k.txt` selalu sama persis dengan video, tanpa daftar waktu kedua yang bisa melenceng.

## 2. timing.ts
- `kw(target, after)`: mencari waktu mulai kata pertama yang diawali `target` setelah `after` detik. Pakai `after = S<n>` (awal adegan) atau `kw("kata sebelumnya", S<n>)` untuk kata yang muncul berulang.
- `K`: semua kata kunci. Kunci untuk kata yang muncul lebih dari sekali diberi nomor adegan (`akar0`, `akar2`, `pasak3`, `pasak4`).
- **Keyframe kamera per dunia:** `Key = [t, x, y, zoom]`. x dan y adalah titik dunia yang tampil di jangkar layar (540, 830).
  - Satu baris per pose. Gerakan terjadi di antara dua pose; pose yang sama diulang untuk "menahan" kamera.
  - Contoh 2a: `[S1 - 0.05, MX, 1178, 0.9] → [S1 + 0.75, MX, PEAK, 2.2]` adalah zoom ke puncak.
  - Contoh whip: dua pose dengan jarak 0,3–0,35 dtk.
- `TR`: waktu peralihan antar-dunia (`ab0/ab1` whip samping, `mo0/mo1` morph, `ac0/ac1` whip naik, `ca0/ca1` whip turun).
- `EV`: **semua** event visual (gerak kamera mulai/selesai, judul, label, pukulan, morph, tombol CTA) dalam detik. Ini sumber `k.txt` untuk SFX.
- Skala dunia ASLI kalau ada sumbu fisik. Gunung-akar memakai 30 px/km: puncak 9 km, ujung akar 70 km. Penggaris HUD tinggal membaca `c.y`.

## 3. Kamera
```ts
const AX = 540, AY = 830;                       // jangkar layar
const EASE = Easing.bezier(0.65, 0, 0.35, 1);   // in-out
camAt(keys, t)  // interpolasi x,y linear-eased; zoom di ruang log (exp(lerp(log z))) supaya zoom terasa rata
cam(keys, t)    // + napas: z * (1 + 0.012*sin(0.8 t))
scr(c, wx, wy)  // titik dunia → layar: [AX + (wx-c.x)*z, AY + (wy-c.y)*z]
worldTf(c)      // `translate(${AX - c.x*z} ${AY - c.y*z}) scale(${z})` untuk <g> dunia
vel(keys, t)    // kecepatan layar per frame → motion blur
```
- **Motion blur:** `feGaussianBlur stdDeviation = min(40, max(0, |v| - 30) * 0.4)` per sumbu, ditambah blur ekstra sin(π·p)·30 saat whip. Filter dipasang hanya kalau nilainya di atas 1,2, jadi track lambat tetap tajam.
- **Fokus dangkal:** latar jauh di-blur `(z - 1.3) * 4` px (paling besar 6) saat zoom-in. Vignette menguat seiring zoom.
- **Parallax:** di dalam dunia, lapisan jauh memakai faktor x/y sendiri (bintang 0,2, bulan 0,1, punggung gunung jauh 0,45/0,65, debu depan ±1,4).
- **Shake:** `shakeXY(t, at, amp, dur)` dijumlahkan dari semua impact (gempa 7 px/0,5 dtk, pukulan 6 px/0,22 dtk) lalu diterapkan ke seluruh lapisan DUNIA.

## 4. Beberapa dunia
Gunung-akar punya tiga "set": A penampang gunung, B perkemahan, C lembah Makkah malam. Masing-masing punya kamera sendiri (`cam(TM.A,t)`, dst.), lalu dirender bergantian:
- **Whip antar-set:** set lama digeser keluar W atau H piksel × `ramp(TR)`, set baru masuk dari sisi berlawanan, ditambah blur arah gerak.
- **Morph (match-cut):** siluet benda di set B (pasak, N titik) dan siluet di set A (akar gunung, N titik dengan urutan sama) dikonversi ke layar dengan `scr()` masing-masing kamera. Poligon di-lerp `pMO`, sementara opasitas set B turun dan set A naik. Dengan begitu bentuk benar-benar "berubah", bukan sekadar crossfade.
- Set yang tidak aktif tidak dirender (`showA/showB/showC`) supaya render cepat.

## 5. Label-dunia dan HUD
- `WLabel`: posisi `scr(c, wx, wy)` ditambah offset dx/dy, dengan ukuran font tetap (34–44 px) dan garis penunjuk emas tipis ke titik benda. Label memudar saat kamera bergerak cepat (`fadeFast`), dan hanya tampil kalau titiknya berada di jendela kamera.
- `Title`: di y ±330, frasa 2–4 kata, kata kunci emas (`hiAt` = waktu kata itu diucapkan, saat ia "pop"). Tiap judul punya `at`/`until`.
- `Pill`: sumber dalil (mis. "QS. An-Naba': 6–7") di y ±1240.
- **Panel ayat kaca** (`GLASS`): latar gelap transparan, `backdropFilter: blur(14px)`, border emas 1 px. Isinya tulisan Arab Amiri (satu baris, lebar diatur agar tidak patah) dan terjemah Readex yang kata-katanya menyala mengikuti narasi.
- **Caption** kata per kata di pita gelap y 1300–1420; kata yang sedang diucapkan diberi warna emas.
- **HookText:** hook satu kalimat penuh sejak frame 0, kata kunci besar dan emas. Label seri ditaruh di atasnya.
- **End card:** logo Muslim Leveling dengan sinar, "Download sekarang".

## 6. Alat bantu orientasi
- **Penggaris** di kiri (x 40–110): skala bergerak mengikuti `c.y`, dengan chip angka ("+8.849 m", "−19 km", "−54 km").
- **Mini-map** di kiri bawah jendela kamera (x 26–138, y 1078–1228): siluet dunia dengan kotak emas seukuran viewport kamera (`W/z × H/z`).
- Keduanya tampil hanya saat kamera menjelajah dunia ber-sumbu (`instr`), dan disembunyikan di set lain.
- Topik lain bisa memakai padanan yang sesuai: garis waktu tahun (sejarah atau nubuat), kompas atau jarak (perjalanan), skala ukuran (mikro ke makro).

## 7. Templat storyboard
```
## Storyboard vN: <tema lama>, desain baru untuk kamera virtual
### A. Sistem desain
1. Lapisan (tabel DUNIA / LABEL-DUNIA / HUD: isi tiap lapisan, ukuran kanvas dunia)
2. Zona layar (y 250–440 judul, 480–1180 jendela, 1200–1290 pill, 1300–1420 caption)
3. Alat bantu kamera (penggaris/mini-map/timeline)
4. Parallax & fokus
5. Bahasa gerak kamera (push/pull, whip, track, crane, match-cut, napas, shake)
6. Aturan teks
### B. Shot list
| Shot | Kata pemicu | Kamera | HUD | Label-dunia | SFX |
### C. Audio (tanpa musik, SFX padat, −14 LUFS)
```
Shot berganti setiap 2–4 dtk. Setiap shot dipicu satu kata narasi dan punya satu tujuan visual.

## 8. SFX dari event
`make_timeline.py` membaca `shots/k.txt` dan memakai fungsi pembantu:
- `move(t0, t1)`: whoosh sepanjang gerak plus riser pelan.
- `whip(t0, t1)`: whoosh 0,55, thunk dan drop saat mendarat.
- `title(t, pitch)`: whoosh kecil dan pop.
- `label(t, pitch)`: klik dan plip.
- Lainnya: pukulan (`thunk + clack + crunch`), gempa (`drop + rattle + impact`), morph (`riser → impact + powerup`), cahaya (`powerup + clink` bertingkat), mengetik CTA (`key` ×11), ambience (`room`/`hiss`) per set.

Gain whoosh 0,03–0,055, pop/klik 0,02–0,035, impact 0,035–0,05. Hasilnya 254 SFX dalam 67 dtk dengan rasio SFX/voice −21,9 dB.
