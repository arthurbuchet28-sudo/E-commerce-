"""
Musique originale de la pub Viralo (PubBoost), entièrement synthétisée (numpy + scipy, aucun sample).

Électro-pop énergique mais propre, 120 BPM, fa mineur (Fm – Db – Ab – Eb, une mesure par accord).

Repères (secondes) — IDENTIQUES à src/boost/config.ts (1 temps = 0,5 s, 1 mesure = 2 s) :
  0,0   accroche : nappe filtrée, « tic » sur chaque mot (tous les 0,25 s), coup sourd sur « 214 » (1,0 s)
  2,0   problème : pulsation sourde sur chaque temps, riser vers 4 s
  4,0   RÉVÉLATION : impact, la batterie entre (kick, basse, hats)
  6,0   solution : souffle de sortie de zoom, scan (6,5 s), « tic » sur « Analysé » (7,25 s),
        pops des recommandations (8,5 / 8,75 / 9,0 s), arpège ; riser vers 9,5 s
  9,5   le temps qui ralentit : le filtre se ferme, silence sur le dernier demi-temps (9,75 s)
  10,0  PREUVE : drop (kick, basse, lead, claps), montée de hauteur avec le compteur (10,13 → 11,85 s),
        « ding » à l'arrivée sur 1,2 M (11,85 s)
  13,83 / 15,5 / 17,0  whooshes des whip pans
  18,0  break : la batterie sort, traînées qui convergent
  19,0  LOGO : coup + accord, puis nom (20,0 s), bouton (21,0 s), accord final et réverbération
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
BPM = 120
BEAT = 60 / BPM  # 0,5 s
BAR = 4 * BEAT  # 2 s
DUR = 11 * BAR  # 22 s

# Débuts de scène (s) — même découpage que BOOST.bars (1,1,1,2,2,2,2 mesures)
HOOK, PROBLEM, REVEAL, SOLUTION, PROOF, FEATURES, CTA = [b * BAR for b in (0, 1, 2, 3, 5, 7, 9)]
FPS = 60
COUNT_START = PROOF + 8 / FPS  # le compteur démarre 8 frames après le drop
COUNT_END = PROOF + 3.7 * BEAT  # arrivée sur 1,2 M
WHIPS = [FEATURES - 10 / FPS / 2, FEATURES + 3 * BEAT, FEATURES + 6 * BEAT]
LOGO_HIT = CTA + 2 * BEAT
NAME = CTA + 4 * BEAT
BUTTON = CTA + 6 * BEAT

rng = np.random.default_rng(11)
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


def gate(t0, t1, fade=0.02):
    return ramp(0, 1, t0 - fade, t0) * (1 - ramp(0, 1, t1 - fade, t1))


def saw(f, tt, harm=10):
    return sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, harm + 1))


CHORDS = [[53, 56, 60, 63], [49, 53, 56, 60], [56, 60, 63, 67], [51, 55, 58, 63]]  # Fm7 Db Ab Eb
ROOTS = [29, 25, 32, 27]  # F1 Db1 Ab1 Eb1


def chord_idx(time):
    return int(time // BAR) % 4


# ───────────── nappe ─────────────
pad = np.zeros(N)
for b in range(11):
    n = int((BAR + 1.0) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in CHORDS[b % 4]:
        for det in (-0.1, 0.1):
            sig += saw(midi(m) * 2 ** (det / 12), tt, 6)
    place(pad, sig * adsr(n, 0.3, 0.3, 0.8, 0.9), b * BAR)
pad_dark = filt(pad, "low", 700)
pad_open = filt(pad, "low", 3500)
openness = ramp(0, 1, REVEAL - 0.5, REVEAL + 0.2) * (1 - ramp(0, 0.7, PROOF - 0.5, PROOF - 0.05)) + ramp(0, 0.7, PROOF, PROOF + 0.1)
pad = (pad_dark * (1 - openness) + pad_open * openness) * 0.012

# ───────────── batterie ─────────────
def kick(soft=False):
    n = int(0.42 * SR)
    tt = np.arange(n) / SR
    f = 46 + 110 * np.exp(-tt * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    if soft:
        return filt(body, "low", 180) * 0.7
    return body + filt(rng.standard_normal(n), "high", 3000) * np.exp(-tt * 260) * 0.12


def clap():
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    noise = filt(rng.standard_normal(n), "band", [900, 5000])
    env = np.exp(-tt * 18) + 0.6 * np.exp(-np.maximum(0, tt - 0.012) * 40) * (tt > 0.012) + 0.5 * np.exp(-np.maximum(0, tt - 0.024) * 40) * (tt > 0.024)
    return noise * env


def hat(open_=False):
    n = int((0.18 if open_ else 0.06) * SR)
    tt = np.arange(n) / SR
    return filt(rng.standard_normal(n), "high", 8000) * np.exp(-tt * (20 if open_ else 90))


drums = np.zeros(N)
duck = np.ones(N)


def add_duck(at, depth=0.6):
    i = int(at * SR)
    n = int(0.3 * SR)
    d = 1 - depth * np.exp(-np.arange(n) / SR * 10)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], d[: j - i])


K, KS, CL = kick(), kick(True), clap()
# pulsation sourde (problème)
for bt in np.arange(PROBLEM, REVEAL, BEAT):
    place(drums, KS, bt, 0.55)
# groove révélation + solution (sauf le dernier temps de la solution)
for bt in np.arange(REVEAL, PROOF - BEAT, BEAT):
    place(drums, K, bt, 0.8)
    add_duck(bt)
for bt in np.arange(REVEAL + BEAT / 2, PROOF - BEAT, BEAT):
    place(drums, hat(), bt, 0.35)
# drop : preuve + fonctionnalités
for bt in np.arange(PROOF, CTA, BEAT):
    place(drums, K, bt, 0.95)
    add_duck(bt, 0.7)
    place(drums, hat(True), bt + BEAT / 2, 0.22)
    place(drums, hat(), bt + BEAT / 4, 0.12)
    place(drums, hat(), bt + 3 * BEAT / 4, 0.12)
for bt in np.arange(PROOF + BEAT, CTA, 2 * BEAT):
    place(drums, CL, bt, 0.42)

# ───────────── basse ─────────────
bass = np.zeros(N)
for k, st in enumerate(np.arange(REVEAL, CTA, BEAT / 2)):
    if PROOF - BEAT <= st < PROOF:
        continue  # le temps qui ralentit
    m = ROOTS[chord_idx(st)] + (12 if k % 4 == 3 else 0)
    n = int(BEAT / 2 * 0.92 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) + 0.2 * saw(f * 2, tt, 4)
    place(bass, s * adsr(n, 0.003, 0.1, 0.6, 0.04), st, 1.15 if st >= PROOF else 0.9)
bass = filt(bass, "low", 900) * 0.2

# ───────────── arpège (solution) ─────────────
arp = np.zeros(N)
pat = [0, 2, 1, 3, 2, 1, 3, 2]
for k, st in enumerate(np.arange(SOLUTION, PROOF - BEAT, BEAT / 4)):
    m = CHORDS[chord_idx(st)][pat[k % 8]] + 12
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    arp_note = np.sin(2 * np.pi * f * tt + 1.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 20)) * np.exp(-tt * 12)
    place(arp, arp_note, st, 0.9 if k % 4 else 1.0)
arp = filt(arp, "low", 6000) * 0.045

# ───────────── lead (drop) ─────────────
lead = np.zeros(N)
MEL = [  # (temps depuis le drop, demi-tons midi, durée en temps)
    (0, 72, 1), (1, 75, 0.5), (1.5, 77, 0.5), (2, 79, 1), (3, 77, 1),
    (4, 75, 1), (5, 72, 0.5), (5.5, 75, 0.5), (6, 77, 1.5), (7.5, 75, 0.5),
    (8, 80, 1), (9, 79, 0.5), (9.5, 77, 0.5), (10, 75, 1), (11, 77, 1),
    (12, 79, 1), (13, 77, 0.5), (13.5, 75, 0.5), (14, 72, 2),
]
for rep in range(2):
    for b0, m, d in MEL:
        st = PROOF + (b0 + rep * 16) * BEAT
        if st >= CTA:
            continue
        n = int(d * BEAT * SR)
        tt = np.arange(n) / SR
        f = midi(m)
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt) * np.clip(tt * 4, 0, 1)
        s = saw(f * vib, tt, 8) * 0.6 + saw(f * 1.005 * vib, tt, 8) * 0.4
        s = filt(s, "low", 2600) * adsr(n, 0.01, 0.12, 0.7, 0.08)
        place(lead, s, st)
lead *= 0.022 * (1 - ramp(0, 1, CTA - 0.1, CTA + 0.1))

# ───────────── sound design ─────────────
fx = np.zeros(N)


def tick(at, gain=0.12, f=2600):
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    place(fx, np.sin(2 * np.pi * f * tt) * np.exp(-tt * 220) + 0.4 * filt(rng.standard_normal(n), "band", [2000, 7000]) * np.exp(-tt * 300), at, gain)


def boom(at, gain=0.5, f0=36):
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    place(fx, np.sin(2 * np.pi * (f0 + 50 * np.exp(-tt * 7)) * tt) * np.exp(-tt * 2.4), at, gain)
    crash = filt(rng.standard_normal(n), "band", [600, 9000]) * np.exp(-tt * 3.5)
    place(fx, crash, at, gain * 0.14)


def riser(t0, t1, gain=0.05):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    u = tt / tt[-1]
    noise = rng.standard_normal(n)
    sig = filt(noise, "band", [300, 2000]) * (1 - u) + filt(noise, "band", [2000, 9000]) * u
    place(fx, sig * u**2.2, t0, gain)


def whoosh(at, length=0.5, gain=0.07):
    n = int(length * SR)
    tt = np.arange(n) / SR
    u = tt / length
    noise = rng.standard_normal(n)
    sig = (filt(noise, "band", [200, 1500]) * (1 - u) + filt(noise, "band", [1500, 9000]) * u) * np.sin(np.pi * u) ** 1.4
    place(fx, sig, at - length * 0.55, gain)


def bell(at, m, gain=0.05, length=2.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    place(fx, (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 4)) * np.exp(-tt * 2.2), at, gain)


# accroche : un tic par mot, coup sourd sur « 214 »
for k in range(4):
    tick(HOOK + k * BEAT / 2, 0.07, 1800)
boom(HOOK + 2 * BEAT, 0.22, 30)
tick(HOOK + 2.7 * BEAT, 0.05, 1200)  # le compteur qui hésite
# problème → révélation
riser(PROBLEM + BEAT, REVEAL, 0.05)
boom(REVEAL, 0.6)
# solution
whoosh(SOLUTION + 0.15, 0.6, 0.06)
whoosh(SOLUTION + 1.3, 0.8, 0.04)  # scan
tick(SOLUTION + 2.5 * BEAT, 0.12)
for k in range(3):
    tick(SOLUTION + (5 + k * 0.5) * BEAT, 0.14, 2200 + k * 300)
riser(SOLUTION + 4 * BEAT, PROOF - BEAT / 2, 0.06)
# preuve
boom(PROOF, 0.7)
n = int((COUNT_END - COUNT_START) * SR)
tt = np.arange(n) / SR
u = tt / tt[-1]
sweep_f = 220 * 2 ** (u * 2.5)  # montée de hauteur avec le compteur
sweep = np.sin(2 * np.pi * np.cumsum(sweep_f) / SR) * (u**1.5) * 0.5 + saw(1, tt, 1) * 0
place(fx, filt(sweep, "low", 4000), COUNT_START, 0.05)
for m in (96, 100, 103):
    bell(COUNT_END, m, 0.045, 1.6)  # « ding » cristallin sur 1,2 M
# whip pans
for w in WHIPS:
    whoosh(w, 0.35, 0.09)
# break + logo
whoosh(CTA + 0.4, 0.9, 0.06)
boom(LOGO_HIT, 0.55, 32)
for k, m in enumerate((65, 68, 72, 75, 80)):
    bell(LOGO_HIT + k * 0.06, m, 0.03, 2.6)
tick(NAME, 0.07, 3200)
tick(BUTTON, 0.12, 2400)
final = np.zeros(int(3.2 * SR))
tt = np.arange(len(final)) / SR
for m in (41, 53, 56, 60, 63, 68):  # Fm(add9) final
    final += saw(midi(m), tt, 5)
final = filt(final, "low", 2400) * adsr(len(final), 0.04, 0.4, 0.7, 1.6)
place(fx, final, BUTTON - BEAT, 0.012)

# ───────────── mixage ─────────────
# le temps qui ralentit : tout se ferme sur le dernier demi-temps avant le drop
silence = 1 - gate(PROOF - BEAT / 2, PROOF, 0.03) * 0.92
pad *= duck**0.7
bass *= duck
dry = pad * silence + drums * 0.36 + bass * silence + arp + lead * duck**0.3 + fx
L = dry + 0.0
R = dry.copy()
d = int(BEAT * 0.75 * SR)
R[d:] += 0.3 * (arp + lead * 0.6)[:-d]
L[2 * d :] += 0.2 * (arp + lead * 0.6)[: -2 * d]

ir_n = int(2.4 * SR)
ir_t = np.arange(ir_n) / SR
ir_l = filt(rng.standard_normal(ir_n), "low", 7000) * np.exp(-ir_t * 2.6)
ir_r = filt(rng.standard_normal(ir_n), "low", 7000) * np.exp(-ir_t * 2.6)
ir_l /= np.sqrt(np.sum(ir_l**2))
ir_r /= np.sqrt(np.sum(ir_r**2))
send = filt(pad + arp + lead + fx * 0.7 + drums * 0.05, "high", 300)
L += 0.25 * fftconvolve(send, ir_l)[:N]
R += 0.25 * fftconvolve(send, ir_r)[:N]

env = ramp(1, 0, DUR - 0.8, DUR) * ramp(0, 1, 0, 0.01)
st = np.stack([L * env, R * env], axis=1)
DRIVE = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0  # ≈ -14 LUFS, pic à -1 dBFS
st = np.tanh(st * DRIVE / np.max(np.abs(st)) * 1.0) / np.tanh(DRIVE)
st *= 10 ** (-1 / 20) / np.max(np.abs(st))

out = sys.argv[1] if len(sys.argv) > 1 else "public/boost-music.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print(f"{out} : {DUR} s, {SR} Hz, stéréo")
