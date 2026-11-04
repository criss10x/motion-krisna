# Sintesis SFX halus dari sfx.json, campur dengan narasi.wav -> mix.wav (belum loudnorm)
import json, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(1)

def env(n, a=0.004, r=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a)
    return e * np.exp(-t / (r or n / SR / 4))

def tone(f0, f1, dur, r):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * t / dur
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, r=r)

def noise_sweep(dur, lo, hi, rise=0.6):
    n = int(dur * SR); x = rng.standard_normal(n)
    out, y, = np.zeros(n), 0.0
    t = np.arange(n) / n
    cut = lo + (hi - lo) * np.sin(np.pi * np.clip(t / rise, 0, 1) / 2)  # filter naik
    for i in range(n):  # one-pole lowpass dengan cutoff berubah
        a = 1 - np.exp(-2 * np.pi * cut[i] / SR); y += a * (x[i] - y); out[i] = y
    shape = np.sin(np.pi * t) ** 2
    return out * shape / (np.abs(out).max() + 1e-9)

SYN = {
    'pop': lambda: tone(900, 420, .09, .025) * .8,
    'tick': lambda: tone(2600, 2400, .03, .006) * .6,
    'thud': lambda: tone(140, 60, .25, .07) + rng.standard_normal(int(.25 * SR)) * env(int(.25 * SR), r=.015) * .25,
    'ding': lambda: sum(tone(f, f, .9, .25) * g for f, g in [(1320, .6), (2640, .25), (3960, .1)]),
    'stamp': lambda: tone(110, 45, .35, .1) * 1.2 + rng.standard_normal(int(.35 * SR)) * env(int(.35 * SR), r=.03) * .5,
    'whoosh': lambda: noise_sweep(.45, 300, 4500),
    'plung': lambda: tone(260, 900, .22, .08) * .9,
    'sparkle': lambda: sum(np.pad(tone(f, f, .5, .12), (int(k * .07 * SR), int(.3 * SR) - int(k * .07 * SR))) for k, f in enumerate([2093, 2637, 3136, 4186])) * .35,
}
cache = {k: v() for k, v in SYN.items()}

with wave.open('narasi.wav') as w:
    nar = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2: nar = nar.reshape(-1, 2).mean(1)
fx = np.zeros(len(nar) + SR)
for e in json.load(open('sfx.json')):
    s = cache[e['type']]; i = int(e['t'] * SR)
    if i < 0: s, i = s[-i:], 0
    fx[i:i + len(s)] += s[:len(fx) - i] * e['vol']
fx = fx[:len(nar)] * 10 ** (-17 / 20)  # SFX ~17 dB di bawah narasi
mix = nar + fx
mix /= max(1.0, np.abs(mix).max() / 0.95)
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('mix', len(mix) / SR, 's')
