# Al-Ikhlas — film Remotion

Video pertama Muslim Leveling yang memakai Remotion, bukan preview.html + record.mjs. Gayanya neon elegan: bintang 8 sudut, glow, light leak WebGL, dan caption karaoke.

Jalankan dari `projects/al-ikhlas/`:

```bash
python -I voice/cues.py                                   # narasi.json -> film-remotion/public/cues.json
python -I ../../tools/mix.py --project .                  # narasi + SFX -> film/audio-nomusic.wav (-14 LUFS)
cp film/audio-nomusic.wav film-remotion/public/narasi.wav
cd film-remotion && npm i
npx remotion studio                                       # preview
npx remotion render AlIkhlas ../al-ikhlas_9x16_v2.mp4 --gl=angle --codec=h264 --crf=18 --audio-codec=aac
```

- Waktu kata kunci (`K` di `src/Video.tsx`) diambil dari `public/cues.json`. Kalau narasinya diganti, perbarui nilainya.
- Safe zone TikTok/Reels: subtitle berakhir di y=1400, tombol kanan x≥940 dikosongkan, bawah 480 px kosong.
- Remotion gratis untuk tim ≤3 orang (https://www.remotion.pro/license).
