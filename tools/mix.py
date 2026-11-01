import json
import subprocess
import sys
from pathlib import Path

import numpy as np

# Synthesized sound design + music bed + narration, mixed to -14 LUFS / -1.5 dBTP (Reels/TikTok loudness).
#   python3 -I mix.py --project DIR   -> DIR/film/audio.wav and DIR/film/audio-nomusic.wav
# Reads DIR/film/timeline.json: "narration" {file, at}, "sfx" [{t, kind, gain, until?, pitch?}],
# optional "bed" {pad, groove, arp, bright, duck, fadeIn, from, to, dropFrom, dropTo, bpm}. Every sound is numpy-made, so nothing
# needs a licence. Kinds: klik press snap relay whoosh hum buzz boil riser impact arc room powerdown powerup jeglek zap drop
# hiss (steam release, dur) rattle (a pressure weight chattering on its vent, dur, rate) thunk (a metal lid seating)
# engine (a scooter following a revs curve: "curve" [[t, rpm, throttle, km/h, level], ...] and "until") blub (air gulping
# into a galon: size, pitch, bass 0-1 for a rounder, heavier gulp) plip (a bubble breaking the surface) pour (water into
# a glass, "until", start/end fill 0-1, height of the glass in m: the ring rises in pitch as it fills).
# clink (ice on glass or steel, pitch) thread (a screw cap turning, dur, rate of ticks) pop (a soft suction pop, pitch).
# crunch (a bite through something crisp, a kerupuk or a chip: crack, knock, sub thump and a train of tiny fractures, size).
# glasscrack (a drinking glass cracking from heat: a sharp tick, the crack running as a fast zip of ticks, a short dull
# ring of the glass and a mid knock a phone can play, size).
# The bed's pad, kick and arp sit mostly under 600 Hz, which phone speakers barely play; "bright" (about 0.5) adds a
# marimba-like pluck two octaves over the pad's chords and a soft shaker, so the music still reads on a phone.
import argparse
_ap = argparse.ArgumentParser()
_ap.add_argument("--project", default=".")
ROOT = Path(_ap.parse_args().project).resolve()
HERE = ROOT / "film"
SR = 48000
T = json.loads((HERE / "timeline.json").read_text())
N = int((T["duration"] + 0.5) * SR)
rng = np.random.default_rng(7)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def place(track, clip, at, gain=1.0):
    start = int(round(at * SR))
    if start < 0:
        clip = clip[-start:]
        start = 0
    end = min(len(track), start + len(clip))
    if end <= start:
        return
    track[start:end] += clip[: end - start] * gain


def env(n, attack, release):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    r = np.clip((n / SR - t) / max(release, 1e-4), 0, 1)
    return a * r


def tone(freq, dur, tau, phase=0.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * freq * t + phase) * np.exp(-t / tau)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * np.asarray(cutoff) / SR)
    y = np.zeros_like(x)
    prev = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def room(x, wet=0.22):
    out = x.copy()
    for delay, gain in [(0.011, 0.32), (0.019, 0.22), (0.031, 0.14)]:
        d = int(delay * SR)
        out[d:] += x[:-d] * gain * wet / 0.22
    tail_n = int(0.14 * SR)
    tail = lowpass(rng.standard_normal(tail_n), 2400) * np.exp(-np.arange(tail_n) / SR / 0.045)
    conv = np.convolve(x, tail)[: len(x)] * 0.018 * wet / 0.22
    return out + conv


def klik(pitch=1.0):
    dur = 0.32
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    tick = tone(4100 * pitch, 0.02, 0.0025) * 0.16
    place(out, tick, 0.0)
    at = 0.012
    burst = np.diff(rng.standard_normal(n) * np.exp(-t / 0.0011), prepend=0)
    cavity = bandpass(rng.standard_normal(n), 620 * pitch, 1500 * pitch) * np.exp(-t / 0.02) * 1.6
    body = sum(a * tone(f * pitch, dur, tau) for f, tau, a in [(760, 0.03, 0.5), (1320, 0.02, 0.38), (2450, 0.011, 0.24), (3900, 0.006, 0.12)])
    tt = np.arange(n) / SR
    ping = np.sin(2 * np.pi * 2950 * pitch * tt + 0.8 * np.sin(2 * np.pi * 38 * tt)) * np.exp(-tt / 0.07) * 0.1
    thump = tone(95, dur, 0.04) * 0.65
    # Weight and crunch: a low plastic-and-steel thunk under the snap, and a bright grit on the first few ms.
    thunk = tone(150 * pitch, dur, 0.028) * 0.55 + tone(232 * pitch, dur, 0.02) * 0.38 + tone(61, dur, 0.06) * 0.35
    crunch = (lowpass(rng.standard_normal(n), 7000) - lowpass(rng.standard_normal(n), 2200)) * np.exp(-t / 0.0045) * 0.75
    place(out, burst * 0.9 + cavity + body + ping + thump + thunk + crunch, at)
    stop = bandpass(rng.standard_normal(n), 800, 2200) * np.exp(-t / 0.012) * 0.7 + sum(a * tone(f * pitch, dur, tau) for f, tau, a in [(1050, 0.016, 0.3), (1900, 0.009, 0.2)])
    place(out, stop * 0.6, at + 0.028)
    out = room(out)
    return out / np.max(np.abs(out))


def press():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    slide = bandpass(rng.standard_normal(n), 1400, 3200) * np.clip(t / 0.01, 0, 1) * np.exp(-t / 0.025) * (t < 0.06) * 0.35
    out = slide.copy()
    latch = klik(0.78)
    place(out, latch * 0.9, 0.055)
    place(out, tone(80, 0.12, 0.05) * 0.5, 0.068)
    return out / np.max(np.abs(out))


def snap():
    """Spring steel letting go: a low thud, a short inharmonic ring and a rattle, under the klik."""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.09)
    ring = sum(a * np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * 6 * t)) * np.exp(-t / tau) for f, tau, a in [(620, 0.16, 0.30), (1170, 0.12, 0.22), (1810, 0.08, 0.16), (2740, 0.05, 0.10)])
    rattle = bandpass(rng.standard_normal(n), 1800, 6000) * np.exp(-t / 0.018) * 0.5
    out = thud * 0.9 + ring + rattle
    out = room(out, wet=0.3)
    return out / np.max(np.abs(out))


def arc(dur=0.35):
    """An electric arc: crackling broadband bursts with a 100 Hz buzz under them, dying out fast."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    crackle = np.zeros(n)
    t_now = 0.0
    while t_now < dur:
        t_now += rng.exponential(0.004)
        d = int(rng.uniform(0.0005, 0.003) * SR)
        start = int(t_now * SR)
        if start + d < n:
            crackle[start:start + d] += rng.standard_normal(d) * rng.uniform(0.3, 1.0)
    crackle = crackle - lowpass(crackle, 900)
    buzzing = (np.sin(2 * np.pi * 100 * t) + 0.5 * np.sign(np.sin(2 * np.pi * 100 * t))) * 0.25
    out = (crackle * 0.9 + buzzing) * np.exp(-t / (dur / 3)) * np.clip(t / 0.002, 0, 1)
    return room(out, wet=0.25)


def buzz(dur):
    """Mains hum through a loaded conductor: 50 Hz family (100 Hz magnetostriction and its harmonics)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    wave = 0.55 * np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 200 * t) + 0.18 * np.sin(2 * np.pi * 300 * t) + 0.08 * np.sin(2 * np.pi * 400 * t)
    return wave * env(n, 0.5, 0.4)


def jeglek():
    """A breaker tripping: the latch's bright tick, then the toggle slamming to OFF 22 ms later (a low plastic
    clunk with body and a sub thump that phones still feel), and the case rattling."""
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    tick = (lowpass(rng.standard_normal(n), 9000) - lowpass(rng.standard_normal(n), 2500)) * np.exp(-t / 0.0025) * 0.9
    tick = tick + tone(3100, 0.5, 0.006) * 0.35 + tone(4700, 0.5, 0.004) * 0.25
    place(out, tick, 0.0)
    body = sum(a * tone(f, 0.5, tau) for f, tau, a in [(118, 0.07, 0.9), (176, 0.05, 0.6), (262, 0.035, 0.45), (690, 0.02, 0.35), (1150, 0.012, 0.25)])
    knock = bandpass(rng.standard_normal(n), 300, 2400) * np.exp(-t / 0.008) * 1.2
    sub = np.sin(2 * np.pi * np.cumsum(55 + 50 * np.exp(-t / 0.015)) / SR) * np.exp(-t / 0.09) * 0.8
    place(out, body + knock + sub, 0.022)
    place(out, bandpass(rng.standard_normal(n), 1500, 5000) * np.exp(-t / 0.03) * 0.25, 0.032)
    out = room(out, wet=0.28)
    return out / np.max(np.abs(out))


def zap(dur=0.5):
    """A short-circuit zap: a harsh, jittery buzz over crackle and sizzle."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    wander = rng.standard_normal(n).cumsum() / np.sqrt(np.arange(1, n + 1))
    phase = 2 * np.pi * np.cumsum(150 + 40 * np.sin(2 * np.pi * 23 * t) + 25 * wander) / SR
    saw = 2 * ((phase / (2 * np.pi)) % 1) - 1
    crackle = np.diff(rng.standard_normal(n) * (rng.random(n) < 0.08), prepend=0) * 0.8
    sizzle = (lowpass(rng.standard_normal(n), 9000) - lowpass(rng.standard_normal(n), 3500)) * 0.35
    out = (saw * 0.55 + crackle + sizzle) * np.exp(-t / (dur / 2.5)) * np.clip(t / 0.003, 0, 1)
    return room(out, wet=0.2)


def drop(dur=0.6):
    """A sub-bass drop: a sine sweeping down from about 110 to 38 Hz."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(38 + 72 * np.exp(-t / (dur / 3))) / SR) * np.exp(-t / (dur / 2)) * np.clip(t / 0.005, 0, 1)


def powerdown(dur=1.0):
    """The house losing power: mains hum that sags in pitch and fades, like a fan or fridge spinning down."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    phase = 2 * np.pi * np.cumsum(100 * (1 - 0.6 * u ** 0.7)) / SR
    wave = 0.55 * np.sin(phase) + 0.32 * np.sin(2 * phase) + 0.2 * np.sin(3 * phase) + 0.12 * np.sin(4 * phase) + 0.06 * np.sign(np.sin(phase))
    return wave * np.exp(-u * 3.2) * np.clip(t / 0.01, 0, 1)


def powerup(dur=0.7):
    """Power coming back: the hum rising into pitch."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    phase = 2 * np.pi * np.cumsum(100 * (0.55 + 0.45 * u ** 0.5)) / SR
    wave = 0.55 * np.sin(phase) + 0.3 * np.sin(2 * phase) + 0.16 * np.sin(3 * phase) + 0.08 * np.sin(4 * phase)
    return wave * np.clip(u / 0.4, 0, 1) * np.clip((1 - u) / 0.3, 0, 1)


def relay():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    place(out, klik(1.6) * 0.35, 0.0)
    chime = (np.sin(2 * np.pi * 1318.5 * t) * 0.6 + np.sin(2 * np.pi * 1975.5 * t) * 0.35 + np.sin(2 * np.pi * 2637 * t) * 0.15) * np.exp(-t / 0.42) * np.clip(t / 0.004, 0, 1)
    place(out, chime * 0.45, 0.03)
    return out


def beep(count=3, on=0.07, gap=0.1, freq=2730.0):
    """A meter's alarm buzzer: square-ish piezo tone bursts ("tit, tit, tit"), slightly hollow from the case."""
    n = int((count * (on + gap) + 0.15) * SR)
    out = np.zeros(n)
    m = int(on * SR)
    t = np.arange(m) / SR
    wave = sum(np.sin(2 * np.pi * freq * h * t) / h for h in (1, 3, 5)) * (1 - 0.18 * np.sin(2 * np.pi * 140 * t))
    burst = wave * env(m, 0.003, 0.012)
    for i in range(count):
        place(out, burst, i * (on + gap))
    out = bandpass(out, 900, 9000) + out * 0.25
    out = room(out, wet=0.18)
    return out / np.max(np.abs(out))


def key():
    """A rubber keypad key and the meter's short confirmation beep."""
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    dome = bandpass(rng.standard_normal(n), 1200, 4200) * np.exp(-t / 0.006) * 0.5 + tone(210, 0.16, 0.012) * 0.4
    out = dome.copy()
    m = int(0.045 * SR)
    tt = np.arange(m) / SR
    tip = sum(np.sin(2 * np.pi * 2400 * h * tt) / h for h in (1, 3)) * env(m, 0.002, 0.01) * 0.55
    place(out, tip, 0.008)
    return out / np.max(np.abs(out))


def clack():
    """A latching relay snapping over: a hard metallic tek with a short ring and a body thump."""
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    place(out, klik(1.25) * 0.55, 0.0)
    hit = (lowpass(rng.standard_normal(n), 9000) - lowpass(rng.standard_normal(n), 2500)) * np.exp(-t / 0.0028) * 1.1
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, tau, a in [(1830, 0.035, 0.35), (3120, 0.022, 0.25), (4870, 0.012, 0.15)])
    body = tone(118, 0.45, 0.03) * 0.8 + tone(64, 0.45, 0.05) * 0.4
    out += hit + ring + body
    out = room(out, wet=0.2)
    return out / np.max(np.abs(out))


def roomtone(dur):
    n = int(dur * SR)
    hiss = lowpass(rng.standard_normal(n), 700) * 0.05
    return hiss * env(n, 0.4, 1.0)


def whoosh(dur=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    cutoff = 300 + 3200 * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return lowpass(rng.standard_normal(n), cutoff) * shape * 1.6


def hum(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    wave = 0.6 * np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 200 * t) + 0.12 * np.sin(2 * np.pi * 300 * t)
    return wave * env(n, 0.8, 0.5)


def boil(dur):
    n = int(dur * SR)
    out = np.zeros(n)
    t_now = 0.0
    while t_now < dur:
        density = 8 + 40 * min(1.0, t_now / 2.5)
        t_now += rng.exponential(1 / density)
        f0 = rng.uniform(220, 620)
        d = rng.uniform(0.018, 0.05)
        tt = np.arange(int(d * SR)) / SR
        plop = np.sin(2 * np.pi * (f0 * tt + 0.5 * f0 * 1.4 * tt * tt / d)) * np.exp(-tt / (d / 3)) * rng.uniform(0.2, 0.9)
        place(out, plop, t_now)
    sizzle = lowpass(rng.standard_normal(n), 1000) * 0.06
    return (lowpass(out, 2200) * 0.8 + sizzle) * env(n, 0.8, 0.6)


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    rise = (t / dur) ** 2.2
    freq = 140 + 340 * (t / dur) ** 1.6
    sweep = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.35
    air = lowpass(rng.standard_normal(n), 500 + 1100 * t / dur) * 0.5
    return (sweep + air) * rise * env(n, 0.05, 0.03)


def impact():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    freq = 58 * np.exp(-t / 0.6) + 34
    boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.32)
    dust = lowpass(rng.standard_normal(n), 500) * np.exp(-t / 0.08) * 0.6
    return boom + dust


def hiss(dur=0.8):
    # Steam escaping a valve: bright noise (2-9 kHz) with a hard attack, a flutter and a long tail.
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    air = lowpass(noise - lowpass(noise, 2200), 9000)
    flutter = 1 + 0.18 * np.sin(2 * np.pi * 23 * t) * np.sin(2 * np.pi * 7 * t + 1.1)
    shape = np.clip(t / 0.012, 0, 1) * np.clip((dur - t) / max(0.25, dur * 0.4), 0, 1) ** 1.4
    return air * flutter * shape * 1.4


def rattle(dur=1.2, rate=8.0):
    # A pressure weight chattering on its vent pipe: small metal ticks at about rate per second over a hiss.
    n = int(dur * SR)
    out = np.zeros(n)
    t_now = 0.0
    while t_now < dur:
        t_now += (1 / rate) * rng.uniform(0.7, 1.3)
        f0 = rng.uniform(2600, 4200)
        tt = np.arange(int(0.02 * SR)) / SR
        tick = (np.sin(2 * np.pi * f0 * tt) + 0.5 * np.sin(2 * np.pi * f0 * 1.51 * tt)) * np.exp(-tt / 0.004) * rng.uniform(0.5, 1.0)
        place(out, tick, t_now)
    return out * env(n, 0.05, 0.2) + hiss(dur) * 0.35


def blub(size=1.0, pitch=1.0, bass=0.0):
    """Air gulping into an upside-down bottle (a galon on a dispenser): a hollow, damped "bloop" that glides up as the
    bubble leaves the neck (a Minnaert-style ring, about 190 Hz for a 30 mL bubble), a soft knock from the water column
    and a little splash, rung in the bottle's air pocket. bass (0-1) adds the big gulp's weight: the ring driven into
    lopsided saturation (its 2nd and 3rd harmonics, 250-700 Hz, are what a phone speaker plays: on its own the low
    body sat 96 % under 300 Hz and read as thin), plus a low body gliding up from about 105 Hz and a sub thump for
    earphones."""
    dur = 0.32 + 0.2 * bass
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = 190.0 * pitch / size ** (1 / 3)
    f = f0 * (1 + 0.75 * (1 - np.exp(-t / 0.035)))
    ring = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.075 + 0.04 * bass))
    over = np.sin(2 * np.pi * np.cumsum(f * 2.4) / SR + 0.7) * np.exp(-t / 0.03) * 0.35
    knock = np.sin(2 * np.pi * 68 * t) * np.exp(-t / 0.045) * 0.55
    splash = bandpass(rng.standard_normal(n), 500, 2600) * np.exp(-t / 0.025) * 0.12
    x = ring + over + knock + splash
    if bass:
        crunch = (np.tanh(2.8 * ring + 0.4) - np.tanh(0.4)) * 0.7
        fb = 105.0 * pitch / size ** (1 / 3) * (1 + 0.55 * (1 - np.exp(-t / 0.05)))
        body = np.tanh(2.4 * np.sin(2 * np.pi * np.cumsum(fb) / SR)) * np.exp(-t / 0.12) * 0.4
        thump = np.sin(2 * np.pi * np.cumsum(48 + 40 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.07) * 0.3
        x = x + (crunch + body + thump) * bass
        # soft-clip the big gulp: dense rather than spiky, so it reads loud without eating the mix's peak headroom
        x = np.tanh(1.6 * x) / np.tanh(1.6) * (1 - 0.35 * bass) + x * 0.35 * bass * 0.5
    x = x * np.clip(t / 0.003, 0, 1)
    return room(lowpass(x, 3200), wet=0.4)


def plip(pitch=1.0):
    """A bubble breaking the water's surface at the top of the galon: a tiny high plip."""
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f = 620.0 * pitch * (1 + 0.5 * (1 - np.exp(-t / 0.012)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.022) * np.clip(t / 0.002, 0, 1)


def pour(dur=4.0, start=0.0, end=0.75, height=0.1):
    """Water poured into a glass: splashy noise plus the glass's air column ringing, its pitch rising as the glass
    fills (a quarter-wave tube: f = c / 4L, L from (1 - start) to (1 - end) of the glass's height in m)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = np.clip(t / dur, 0, 1)
    air = np.maximum(height * (1 - (start + (end - start) * u)), 0.012)
    freq = 343.0 / (4 * air)
    w = 2 * np.pi * freq / SR
    r = np.exp(-np.pi * (freq / 7.0) / SR)
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    y1 = y2 = 0.0
    c1 = 2 * r * np.cos(w)
    c2 = r * r
    for i in range(n):
        y0 = noise[i] * (1 - r[i]) + c1[i] * y1 - c2[i] * y2
        y[i] = y0
        y2, y1 = y1, y0
    splash = lowpass(noise - lowpass(noise, 300), 5200) * 0.16
    flutter = 1 + 0.25 * np.sin(2 * np.pi * 9 * t) * np.sin(2 * np.pi * 3.1 * t + 0.4)
    shape = np.clip(t / 0.04, 0, 1) * np.clip((dur - t) / 0.12, 0, 1)
    out = (y * 2.2 + splash) * flutter * shape
    return out / (np.max(np.abs(out)) or 1) * 0.8


def sizzle(dur=2.0):
    # Frying (the teflon film's eggs): fine crackle of oil spitting round the egg's edge over a soft hiss.
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    bed = lowpass(noise - lowpass(noise, 1800), 9000) * 0.25
    crackle = np.zeros(n)
    for _ in range(int(dur * 140)):
        m = int(rng.uniform(0.0015, 0.006) * SR)
        tt = np.arange(m) / SR
        burst = rng.standard_normal(m) * np.exp(-tt / rng.uniform(0.0006, 0.002)) * rng.uniform(0.2, 1.0) ** 2
        place(crackle, burst, rng.uniform(0, dur))
    crackle = crackle - lowpass(crackle, 1200)
    flutter = 1 + 0.2 * np.sin(2 * np.pi * 3.3 * t) * np.sin(2 * np.pi * 0.7 * t + 0.5)
    shape = np.clip(t / 0.15, 0, 1) * np.clip((dur - t) / 0.3, 0, 1)
    out = (bed + crackle * 0.9) * flutter * shape
    return out / (np.max(np.abs(out)) or 1) * 0.7


def scrape(dur=0.45):
    # A steel spatula dragged on a pan: gritty band-passed noise chattering (stick-slip) under a wandering squeal.
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    grit = bandpass(noise, 1500, 7000)
    chatter = 1 + 0.6 * np.sign(np.sin(2 * np.pi * (38 + 14 * np.sin(2 * np.pi * 3 * t)) * t))
    f = 2400 + 900 * np.sin(2 * np.pi * 2.2 * t)
    squeal = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    shape = np.clip(t / 0.02, 0, 1) * np.clip((dur - t) / 0.08, 0, 1)
    out = (grit * chatter * 0.8 + squeal) * shape
    return out / (np.max(np.abs(out)) or 1) * 0.85


def slide(dur=0.5):
    # Something gliding over a smooth pan ("srrrt"): a soft band-passed swish that swells and fades.
    n = int(dur * SR)
    t = np.arange(n) / SR
    swish = bandpass(rng.standard_normal(n), 600, 4000)
    return swish * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5 * 0.6


def thunk():
    # A metal lid dropping onto its rubber seal: a short low knock with an aluminium ring.
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 165 * t) * np.exp(-t / 0.09)
    ring = (0.35 * np.sin(2 * np.pi * 920 * t) + 0.22 * np.sin(2 * np.pi * 1460 * t + 0.4) + 0.12 * np.sin(2 * np.pi * 2310 * t)) * np.exp(-t / 0.16)
    knock = lowpass(rng.standard_normal(n), 1800) * np.exp(-t / 0.012) * 0.7
    return room(body + ring + knock, 0.3)


def clink(pitch=1.0):
    # Ice against glass or steel: a short glassy tink of inharmonic partials over a tiny click.
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f0 = 2150.0 * pitch
    ring = sum(a * np.sin(2 * np.pi * f0 * r * t + ph) * np.exp(-t / tau) for r, tau, a, ph in [(1.0, 0.13, 0.55, 0.0), (2.32, 0.07, 0.32, 0.7), (4.25, 0.04, 0.2, 1.3), (6.63, 0.025, 0.12, 2.1)])
    click = bandpass(rng.standard_normal(n), 3000, 9000) * np.exp(-t / 0.0015) * 0.5
    out = (ring + click) * np.clip(t / 0.0008, 0, 1)
    out = room(out, 0.25)
    return out / (np.max(np.abs(out)) or 1)


def thread(dur=0.7, rate=34.0):
    # A screw cap turning on its thread: fine ratcheting ticks over a soft dry swish, swelling with the turn.
    n = int(dur * SR)
    t = np.arange(n) / SR
    swish = bandpass(rng.standard_normal(n), 900, 5200) * 0.22
    ticks = np.zeros(n)
    k = 0.0
    while k < dur - 0.02:
        tick = bandpass(rng.standard_normal(int(0.012 * SR)), 1800, 7000) * np.exp(-np.arange(int(0.012 * SR)) / SR / 0.0022)
        place(ticks, tick, k, 0.55 + 0.25 * rng.random())
        k += (1.0 / rate) * (0.85 + 0.3 * rng.random())
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7
    out = (swish + ticks) * shape
    return out / (np.max(np.abs(out)) or 1) * 0.9


def pop(pitch=1.0):
    # A soft suction pop (a seal letting go, a chip popping in): a quick downward chirp with a breath of noise.
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    f = (300 + 700 * np.exp(-t / 0.012)) * pitch
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)
    air = bandpass(rng.standard_normal(n), 900, 4000) * np.exp(-t / 0.006) * 0.35
    out = (body + air) * np.clip(t / 0.001, 0, 1)
    return out / (np.max(np.abs(out)) or 1)


def crunch(size=1.0):
    # Biting through something crisp (a kerupuk, a chip): a hard broadband crack over a short woody knock and a sub
    # thump (the bite felt through the jaw), then a dense train of tiny fractures that thins out over a quarter
    # second, and a soft gritty crumble. size scales the number of fractures and lowers the knock.
    dur = 0.5
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    crack = (noise - lowpass(noise, 1500)) * np.exp(-t / 0.004)
    knock = np.sin(2 * np.pi * np.cumsum(170 * size ** -0.3 + 140 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.035) * 0.8
    sub = np.sin(2 * np.pi * 62 * t) * np.exp(-t / 0.07) * 0.55
    fract = np.zeros(n)
    for _ in range(int(80 * size)):
        at = 0.004 + 0.3 * rng.random() ** 2.2
        m = int(rng.uniform(0.0004, 0.0025) * SR)
        tt = np.arange(m) / SR
        burst = rng.standard_normal(m) * np.exp(-tt / rng.uniform(0.0002, 0.0012))
        place(fract, burst, at, max(0.0, 1 - at / 0.32) ** 1.5 * rng.uniform(0.25, 1.0))
    fract = fract - lowpass(fract, 1500)
    grit = bandpass(rng.standard_normal(n), 2000, 9000) * np.exp(-t / 0.08) * 0.12
    out = crack + knock + sub + fract * 0.9 + grit
    out = room(out, 0.18)
    return out / (np.max(np.abs(out)) or 1)

def glasscrack(size=1.0):
    # A drinking glass cracking from heat (thermal shock), not shattering: a sharp tick as the crack starts, a fast
    # zip of tiny ticks over about 90 ms as it runs round the glass (denser, then stopping), the glass ringing short
    # and dull (a cracked glass rings badly), a knock in the 250-600 Hz band (what a phone speaker plays as "weight")
    # and a few late settling ticks. size lengthens the run and deepens the knock.
    # Alone it reads dull (agy: 3/10 as a glass crack). Layered at about 0.45 under crunch (size 0.5, gain 0.9), clink
    # (pitch 0.7, 0.5) and impact (0.5) it scored 9/10, weight on a phone 6/10, against 3-8/10 for the layers without it.
    dur = 0.6
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    tick = (noise - lowpass(noise, 2500)) * np.exp(-t / 0.0018) * 1.1
    run = np.zeros(n)
    span = 0.09 * size
    for _ in range(int(55 * size)):
        at = 0.003 + span * rng.random() ** 0.8
        m = int(rng.uniform(0.0003, 0.0016) * SR)
        tt = np.arange(m) / SR
        burst = rng.standard_normal(m) * np.exp(-tt / rng.uniform(0.00015, 0.0007))
        place(run, burst, at, (0.45 + 0.55 * at / span) * rng.uniform(0.3, 1.0))
    run = bandpass(run, 2200, 11000)
    f0 = 1250.0 / size ** 0.15
    ring = sum(a * np.sin(2 * np.pi * f0 * r * t + ph) * np.exp(-t / tau) for r, tau, a, ph in [(1.0, 0.06, 0.4, 0.0), (2.41, 0.035, 0.3, 0.9), (3.87, 0.022, 0.22, 1.7), (5.6, 0.014, 0.15, 2.6)])
    body = 330.0 / size ** 0.3
    knock = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(body + 260 * np.exp(-t / 0.006)) / SR)) * np.exp(-t / 0.03) * 0.75
    late = np.zeros(n)
    for _ in range(int(6 * size)):
        at = 0.15 + 0.35 * rng.random()
        m = int(0.001 * SR)
        place(late, rng.standard_normal(m) * np.exp(-np.arange(m) / SR / 0.0003), at, rng.uniform(0.08, 0.25))
    late = bandpass(late, 2500, 9000)
    out = tick + run * 0.85 + ring * 0.5 + knock + late
    out = room(out, 0.2)
    return out / (np.max(np.abs(out)) or 1)

def fftconv(x, k):
    n = len(x) + len(k) - 1
    size = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(k, size), size)[: len(x)]


def engine(ev):
    """A single-cylinder four-stroke scooter following a revs curve: ev["curve"] rows are
    [t, rpm, throttle 0..1, km/h, level]. Each firing (every second turn, rpm/120 per second) is an exhaust
    bark: a short burst ringing at the pipe's resonances, louder and brighter under throttle, with a little
    cycle-to-cycle scatter. Under it a harmonic body; over it intake breath and the final drive's whine,
    which rises with road speed."""
    curve = np.array(ev["curve"], dtype=float)
    n = int((ev["until"] - ev["t"]) * SR)
    tt = ev["t"] + np.arange(n) / SR
    rpm = np.interp(tt, curve[:, 0], curve[:, 1])
    load = np.interp(tt, curve[:, 0], curve[:, 2])
    kmh = np.interp(tt, curve[:, 0], curve[:, 3])
    level = np.interp(tt, curve[:, 0], curve[:, 4]) if curve.shape[1] > 4 else np.ones(n)
    f0 = rpm / 120.0
    cycles = np.cumsum(f0) / SR
    fire = np.nonzero(np.diff(np.floor(cycles)) > 0)[0] + 1
    train = np.zeros(n)
    scatter = 1 + 0.14 * rng.standard_normal(len(fire))
    train[fire] = (0.55 + 0.6 * load[fire]) * scatter
    m = int(0.04 * SR)
    tk = np.arange(m) / SR
    bark = (np.sin(2 * np.pi * 165 * tk) * np.exp(-tk / 0.0075) + 0.75 * np.sin(2 * np.pi * 410 * tk + 0.6) * np.exp(-tk / 0.0045)
            + 0.45 * np.sin(2 * np.pi * 930 * tk + 1.1) * np.exp(-tk / 0.0028) + 0.35 * rng.standard_normal(m) * np.exp(-tk / 0.0018))
    barks = fftconv(train, bark)
    barks /= np.max(np.abs(barks)) + 1e-9
    phase = 2 * np.pi * cycles
    body = np.zeros(n)
    for k in range(1, 30):
        fk = k * f0
        body += (1.0 / k) * np.exp(-k / (5 + 18 * load)) * np.clip((7000 - fk) / 1500, 0, 1) * np.sin(k * phase + 0.9 * k)
    body /= np.max(np.abs(body)) + 1e-9
    pulse = 0.5 + 0.5 * np.cos(phase)
    breath = bandpass(rng.standard_normal(n), 250, 2600) * (0.2 + 0.8 * load) * pulse ** 2
    breath /= np.max(np.abs(breath)) + 1e-9
    shaft = (kmh / 3.6) / 0.2588 / (2 * np.pi) * 10.625
    whine = np.sin(2 * np.pi * np.cumsum(shaft * 17) / SR) * np.clip(kmh / 25, 0, 1) * 0.06
    out = barks * 0.8 + body * 0.3 + breath * 0.16 + whine
    # phones play nothing under ~150 Hz: keep the rumble out of the loudness budget
    out = out - lowpass(out, 140)
    return out * level * env(n, 0.04, 0.25)


def groove(start, stop, drop_from, drop_to, bpm=96):
    out = np.zeros(N)
    step = 60 / bpm
    kick_n = int(0.22 * SR)
    kt = np.arange(kick_n) / SR
    kick = np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-kt / 0.03)) / SR) * np.exp(-kt / 0.11)
    hat_n = int(0.05 * SR)
    hat = np.diff(rng.standard_normal(hat_n), prepend=0) * np.exp(-np.arange(hat_n) / SR / 0.01) * 0.25
    t = start
    i = 0
    while t < stop:
        if not (drop_from <= t < drop_to):
            if i % 2 == 0:
                place(out, kick, t, 0.55)
            place(out, hat, t + step / 2, 0.5)
        t += step / 2 if False else step
        i += 1
    return lowpass(out, 5000)


def arp(start, stop, bpm=96):
    """A plucked eighth-note arpeggio over the pad's chords: it keeps the bed audible on phone speakers."""
    out = np.zeros(N)
    step = 60 / bpm / 2
    chords = [[110.0, 164.81, 220.0, 277.18], [98.0, 146.83, 196.0, 246.94], [87.31, 130.81, 174.61, 220.0], [98.0, 146.83, 196.0, 246.94]]
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    t, i = start, 0
    while t < stop:
        f = chords[int(t // 4.0) % 4][pattern[i % 8]] * 2
        note = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt / 0.1) * np.clip(tt / 0.003, 0, 1)
        place(out, note, t, 0.5 if i % 2 == 0 else 0.38)
        t += step
        i += 1
    return out


def bright(start, stop, bpm=96):
    """The part of the bed a phone speaker plays: a marimba-like pluck two octaves over the pad's chords on a
    syncopated sixteenth pattern (one bar), and a soft shaker on the sixteenths, accented off the beat."""
    out = np.zeros(N)
    step = 60 / bpm / 4
    chords = [[110.0, 164.81, 220.0, 277.18], [98.0, 146.83, 196.0, 246.94], [87.31, 130.81, 174.61, 220.0], [98.0, 146.83, 196.0, 246.94]]
    pattern = {0: 2, 3: 3, 6: 1, 8: 2, 10: 3, 13: 1, 14: 2}
    n = int(0.4 * SR)
    tt = np.arange(n) / SR
    m = int(0.045 * SR)
    shake_env = np.exp(-np.arange(m) / SR / 0.012)
    t, i = start, 0
    while t < stop:
        k = i % 16
        if k in pattern:
            f = chords[int(t // 4.0) % 4][pattern[k]] * 4
            note = (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.17) + 0.22 * np.sin(2 * np.pi * f * 3.93 * tt) * np.exp(-tt / 0.03)
                    + 0.08 * np.sin(2 * np.pi * f * 9.2 * tt) * np.exp(-tt / 0.008)) * np.clip(tt / 0.002, 0, 1)
            place(out, note, t, 0.5 if k in (0, 8) else 0.36)
        place(out, bandpass(rng.standard_normal(m), 5000, 11000) * shake_env, t, 0.09 if k % 4 == 2 else 0.04)
        t += step
        i += 1
    return out


def pad():
    t = np.arange(N) / SR
    chords = [[110.0, 164.81, 220.0, 277.18], [98.0, 146.83, 196.0, 246.94], [87.31, 130.81, 174.61, 220.0], [98.0, 146.83, 196.0, 246.94]]
    bar = 4.0
    out = np.zeros(N)
    for i, chord in enumerate(chords * 4):
        start = i * bar
        if start > T["duration"]:
            break
        seg = (t >= start - 0.6) & (t < start + bar + 0.6)
        local = t[seg] - start
        shape = np.clip((local + 0.6) / 1.2, 0, 1) * np.clip((bar + 0.6 - local) / 1.2, 0, 1)
        for j, f in enumerate(chord):
            out[seg] += np.sin(2 * np.pi * f * t[seg] + j) * shape * (0.22 if j == 0 else 0.14) * (1 + 0.15 * np.sin(2 * np.pi * 0.23 * t[seg] + j))
    return lowpass(out, 1400)


voice = np.zeros(N)
if T.get("narration"):
    place(voice, load(ROOT / T["narration"]["file"]), T["narration"]["at"])
else:
    for beat in T["beats"]:
        place(voice, load(ROOT / beat["file"]), beat["at"])
fx = np.zeros(N)
MAKERS = {
    "klik": lambda ev: klik(ev.get("pitch", 1.0)), "press": lambda ev: press(), "snap": lambda ev: snap(), "relay": lambda ev: relay(),
    "whoosh": lambda ev: whoosh(ev.get("dur", 1.0)), "impact": lambda ev: impact(), "arc": lambda ev: arc(ev.get("dur", 0.35)),
    "hum": lambda ev: hum(ev["until"] - ev["t"]), "buzz": lambda ev: buzz(ev["until"] - ev["t"]), "boil": lambda ev: boil(ev["until"] - ev["t"]),
    "riser": lambda ev: riser(ev["until"] - ev["t"]), "room": lambda ev: roomtone(ev["until"] - ev["t"]),
    "powerdown": lambda ev: powerdown(ev.get("dur", 1.0)), "powerup": lambda ev: powerup(ev.get("dur", 0.7)), "jeglek": lambda ev: jeglek(),
    "zap": lambda ev: zap(ev.get("dur", 0.5)), "drop": lambda ev: drop(ev.get("dur", 0.6)),
    "hiss": lambda ev: hiss(ev.get("dur", 0.8)), "rattle": lambda ev: rattle(ev.get("dur", 1.2), ev.get("rate", 8.0)), "thunk": lambda ev: thunk(),
    "engine": engine,
    "beep": lambda ev: beep(ev.get("count", 3), ev.get("on", 0.07), ev.get("gap", 0.1), ev.get("freq", 2730.0)),
    "key": lambda ev: key(), "clack": lambda ev: clack(),
    "blub": lambda ev: blub(ev.get("size", 1.0), ev.get("pitch", 1.0), ev.get("bass", 0.0)), "plip": lambda ev: plip(ev.get("pitch", 1.0)),
    "pour": lambda ev: pour(ev["until"] - ev["t"], ev.get("start", 0.0), ev.get("end", 0.75), ev.get("height", 0.1)),
    "sizzle": lambda ev: sizzle(ev.get("dur", 2.0)), "scrape": lambda ev: scrape(ev.get("dur", 0.45)), "slide": lambda ev: slide(ev.get("dur", 0.5)),
    "clink": lambda ev: clink(ev.get("pitch", 1.0)), "thread": lambda ev: thread(ev.get("dur", 0.7), ev.get("rate", 34.0)), "pop": lambda ev: pop(ev.get("pitch", 1.0)),
    "crunch": lambda ev: crunch(ev.get("size", 1.0)),
    "glasscrack": lambda ev: glasscrack(ev.get("size", 1.0)),
}
for ev in T["sfx"]:
    if ev["kind"] not in MAKERS:
        raise SystemExit(f"unknown sound kind {ev['kind']}; known: {', '.join(MAKERS)}")
    place(fx, MAKERS[ev["kind"]](ev), ev["t"], ev["gain"])

voice_env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
beds = T["beats"]
B = {"pad": 0.38, "groove": 0.32, "arp": 0.0, "bright": 0.0, "duck": 0.5, "fadeIn": 1.5, "from": beds[min(2, len(beds) - 1)]["at"], "to": T["duration"] - 0.6, "dropFrom": -1, "dropTo": -1, "bpm": 96, **T.get("bed", {})}
duck = 1 - B["duck"] * np.clip(voice_env / (np.percentile(voice_env[voice_env > 1e-4], 60) + 1e-9), 0, 1)
bed = pad() * B["pad"] + groove(B["from"], B["to"], B["dropFrom"], B["dropTo"], B["bpm"]) * B["groove"]
if B["arp"]:
    arps = arp(B["from"], B["to"], B["bpm"])
    if B["dropFrom"] >= 0:
        t_axis = np.arange(N) / SR
        arps *= 1 - ((t_axis >= B["dropFrom"]) & (t_axis < B["dropTo"]))
    bed = bed + arps * B["arp"]
if B["bright"]:
    lift = bright(B["from"], B["to"], B["bpm"])
    if B["dropFrom"] >= 0:
        t_axis = np.arange(N) / SR
        lift *= 1 - ((t_axis >= B["dropFrom"]) & (t_axis < B["dropTo"]))
    bed = bed + lift * B["bright"]
bed *= duck
bed *= np.clip(np.arange(N) / SR / max(B["fadeIn"], 1e-3), 0, 1) * np.clip((T["duration"] + 0.3 - np.arange(N) / SR) / 1.2, 0, 1)


def write(name, signal):
    peak = np.max(np.abs(signal)) or 1
    stereo = np.stack([signal, signal], axis=1) / peak * 0.89
    raw = HERE / f"{name}.f32"
    stereo.astype(np.float32).tofile(raw)
    out = HERE / f"{name}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), str(out)], check=True)
    raw.unlink()
    print("wrote", out)


write("audio", voice + fx * 0.55 + bed)
write("audio-nomusic", voice + fx * 0.55)
