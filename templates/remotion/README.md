# Template Remotion: Muslim Leveling Neon

Titik awal untuk video bergaya neon elegan: bintang 8 sudut, glow, light leak WebGL emerald, caption karaoke di safe zone, progress bar dengan bab. Isi contohnya adalah video Al-Ikhlas "Sepertiga Al-Qur'an dalam 10 detik" (komposisi `AlIkhlas`).

## Mulai proyek baru

```bash
mkdir -p projects/<topik>/voice projects/<topik>/film
cp -r templates/remotion projects/<topik>/film-remotion
cp templates/cues.py templates/gen.py projects/<topik>/voice/
cd projects/<topik>
```

1. Tulis `voice/script.txt`. Atur suara dan gaya di `voice/gen.py` (`voice="Sulafat"` atau `"Sadachbia"`), lalu jalankan `python3 -I voice/gen.py`.
2. Pilih take dan percepat: `ffmpeg -i voice/take1.wav -af atempo=1.12 voice/narasi.wav`, lalu `cp voice/take1.json voice/narasi.json`.
3. Isi `OPENERS` (dan `FIX` kalau ada salah dengar) di `voice/cues.py`, lalu `python3 -I voice/cues.py` → `film-remotion/public/cues.json`.
4. Edit `film-remotion/src/Video.tsx`: konstanta `K` (waktu kata kunci dari `cues.json`), `CHAPTERS`, daftar cut di `Leaks`, dan komponen adegan.
5. SFX: tulis `film/timeline.json` (lihat `templates/timeline.example.json`), jalankan `python3 -I ../../tools/mix.py --project .`, lalu `cp film/audio-nomusic.wav film-remotion/public/narasi.wav`.
6. `cd film-remotion && npm i && npx remotion browser ensure`
7. QA: `npx remotion still AlIkhlas shots/x.jpg --frame=N --gl=swangle`
8. Render: `npx remotion render AlIkhlas ../<topik>_9x16_v1.mp4 --gl=swangle --codec=h264 --crf=18 --audio-codec=aac`

`--gl=swangle` dipakai di VPS tanpa GPU; di Windows dengan GPU pakai `--gl=angle`.

## Aturan gaya

- **Safe zone TikTok/Reels:** subtitle berakhir di y=1400, kolom tombol kanan x≥940 dikosongkan, 480 px bawah kosong.
- **Adegan kisah:** figur orang berupa siluet garis neon tanpa wajah. **Nabi ﷺ hanya berupa cahaya** (pintu atau sinar), tanpa tubuh, siluet, atau wajah.
- **Palet:** latar #030B09, emerald #2EF2A4, tosca #00E1EF, emas #E9C46A, teks #FFF9EF.
- **Lisensi:** Remotion gratis untuk tim ≤3 orang (https://www.remotion.pro/license).
