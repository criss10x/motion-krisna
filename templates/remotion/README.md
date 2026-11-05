# Template Remotion: Muslim Leveling Neon

Titik awal untuk video bergaya neon elegan: bintang 8 sudut, glow, light leak WebGL emerald, caption karaoke di safe zone, progress bar dengan bab. Isi contohnya adalah video Al-Ikhlas "Sepertiga Al-Qur'an dalam 10 detik" (komposisi `AlIkhlas`).

## Mulai proyek baru

```bash
mkdir -p projects/<topik>/voice projects/<topik>/film
cp -r templates/remotion projects/<topik>/film-remotion
cp templates/cues.py templates/gen.py templates/tighten.py projects/<topik>/voice/
cp templates/sinematik/env.tsx projects/<topik>/film-remotion/src/   # hanya varian Sinematik
cd projects/<topik>
```

1. Tulis `voice/script.txt` (ayat dalam transliterasi). Atur `VOICE` (`"Sulafat"` atau `"Sadachbia"`), `STYLE`, `VOCAB` di `voice/gen.py`, lalu `/usr/bin/python3 -I voice/gen.py`.
2. Pilih take dan atur durasi. Terlalu panjang: `/usr/bin/python3 -I voice/tighten.py take1 1.15` (pangkas jeda + atempo, lalu `SPEED = 1.0` di `cues.py`). Cukup dipercepat: `ffmpeg -i voice/take1.wav -af atempo=1.12 voice/narasi.wav && cp voice/take1.json voice/narasi.json`.
3. Isi `OPENERS` dan `FIX` di `voice/cues.py` (atau `BOUNDS`/`EXTRA` bila adegan dibuka bacaan Arab yang tidak ditranskrip), lalu `/usr/bin/python3 -I voice/cues.py` → `film-remotion/public/cues.json`.
4. Edit `film-remotion/src/Video.tsx`: konstanta `K` (waktu kata kunci dari `cues.json`), `CHAPTERS`, daftar cut di `Leaks`, dan komponen adegan. Ganti id `AlIkhlas` di `src/Root.tsx`.
5. SFX: tulis `film/timeline.json` (lihat `templates/timeline.example.json`), jalankan `/usr/bin/python3 -I ../../tools/mix.py --project .`, lalu `ffmpeg -y -i film/audio-nomusic.wav -af loudnorm=I=-14:TP=-1.0:LRA=11 -ar 48000 film-remotion/public/narasi.wav`.
6. `cd film-remotion && npm i && npx remotion browser ensure`
7. QA: `npx remotion bundle --out-dir=build`, lalu `npx remotion still build <Id> ../shots/fN.jpg --frame=N --gl=swangle --scale=0.5` per frame, gabung jadi contact sheet.
8. Render (tmux): `npx remotion render build <Id> ../<topik>_9x16_v1.mp4 --gl=swangle --codec=h264 --crf=18 --audio-codec=aac`

`--gl=swangle` dipakai di VPS tanpa GPU; di Windows dengan GPU pakai `--gl=angle`.

## Aturan gaya

- **Safe zone TikTok/Reels:** subtitle berakhir di y=1400, kolom tombol kanan x≥940 dikosongkan, 480 px bawah kosong.
- **Adegan kisah:** figur orang berupa siluet garis neon tanpa wajah. **Nabi ﷺ hanya berupa cahaya** (pintu atau sinar), tanpa tubuh, siluet, atau wajah.
- **Palet:** latar #030B09, emerald #2EF2A4, tosca #00E1EF, emas #E9C46A, teks #FFF9EF.
- **Lisensi:** Remotion gratis untuk tim ≤3 orang (https://www.remotion.pro/license).
