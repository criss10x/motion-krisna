# Rasio SFX terhadap narasi (dB) per proyek: /usr/bin/python3 -I skills/kamera-virtual/scripts/sfxratio.py projects/<topik> [...]
# Narasi = voice/narasi.wav, campuran = film/audio-nomusic.wav. Acuan: gunung-akar -21.9, al-amin -20.8, urat-jantung -18.9.
import sys, subprocess, numpy as np
def load(p):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','48000','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).astype(float)
for d in sys.argv[1:]:
    v=load(d+'/voice/narasi.wav'); m=load(d+'/film/audio-nomusic.wav')
    n=min(len(v),len(m)); v=v[:n]; m=m[:n]
    g=np.dot(m,v)/np.dot(v,v); r=m-g*v
    print(d, 'voice gain %.2f'%g, 'sfx/voice rms dB %.1f'%(20*np.log10(np.sqrt(np.mean(r**2))/np.sqrt(np.mean((g*v)**2)))))
