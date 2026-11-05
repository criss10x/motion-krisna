"""Narasi per adegan dengan Gemini TTS (suara standar Mindset Sehat: Leda) -> audio/sNN.wav.
Jalankan: python -I tts_gemini.py   (butuh gcloud login + vertex.py dari gorengan/tools)"""
import os, subprocess, sys
sys.path.insert(0, r"C:\Users\Administrator\Documents\Claude Code Ku\gorengan\tools")
import vertex

VOICE = "Leda"
STYLE = ("Perempuan Indonesia umur 25-an, ngobrol santai dan ceria seperti teman yang lagi bongkar fakta kesehatan di TikTok. "
         "Tempo cepat dan bertenaga, jeda singkat antar kalimat, natural, tidak seperti pembaca berita.")
LINES = [
 "Magnesium bukan obat tidur. Kecuali kamu lakukan ini.",
 "Penelitian ke lansia susah tidur: magnesium cuma bikin tidur lebih cepat tujuh belas menit.",
 "Kenapa cuma segitu? Karena yang bikin kamu melek jauh lebih berat. Kopi sore, layar hape, jam tidur berantakan.",
 "Magnesium bantu rileks, tapi pengganggunya harus dikurangi dulu. Ini tiga caranya.",
 "Cara satu: kopi terakhir enam jam sebelum tidur. Lewat dari itu, tidurmu bisa kepotong sejam.",
 "Cara dua: taruh hape jauh dari kasur, tiga puluh menit sebelum tidur.",
 "Cara tiga: tidur dan bangun di jam yang sama, termasuk hari libur.",
 "Ingat: lima ratus miligram di label itu berat senyawanya, bukan magnesium murni. Punya sakit ginjal atau rutin minum obat? Tanya dokter dulu.",
 "Magnesium plus kebiasaan? Worth it!",
 "Kalau mau coba, ini Vitalife Magnesium Bisglycinate. Tiga puluh kapsul, ada label halal, terdaftar be-pe-o-em. Cek di keranjang kuning ya.",
]

os.makedirs("audio", exist_ok=True)
bearer = vertex.token()
only = {int(a) for a in sys.argv[1:]}  # ponytail: angka adegan untuk generate ulang sebagian
for i, line in enumerate(LINES, 1):
    if only and i not in only:
        continue
    raw = f"audio/s{i:02d}.raw"
    vertex.speak(line, raw, bearer, voice=VOICE, style=STYLE)
    wav = f"audio/s{i:02d}.wav"
    if open(raw, "rb").read(4) == b"RIFF":
        os.replace(raw, wav)
    else:  # PCM mentah 24 kHz 16-bit mono
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw, wav], check=True)
        os.remove(raw)
    print(i, "ok")
