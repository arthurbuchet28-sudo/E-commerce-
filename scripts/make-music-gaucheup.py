"""
Musique originale de la vidéo d'annonce Gauche'Up (15 s), entièrement synthétisée (numpy + scipy, aucun sample).

Funky house joyeuse, ≈128,6 BPM (1 temps = 28 frames à 60 fps), la mineur (Am7 – Dm7 – G – Cmaj7).

Repères (secondes) — IDENTIQUES à src/gaucheup/config.ts (1 temps = 28/60 s) :
  0,00  accroche « Ça penche… » : basse + kick filtrés
  0,47  « à gauche. » : sifflet à coulisse qui descend (l'image penche)
  1,40  LOGO : impact, le groove part en entier
  2,80 → 9,80  5 t-shirts (1,40 s chacun) : whoosh à chaque poussée vers la gauche,
        « pop » à chaque changement de couleur (sur les temps)
  9,80  mosaïque, riser vers l'écran de fin
  11,20 ÉCRAN DE FIN : impact, puis un carillon qui monte à chaque changement de texture du logo
  14,7  accord final, fondu sur les 0,3 dernières secondes
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
FPS = 60
BEAT = 28 / FPS  # 0,4667 s
DUR = 15.0
HALF = 7 / FPS  # demi-durée des poussées (raccords)

# Débuts de scène (s), en temps : hook 3, logo 3, 5 × t-shirt 3, mosaïque 3, fin
HOOK, LOGO = 0.0, 3 * BEAT
TEES = [LOGO + 3 * BEAT + k * 3 * BEAT for k in range(5)]
MOSAIC = TEES[-1] + 3 * BEAT
END = MOSAIC + 3 * BEAT
CUTS = [LOGO] + TEES + [MOSAIC, END]

rng = np.random.default_rng(23)
N = int(SR * DUR)
t = np.arange(N) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.full(n, s, dtype=float)
    a = min(a, n)
    e[:a] = np.linspace(0, 1, a, endpoint=False)
    d = min(d, n - a)
    e[a : a + d] = np.linspace(1, s, d, endpoint=False)
    r = min(r, n)
    e[n - r :] *= np.linspace(1, 0, r)
    return e


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def place(buf, sig, start, gain=1.0):
    i = int(round(start * SR))
    if i >= len(buf) or i + len(sig) <= 0:
        return
    s0 = max(0, -i)
    i = max(0, i)
    j = min(len(buf), i + len(sig) - s0)
    buf[i:j] += sig[s0 : s0 + j - i] * gain


def ramp(lo, hi, t0, t1):
    u = np.clip((t - t0) / max(1e-6, t1 - t0), 0, 1)
    return lo + (hi - lo) * (0.5 - 0.5 * np.cos(np.pi * u))


def saw(f, tt, harm=10):
    return sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, harm + 1))


CHORDS = [[57, 60, 64, 67], [50, 53, 57, 60], [55, 59, 62, 67], [48, 52, 55, 59]]  # Am7 Dm7 G Cmaj7
ROOTS = [33, 38, 31, 36]


def chord_idx(time):
    return int(time // (4 * BEAT)) % 4


# ───────────── batterie ─────────────
def kick():
    n = int(0.38 * SR)
    tt = np.arange(n) / SR
    f = 48 + 120 * np.exp(-tt * 34)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 8) + filt(rng.standard_normal(n), "high", 3500) * np.exp(-tt * 300) * 0.1


def clap():
    n = int(0.28 * SR)
    tt = np.arange(n) / SR
    noise = filt(rng.standard_normal(n), "band", [1000, 6000])
    env = np.exp(-tt * 20) + 0.6 * (tt > 0.011) * np.exp(-np.maximum(0, tt - 0.011) * 40) + 0.5 * (tt > 0.022) * np.exp(-np.maximum(0, tt - 0.022) * 40)
    return noise * env


def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    tt = np.arange(n) / SR
    return filt(rng.standard_normal(n), "high", 8500) * np.exp(-tt * (22 if open_ else 95))


drums = np.zeros(N)
duck = np.ones(N)
K, CL = kick(), clap()
full_from = LOGO
for k, b in enumerate(np.arange(0, END + 6 * BEAT, BEAT)):
    if b >= DUR - 0.35:
        break
    soft = b < full_from
    place(drums, K, b, 0.45 if soft else 0.9)
    i = int(b * SR)
    n = int(0.28 * SR)
    d = 1 - (0.35 if soft else 0.6) * np.exp(-np.arange(n) / SR * 11)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], d[: j - i])
    if not soft:
        place(drums, hat(True), b + BEAT / 2, 0.2)
        place(drums, hat(), b + BEAT / 4, 0.1)
        place(drums, hat(), b + 3 * BEAT / 4, 0.1)
        if k % 2 == 1:
            place(drums, CL, b, 0.38)

# ───────────── basse funky (octaves) ─────────────
bass = np.zeros(N)
for k, st in enumerate(np.arange(0, DUR - 0.4, BEAT / 2)):
    root = ROOTS[chord_idx(st)]
    m = root + (12 if k % 2 else 0)
    n = int(BEAT / 2 * 0.8 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * tt) + 0.45 * saw(f, tt, 5) * 0.5
    place(bass, s * adsr(n, 0.004, 0.08, 0.5, 0.03), st)
bass = filt(bass, "low", 1100) * 0.2
bass *= ramp(0.55, 1, LOGO - 0.05, LOGO)

# ───────────── accords « stabs » (sur les contretemps) ─────────────
stabs = np.zeros(N)
for st in np.arange(LOGO + BEAT / 2, DUR - 0.5, BEAT):
    n = int(0.16 * SR)
    tt = np.arange(n) / SR
    sig = sum(saw(midi(m + 12), tt, 6) for m in CHORDS[chord_idx(st)])
    place(stabs, filt(sig, "low", 3200) * np.exp(-tt * 18), st)
stabs *= 0.011

# ───────────── nappe de fond ─────────────
pad = np.zeros(N)
for b in range(int(DUR / (4 * BEAT)) + 1):
    n = int((4 * BEAT + 0.8) * SR)
    tt = np.arange(n) / SR
    sig = sum(saw(midi(m) * 2 ** (det / 12), tt, 5) for m in CHORDS[b % 4] for det in (-0.08, 0.08))
    place(pad, sig * adsr(n, 0.2, 0.2, 0.8, 0.7), b * 4 * BEAT)
pad = filt(pad, "low", 1500) * 0.006

# ───────────── sound design ─────────────
fx = np.zeros(N)


def whoosh(at, length=0.32, gain=0.07):
    n = int(length * SR)
    tt = np.arange(n) / SR
    u = tt / length
    noise = rng.standard_normal(n)
    sig = (filt(noise, "band", [250, 1800]) * (1 - u) + filt(noise, "band", [1800, 9000]) * u) * np.sin(np.pi * u) ** 1.3
    place(fx, sig, at - length / 2, gain)


def boom(at, gain=0.5):
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    place(fx, np.sin(2 * np.pi * (38 + 55 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 3), at, gain)
    place(fx, filt(rng.standard_normal(n), "band", [800, 9000]) * np.exp(-tt * 5), at, gain * 0.12)


def bubble(at, f0=600, gain=0.08):
    """« pop » de bulle : sinus qui monte très vite."""
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    f = f0 * (1 + 2.2 * (tt / tt[-1]) ** 0.6)
    place(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 40), at, gain)


def chime(at, m, gain=0.05):
    n = int(1.1 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    place(fx, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3.5), at, gain)


# sifflet à coulisse sur « à gauche » (l'image penche)
n = int(0.55 * SR)
tt = np.arange(n) / SR
u = tt / tt[-1]
f = 1500 * 2 ** (-1.6 * u**1.4) * (1 + 0.012 * np.sin(2 * np.pi * 6 * tt))
place(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.clip(u * 1.2, 0, 1)) * 0.9, BEAT + 0.05, 0.06)
bubble(0.0, 500, 0.06)
bubble(BEAT, 700, 0.07)
# logo
boom(LOGO + 2 / FPS, 0.6)
# raccords : whoosh vers la gauche
for c in CUTS[1:]:
    whoosh(c)
# t-shirts : un pop par changement de couleur
for k, s in enumerate(TEES):
    for j in (1, 2):
        bubble(s + j * BEAT, 650 + 90 * j + 40 * k, 0.075)
# mosaïque → riser
n = int((END - MOSAIC) * SR)
tt = np.arange(n) / SR
u = tt / tt[-1]
noise = rng.standard_normal(n)
place(fx, (filt(noise, "band", [400, 2500]) * (1 - u) + filt(noise, "band", [2500, 9000]) * u) * u**2, MOSAIC, 0.05)
boom(END, 0.55)
# écran de fin : un carillon qui monte à chaque nouvelle texture
scale = [69, 72, 76, 79, 81, 84, 88, 93]
for k in range(8):
    chime(END + k * BEAT, scale[k], 0.05 if k < 7 else 0.07)
    if k:
        bubble(END + k * BEAT, 900 + k * 60, 0.05)
# accord final
fin = np.zeros(int(1.0 * SR))
tt = np.arange(len(fin)) / SR
for m in (45, 57, 60, 64, 67, 72):
    fin += saw(midi(m), tt, 5)
place(fx, filt(fin, "low", 3000) * adsr(len(fin), 0.01, 0.3, 0.6, 0.6), END + 7 * BEAT, 0.012)

# ───────────── mixage ─────────────
mix = drums * 0.36 + bass * duck + stabs * duck**0.5 + pad * duck**0.5 + fx
L = mix.copy()
R = mix.copy()
d = int(BEAT * 0.75 * SR)
R[d:] += 0.25 * stabs[:-d]
L[d:] += 0.1 * stabs[:-d]
ir_n = int(1.8 * SR)
ir_t = np.arange(ir_n) / SR
for ch, seed in ((L, 1), (R, 2)):
    ir = filt(np.random.default_rng(seed).standard_normal(ir_n), "low", 7000) * np.exp(-ir_t * 3.2)
    ir /= np.sqrt(np.sum(ir**2))
    ch += 0.22 * fftconvolve(filt(stabs + pad + fx * 0.7, "high", 300), ir)[:N]

env = ramp(1, 0, DUR - 0.3, DUR) * ramp(0, 1, 0, 0.005)
st = np.stack([L * env, R * env], axis=1)
DRIVE = float(sys.argv[2]) if len(sys.argv) > 2 else 1.75  # ≈ -14 LUFS, pic à -1 dBFS
st = np.tanh(st * DRIVE / np.max(np.abs(st))) / np.tanh(DRIVE)
st *= 10 ** (-1 / 20) / np.max(np.abs(st))

out = sys.argv[1] if len(sys.argv) > 1 else "public/gaucheup/gaucheup-music.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print(f"{out} : {DUR} s, {SR} Hz, stéréo")
