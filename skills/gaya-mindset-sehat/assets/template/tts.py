import asyncio, edge_tts, sys
LINES = [
 "Chia sid nggak bikin kurus. Kecuali kamu lakukan ini.",
 "Penelitian: makan chia doang, dua belas minggu... berat nggak turun.",
 "Kenapa? Total makan sehari tetap banyak. Kalori masuk lebih besar dari yang kepakai, berat ya nggak turun.",
 "Chia bantu kenyang, jadi kurangi makan lebih gampang. Ini tiga caranya.",
 "Cara satu: ganti camilan manis sore dengan puding chia. Satu sendok chia, yogurt tawar, potongan buah.",
 "Cara dua: pilih pola makan yang kuat kamu jalani. Puasa intermiten, atau kurangi porsi biasa, hasilnya mirip. Pas buka puasa, mulai dari chia biar nggak kalap.",
 "Cara tiga: setengah piringmu sayur dan buah. Nasinya dikurangi.",
 "Ingat: chia wajib direndam, mulai satu sendok, dan minum air lebih banyak. Susah menelan? Tanya dokter dulu.",
 "Chia plus diet? Worth it!",
 "Kalau mau coba, ini Safiya Chia Sid. Lima ratus gram, seratus persen chia alami, ada label halal. Cek di keranjang kuning ya.",
]
VOICE = sys.argv[1] if len(sys.argv) > 1 else "id-ID-GadisNeural"
async def main():
    for i, t in enumerate(LINES, 1):
        await edge_tts.Communicate(t, VOICE, rate="+18%").save(f"audio/s{i:02d}.mp3")
asyncio.run(main())
