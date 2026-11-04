import asyncio, edge_tts, sys
LINES = [
 "Minyak zaitun nggak boleh buat goreng? Salah.",
 "Penelitian dua ribu delapan belas: dipanaskan, minyak zaitun justru paling stabil.",
 "Asal apinya sedang, jangan sampai berasap.",
 "Jadi, boleh! Simpan biar nggak salah.",
]
VOICE = sys.argv[1] if len(sys.argv) > 1 else "id-ID-GadisNeural"
async def main():
    for i, t in enumerate(LINES, 1):
        await edge_tts.Communicate(t, VOICE, rate="+18%").save(f"audio/s{i:02d}.mp3")
asyncio.run(main())
