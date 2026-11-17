# Desain dialog karakter: data, komponen, audio

Acuan kode: `assets/contoh-ikhlas-dicintai/`. Semua kode dialog ada di `Video.tsx` (cari `SPK`, `VoiceBars`, `Bubble`, `GROUPS`, `Captions`), `timing.ts` (blok "run suara karakter"), dan `make_timeline.py` (`inrun`, `a`, `bed`, `bubble`). Kerangka kamera (dunia, whip, HUD, panel kaca) tetap mengikuti `skills/kamera-virtual/references/desain-kamera.md`.

## Daftar isi
1. Alur data suara
2. timing.ts: run pembicara
3. Balon dialog (LABEL-DUNIA)
4. Caption per pembicara
5. Karakter dan Rasulullah ﷺ
6. Audio: SFX diredam saat karakter bicara
7. QA khusus dialog

## 1. Alur data suara
```
gen_multi.py SEGMENTS ──gen──▶ voice/seg/<id>-<take>.wav + .json   (TTS per pembicara, sunyi ujung dipangkas, transkrip per segmen)
                      ──cek──▶ cocok % + kata yang berubah per take
                      ──build─▶ voice/mix.wav + mix.json           (GAP sebelum segmen; tiap kata diberi "spk" dan "seg")
tighten.py mix 1.08 0.7 ──────▶ voice/narasi.wav + narasi.json     (kunci tambahan per kata ikut terbawa)
cues.py (versi dialog) ───────▶ public/cues.json                   (words[].k = pembicara, speech[] = run {spk,s,e})
```
- Segmen dibuat per **giliran bicara**, bukan per kalimat. Narator boleh satu segmen panjang (n1 di contoh 21 dtk); setiap kalimat karakter adalah satu segmen.
- Gaya (style) tiap segmen = catatan khusus segmen + gaya pembicara + TAIL "baca persis seperti tertulis". Catatan khusus segmen dipakai untuk emosi ("melapor dengan hormat, sedikit heran").
- `GAP` 0,35 dtk antar-giliran biasa, 0,45–0,55 dtk sebelum jawaban penting atau puncak. `tighten` dengan CAP 0,7 tidak memotong jeda ini.
- `mix.json["segments"]` memakai waktu sebelum tighten, jadi jangan dipakai di Remotion. Gunakan `k`/`speech` dari cues.json.

## 2. timing.ts: run pembicara
```ts
export type Run = { spk: string; s: number; e: number };
// di makeTiming(W, starts):
const SP: Run[] = [];
for (const w of W) {
  const spk = w.k ?? "NARATOR";
  const last = SP[SP.length - 1];
  if (last && last.spk === spk) last.e = w.e;
  else SP.push({ spk, s: w.s, e: w.e });
}
const RUNS = SP.filter((r) => r.spk !== "NARATOR");
const [P1, P2, I1] = RUNS;               // urut sesuai naskah; ekspor bersama K, EV
```
- Kamera mendorong ke pembicara **±0,35 dtk sebelum** `run.s` (`cam_push_pr: K.ya - 0.35`), supaya kamera sudah diam saat suaranya mulai.
- Event SFX balon: `bubble_x: run.s - 0.25`, `bubble_x_out: run.e + 0.5`.
- Kata yang sama bisa diucapkan narator dan karakter (mis. "Al-Ikhlas"). Untuk `kw()`, pakai `after` = awal run atau adegan agar tidak tertukar.

## 3. Balon dialog (LABEL-DUNIA)
Balon adalah label-dunia: posisinya ikut kepala karakter (`scr(c, wx, wy)`), tetapi ukurannya tetap di layar.
- **Ukuran dan zona:** lebar `BW = 620`, `left = clamp(sx - BW*0.42, 70, 920 - BW)` sehingga balon tidak pernah melewati x 940. `bottom = clamp(sy - 44, 560, 1010)` menjaga balon tetap di jendela kamera, di bawah zona judul HUD.
- **Ekor:** segitiga dari dasar balon ke `(sx, min(sy-8, bottom+70))`. Ekor harus selalu menunjuk kepala pembicara walaupun balon terdorong oleh clamp.
- **Isi:** chip nama (latar warna pembicara, teks gelap, letterSpacing 3), `VoiceBars` 4 batang yang berdenyut hanya saat `run.s-0.05 ≤ t ≤ run.e+0.05`, lalu teks 36 px. Kata yang belum diucapkan memakai opasitas 0,16, dan kata yang sedang diucapkan memakai warna pembicara dengan glow. Kata diambil dari `WORDS_ALL.filter(w => w.k === run.spk && w.s >= run.s && w.e <= run.e)`, dan tanda kutip dibuang.
- **Waktu:** balon masuk `run.s - 0.3` dengan pop BACK (scale 0,82→1) dan keluar `run.e + 0,25…0,5`. Opasitas dikali `fadeFast(vel)` supaya balon memudar saat whip.
- **Warna pembicara** (`SPK`): `{ name, col, soft }`. Contohnya PRAJURIT teal `#9FF2E2`/`#D8FBF4` dan SANG IMAM emas `C.goldHi`/`#FFF1CC`. Warna rim siluet di dunia sama dengan warna balonnya, jadi penonton langsung tahu siapa yang bicara.
- Maksimal satu balon sekaligus. Kalau dua karakter bergantian cepat, tutup balon pertama (`until = run.e + 0.25`) sebelum balon kedua masuk.

## 4. Caption per pembicara
- Kelompok caption dipecah saat pembicara berganti: `(next.k ?? "") !== (w.k ?? "")`. Dengan begitu satu baris caption tidak pernah mencampur narator dan karakter.
- Kelompok milik karakter mendapat chip nama di atasnya, border `${col}88`, teks `soft`, dan kata aktif berwarna `col`. Kelompok narator memakai gaya biasa: putih dengan kata aktif emas.

## 5. Karakter dan Rasulullah ﷺ
- **Tokoh** digambar sebagai siluet tanpa wajah (path `PERSON`, `ROBE` + `TURBAN`, `SIT`) dengan rim warna pembicara. Bedakan dari bentuknya: yang muda lebih ramping dan membawa tombak serta perisai, yang dewasa memakai jubah lebar dan sorban. Gerak kecilnya cukup bob dan arah hadap (`face`).
- **Rasulullah ﷺ:** tidak pernah digambar dan tidak pernah disuarakan karakter. Kehadirannya ditandai cahaya lembut, misalnya ambang pintu yang bercahaya. Karakter yang berbicara kepada beliau menghadap cahaya itu. Sabdanya dibacakan NARATOR ("Beliau bersabda: …") sambil menampilkan kartu kaca HUD berjudul `SABDA RASULULLAH ﷺ` yang memuat teks Arab hadis (Amiri, menyala saat diucapkan) dan terjemah yang menyala kata per kata. Pill sumber (mis. "HR. Bukhari 7375 · Muslim 813") ditampilkan bersamaan.
- Jawaban karakter yang berasal dari lafaz hadis boleh disertai kartu Arab kecil, misalnya "JAWABAN SANG IMAM" dengan لِأَنَّهَا صِفَةُ الرَّحْمَنِ, yang ditaruh di HUD atas sementara balon tetap di jendela kamera.
- Allah dan Jibril tidak digambar dalam bentuk apa pun.

## 6. Audio: SFX diredam saat karakter bicara
```python
RUNS=[(r['s'],r['e']) for r in c['speech'] if r['spk']!='NARATOR']
def inrun(t,pad=0.12): return any(a-pad<=t<=b+pad for a,b in RUNS)
def a(t,kind,gain,**k):                       # semua SFX lewat sini
    g=gain*(0.35 if inrun(t) else 1.0)
    sfx.append(dict(t=round(t,2),kind=kind,gain=round(g,4),**k))
def bed(t0,t1,kind,gain,**k):                 # ambience panjang dipecah di batas run, potongan di dalam run ×0,35
    ...  # lihat assets/contoh-ikhlas-dicintai/make_timeline.py
def bubble(t,p=1.0):                          # balon muncul: whoosh kecil + pop + klik + plip (tidak diredam)
```
Hasil contoh: 379 SFX dalam 74,9 dtk, −14,0 LUFS. Suara karakter tetap jelas walaupun ambience (api, angin, langkah pasukan) padat.

## 7. QA khusus dialog
Selain contact sheet kamera-virtual, cek juga:
- Satu frame di tengah setiap run karakter. Balon harus utuh di x < 940, ekornya menunjuk kepala yang benar, tidak menutupi kepala pembicara, dan tidak menabrak kartu hadis atau judul.
- Warna chip balon harus sama dengan rim siluet dan chip caption.
- Frame tepat di pergantian narator → karakter. Caption harus berganti gaya dan VoiceBars harus mulai berdenyut.
- Saat sabda dibacakan: hanya cahaya yang tampil, tidak ada sosok, dan kartu `SABDA RASULULLAH ﷺ` terlihat.
- Dengar ulang `shots/sampel-dialog.m4a`: setiap pergantian suara harus terdengar jelas, dan jeda antar-giliran tidak boleh terasa canggung (terlalu rapat < 0,25 dtk, terlalu lama > 0,7 dtk).
