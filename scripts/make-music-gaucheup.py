"""
Musique originale de la vidéo d'annonce Gauche'Up (15 s), entièrement synthétisée (numpy + scipy, aucun sample).

Amapiano / afro house (son urbain « new vibe ») à ≈128,6 BPM (1 temps = 28 frames à 60 fps) :
log drum mélodique, shakers, rim shots syncopés, piano électrique jazzy (Dm9 – G13 – Cmaj9 – Am9), flûte.

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


# Progression jazzy, chaude (ii-V-I-vi) : Dm9 – G13 – Cmaj9 – Am9
CHORDS = [[50, 53, 57, 60, 64], [53, 57, 59, 64, 67], [48, 52, 55, 59, 62], [45, 48, 52, 55, 59]]
ROOTS = [38, 31, 36, 33]  # D2 G1 C2 A1


def chord_idx(time):
    return int(time // (4 * BEAT)) % 4


SIX = BEAT / 4  # double-croche
BAR = 4 * BEAT

# ───────────── batterie (amapiano / afro house) ─────────────
def kick():
    n = int(0.34 * SR)
    tt = np.arange(n) / SR
    f = 50 + 95 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)


def clap():
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    noise = filt(rng.standard_normal(n), "band", [1100, 7000])
    env = np.exp(-tt * 16) + 0.6 * (tt > 0.012) * np.exp(-np.maximum(0, tt - 0.012) * 35) + 0.5 * (tt > 0.025) * np.exp(-np.maximum(0, tt - 0.025) * 35)
    return noise * env


def shaker(acc):
    n = int(0.07 * SR)
    tt = np.arange(n) / SR
    return filt(rng.standard_normal(n), "band", [5000, 12000]) * (np.minimum(1, tt / 0.012)) * np.exp(-tt * (45 if acc else 70))


def rim():
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1700 * tt) * 0.6 + filt(rng.standard_normal(n), "band", [1500, 5000]) * 0.5) * np.exp(-tt * 70)


drums = np.zeros(N)
duck = np.ones(N)
K, CL = kick(), clap()
GROOVE = LOGO  # le groove part en entier sur le logo
STOP = DUR - 0.3
for k, b in enumerate(np.arange(0, STOP, BEAT)):
    full = b >= GROOVE
    place(drums, K, b, 0.85 if full else 0.35)
    i0 = int(b * SR)
    n = int(0.25 * SR)
    d = 1 - (0.55 if full else 0.25) * np.exp(-np.arange(n) / SR * 12)
    j0 = min(N, i0 + n)
    duck[i0:j0] = np.minimum(duck[i0:j0], d[: j0 - i0])
    if full and k % 2 == 1:
        place(drums, CL, b, 0.34)
# shaker en double-croches (accent sur le contretemps), présent dès le début
for k, s16 in enumerate(np.arange(0, STOP, SIX)):
    place(drums, shaker(k % 4 == 2), s16 + (0.008 if k % 2 else 0), 0.09 if k % 4 == 2 else 0.05)
# rim shots syncopés (motif typique amapiano, sur 2 mesures)
RIM = [3, 6, 11, 14, 19, 22, 27, 30]
for bar0 in np.arange(GROOVE, STOP, 2 * BAR):
    for r_ in RIM:
        place(drums, rim(), bar0 + r_ * SIX, 0.12)

# ───────────── log drum (la basse percussive mélodique de l'amapiano) ─────────────
def log_drum(m, length=0.32):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f0 = midi(m)
    f = f0 * (1 + 0.9 * np.exp(-tt * 45))  # attaque qui « tombe »
    body = np.sin(2 * np.pi * np.cumsum(f) / SR)
    body = np.tanh(body * 2.2) * 0.75 + 0.35 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * np.exp(-tt * 18)
    return body * np.exp(-tt * 7.5) * np.minimum(1, tt / 0.004)


bass = np.zeros(N)
# motif sur une mesure (en double-croches) : (position, décalage en demi-tons depuis la fondamentale, durée)
LOG = [(0, 0, 0.3), (3, 0, 0.2), (6, 7, 0.22), (8, 12, 0.18), (10, 10, 0.2), (13, 7, 0.22)]
for bar0 in np.arange(GROOVE, STOP, BAR):
    root = ROOTS[chord_idx(bar0 + 0.01)]
    for pos, semi, ln in LOG:
        place(bass, log_drum(root + 12 + semi, ln + 0.1), bar0 + pos * SIX, 1.0)
bass = filt(bass, "low", 2200) * 0.24
# avant le logo : juste une sous-basse douce
for k, b in enumerate(np.arange(0, GROOVE, 2 * BEAT)):
    n = int(2 * BEAT * SR)
    tt = np.arange(n) / SR
    place(bass, np.sin(2 * np.pi * midi(ROOTS[0]) * tt) * adsr(n, 0.02, 0.2, 0.6, 0.2) * 0.12, b)

# ───────────── piano électrique jazzy (accords sur les contretemps) ─────────────
def epiano(m, length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    mod = np.sin(2 * np.pi * f * 1.0 * tt) * 1.6 * np.exp(-tt * 6)
    return (np.sin(2 * np.pi * f * tt + mod) * 0.8 + 0.2 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 9)) * np.exp(-tt * 3.2)


keys = np.zeros(N)
CHORD_HITS = [2, 5, 10, 13]  # positions (double-croches) dans la mesure : rythme « skank » décalé
for bar0 in np.arange(0, STOP, BAR):
    notes = CHORDS[chord_idx(bar0 + 0.01)]
    for pos in CHORD_HITS:
        for m in notes:
            place(keys, epiano(m + 12, 0.55), bar0 + pos * SIX, 1.0)
keys = filt(keys, "low", 4500) * 0.008
keys *= ramp(0.7, 1, GROOVE - 0.1, GROOVE)

# ───────────── nappe aérienne ─────────────
pad = np.zeros(N)
for b in range(int(DUR / BAR) + 1):
    n = int((BAR + 0.8) * SR)
    tt = np.arange(n) / SR
    sig = sum(np.sin(2 * np.pi * midi(m + 12) * 2 ** (det / 12) * tt) for m in CHORDS[b % 4] for det in (-0.1, 0.1))
    place(pad, sig * adsr(n, 0.3, 0.2, 0.8, 0.7), b * BAR)
pad = filt(pad, "low", 2500) * 0.004

# ───────────── mélodie « flûte » (accroche, puis écran de fin) ─────────────
def flute(m, length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = midi(m) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt) * np.clip(tt * 5, 0, 1))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.12 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    breath = filt(rng.standard_normal(n), "band", [midi(m) * 1.5, midi(m) * 4]) * 0.06
    return (tone + breath) * adsr(n, 0.04, 0.1, 0.8, 0.08)


lead = np.zeros(N)
MEL = [(0, 76, 2), (2, 79, 1), (3, 81, 1), (4, 79, 2), (6, 76, 1), (7, 74, 1), (8, 76, 3), (11, 72, 1), (12, 74, 2), (14, 76, 2)]
for start in (TEES[0], END):
    for pos, m, ln in MEL:
        st = start + pos * BEAT / 2
        if st < STOP - 0.2:
            place(lead, flute(m, ln * BEAT / 2 * 0.95), st)
lead = filt(lead, "low", 5000) * 0.03

stabs = keys  # (nom utilisé par l'écho et la réverbération du mixage)

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
mix = drums * 0.42 + bass * duck + keys * duck**0.5 + pad * duck**0.5 + lead * duck**0.3 + fx
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
    ch += 0.22 * fftconvolve(filt(keys + pad + lead + fx * 0.7, "high", 300), ir)[:N]

env = ramp(1, 0, DUR - 0.3, DUR) * ramp(0, 1, 0, 0.005)
st = np.stack([L * env, R * env], axis=1)
DRIVE = float(sys.argv[2]) if len(sys.argv) > 2 else 1.45  # ≈ -14 LUFS, pic à -1 dBFS
st = np.tanh(st * DRIVE / np.max(np.abs(st))) / np.tanh(DRIVE)
st *= 10 ** (-1 / 20) / np.max(np.abs(st))

out = sys.argv[1] if len(sys.argv) > 1 else "public/gaucheup/gaucheup-music.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print(f"{out} : {DUR} s, {SR} Hz, stéréo")
