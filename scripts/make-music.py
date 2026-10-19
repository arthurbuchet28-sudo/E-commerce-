"""
Musique originale du mockup, entièrement synthétisée (aucun sample, aucun fichier téléchargé).

Ambiance : électro/ambient premium, 100 BPM, la mineur (Am9 – Fmaj7 – Cmaj7 – G6).
Synchronisée sur la vidéo PubMockup :
  0 → 3,8 s    nappe d'intro + montée qui accompagne la main
  3,5 s        « clic » du trackpad
  3,8 s        impact : la pub démarre, le groove entre (kick, basse, arpège, hats)
  6,8 / 10,3 / 13,8 / 17,3 s  souffles (whoosh) sur les changements de scène de la pub
  20,3 s       break : le groove s'efface, cloches sur l'apparition du logo
  21,4 s       accent sur le nom « Promptly »
  23,8 → 25,5 s  queue de réverbération, fin douce

Usage : python3 scripts/make-music.py [sortie.wav]
"""
import sys

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 25.5
BPM = 100.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT

# Repères de la vidéo (secondes) — cf. src/mockup/config.ts
CLICK = 3.5
PLAY = 3.8
SCENES = [PLAY + s for s in (3.0, 6.5, 10.0, 13.5)]  # changements de scène de la pub
BREAK = PLAY + 16.5  # scène logo
NAME = PLAY + 17.6  # le nom apparaît
VIDEO_END = PLAY + 20.0

rng = np.random.default_rng(7)
N = int(SR * DUR)
t = np.arange(N) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a, d, s, r, sr=SR):
    """Enveloppe ADSR de n échantillons (a, d, r en secondes)."""
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.full(n, s, dtype=float)
    a = min(a, n)
    e[:a] = np.linspace(0, 1, a, endpoint=False)
    d = min(d, n - a)
    e[a : a + d] = np.linspace(1, s, d, endpoint=False)
    r = min(r, n)
    e[n - r :] *= np.linspace(1, 0, r)
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def place(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def smooth(x, lo, hi, t0, t1):
    """Rampe douce (cosinus) de lo à hi entre t0 et t1, sur l'axe t global."""
    u = np.clip((t - t0) / max(1e-6, t1 - t0), 0, 1)
    return lo + (hi - lo) * (0.5 - 0.5 * np.cos(np.pi * u))


# ───────────────────────── Progression ─────────────────────────
CHORDS = [
    [57, 60, 64, 67, 71],  # Am9  (A C E G B)
    [53, 57, 60, 64, 69],  # Fmaj7 (F A C E) + A
    [48, 55, 59, 64, 67],  # Cmaj7 (C G B E G)
    [55, 59, 62, 64, 67],  # G6   (G B D E G)
]
ROOTS = [33, 29, 36, 31]  # A1 F1 C2 G1


def chord_at(time):
    return int((time // BAR) % 4)


L = np.zeros(N)
R = np.zeros(N)

# ───────────────────────── Nappe (pad) ─────────────────────────
pad = np.zeros(N)
bar_count = int(np.ceil(DUR / BAR)) + 1
for b in range(bar_count):
    start = b * BAR
    if start >= DUR:
        break
    notes = CHORDS[b % 4]
    n = int((BAR + 1.2) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for k, m in enumerate(notes):
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):  # désaccord léger = largeur
            ph = rng.uniform(0, 2 * np.pi)
            fd = f * 2 ** (det / 12)
            # dent de scie douce (somme d'harmoniques décroissantes)
            sig += sum(np.sin(2 * np.pi * fd * h * tt + ph * h) / h**1.6 for h in range(1, 7)) * (0.9 if k else 1.0)
    sig *= env_adsr(n, 0.9, 0.4, 0.8, 1.2)
    place(pad, sig, start)
# filtre qui s'ouvre au fil de l'intro, puis respire
pad_lo = lp(pad, 900)
pad_hi = lp(pad, 3200)
open_ = smooth(t, 0.0, 1.0, 0.0, PLAY)
pad = pad_lo * (1 - open_) + pad_hi * open_
pad *= 0.016
# plus discret pendant le groove, plus présent au break
pad *= smooth(t, 0.55, 1.0, 0, 0.8) * (1 - 0.35 * ((t > PLAY) & (t < BREAK))) * smooth(t, 1, 1.25, BREAK - 0.3, BREAK + 0.5)

# ───────────────────────── Kick ─────────────────────────
def kick():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 45 + 95 * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt * 7.5)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-tt * 300) * 0.1
    return body + click


KICK = kick()
kick_buf = np.zeros(N)
duck = np.ones(N)  # sidechain : la nappe et la basse « respirent » avec le kick
groove_end = BREAK
beat_times = np.arange(PLAY, groove_end, BEAT)
for bt in beat_times:
    place(kick_buf, KICK * 0.9, bt)
    i = int(bt * SR)
    n = int(0.35 * SR)
    d = 1 - 0.55 * np.exp(-np.arange(n) / SR * 9)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], d[: j - i])

# ───────────────────────── Basse ─────────────────────────
bass = np.zeros(N)
eighth = BEAT / 2
for k, st in enumerate(np.arange(PLAY, groove_end, eighth)):
    root = ROOTS[chord_at(st)]
    # motif : fondamentale, octave sur les contretemps
    m = root + (12 if k % 4 == 3 else 0)
    n = int(eighth * 0.95 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
    s *= env_adsr(n, 0.004, 0.12, 0.55, 0.05)
    place(bass, s * (0.85 if k % 2 else 1.0), st)
bass = lp(bass, 700) * 0.22

# ───────────────────────── Arpège (pluck) ─────────────────────────
arp = np.zeros(N)
arp_dly = np.zeros(N)
six = BEAT / 4
pattern = [0, 2, 1, 3, 4, 3, 2, 1]
for k, st in enumerate(np.arange(PLAY, groove_end, six)):
    notes = CHORDS[chord_at(st)]
    m = notes[pattern[k % len(pattern)]] + 12
    n = int(0.42 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    mod = np.sin(2 * np.pi * f * 2 * tt) * 1.2 * np.exp(-tt * 18)  # petite FM = attaque brillante
    s = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 9)
    vel = 0.75 + 0.25 * (k % 4 == 0)
    place(arp, s * vel, st)
arp = lp(arp, 5200)
# entrée progressive de l'arpège sur la première mesure de groove
arp *= smooth(t, 0, 1, PLAY, PLAY + BAR) * 0.05
# écho ping-pong (3/16)
d = int(BEAT * 0.75 * SR)
arp_l = arp.copy()
arp_r = arp.copy()
arp_r[d:] += 0.45 * arp[:-d]
arp_l[2 * d :] += 0.28 * arp[: -2 * d]

# ───────────────────────── Hats ─────────────────────────
hats = np.zeros(N)
for k, st in enumerate(np.arange(PLAY + BAR, groove_end, eighth)):
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    s = hp(rng.standard_normal(n), 7500) * np.exp(-tt * (55 if k % 2 else 80))
    place(hats, s * (1.0 if k % 2 else 0.55), st)
hats *= 0.022

# ───────────────────────── Effets synchronisés ─────────────────────────
fx = np.zeros(N)

# montée d'intro (bruit filtré qui s'ouvre) jusqu'au lancement
n = int((PLAY - 1.4) * SR)
tt = np.arange(n) / SR
riser = rng.standard_normal(n)
riser = bp(riser, 400, 6000) * (tt / tt[-1]) ** 2.2
place(fx, riser * 0.035, 1.4)

# clic du trackpad (3,5 s) : tick court + petit corps
n = int(0.06 * SR)
tt = np.arange(n) / SR
tick = (np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 260) + 0.6 * bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt * 400))
place(fx, tick * 0.22, CLICK)

# impact au lancement (3,8 s) : sub-boom + souffle inversé avant
n = int(1.6 * SR)
tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (38 + 40 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 2.6)
place(fx, boom * 0.55, PLAY)
n = int(0.5 * SR)
rev = bp(rng.standard_normal(n), 300, 5000) * np.linspace(0, 1, n) ** 3
place(fx, rev * 0.06, PLAY - 0.5)


def whoosh(at, length=0.7, gain=0.05):
    n = int(length * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # balayage de filtre : on mélange deux bandes selon la position
    low = bp(noise, 200, 1200)
    high = bp(noise, 1500, 8000)
    u = tt / length
    sig = (low * (1 - u) + high * u) * np.sin(np.pi * u) ** 1.5
    place(fx, sig * gain, at - length * 0.6)


for s in SCENES:
    whoosh(s)

# break logo : chute + cloches
whoosh(BREAK, 1.0, 0.06)
for k, m in enumerate([81, 88, 84, 91]):
    n = int(2.6 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    bell = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 3)) * np.exp(-tt * 1.4)
    place(fx, bell * 0.035, BREAK + 0.15 + k * BEAT * 0.5)
# accent sur le nom
n = int(2.2 * SR)
tt = np.arange(n) / SR
acc = sum(np.sin(2 * np.pi * midi(m) * tt) for m in (57, 64, 69, 72, 76)) * np.exp(-tt * 1.1) * env_adsr(n, 0.02, 0.3, 0.8, 1.0)
place(fx, lp(acc, 4000) * 0.03, NAME)
n = int(1.2 * SR)
tt = np.arange(n) / SR
place(fx, np.sin(2 * np.pi * (40 + 30 * np.exp(-tt * 5)) * tt) * np.exp(-tt * 3) * 0.3, NAME)

# ───────────────────────── Mixage ─────────────────────────
groove_gate = smooth(t, 1, 0, BREAK - 0.2, BREAK + 0.6)  # le groove s'efface au break
kick_buf *= groove_gate
bass *= groove_gate * duck
hats *= groove_gate
arp_l *= groove_gate
arp_r *= groove_gate
pad *= duck ** 0.6

L = pad + bass + kick_buf * 0.32 + hats * 0.8 + arp_l + fx
R = pad + bass + kick_buf * 0.32 + hats * 1.2 + arp_r + fx
# léger décalage stéréo de la nappe
sh = int(0.011 * SR)
R[sh:] += 0.25 * pad[:-sh]

# réverbération (réponse impulsionnelle synthétique, bruit à décroissance exponentielle)
ir_n = int(2.8 * SR)
ir_t = np.arange(ir_n) / SR
ir_l = lp(rng.standard_normal(ir_n), 6000) * np.exp(-ir_t * 2.3)
ir_r = lp(rng.standard_normal(ir_n), 6000) * np.exp(-ir_t * 2.3)
ir_l /= np.sqrt(np.sum(ir_l**2))
ir_r /= np.sqrt(np.sum(ir_r**2))
send = hp(pad + arp_l * 0.8 + fx * 0.9, 250)
L = L + 0.32 * fftconvolve(send, ir_l)[:N]
R = R + 0.32 * fftconvolve(send, ir_r)[:N]

# fin douce : fondu sur la dernière seconde (pas de coupure sèche), début sans clic
master_env = smooth(t, 1, 0, DUR - 1.4, DUR) * smooth(t, 0, 1, 0, 0.05)
L *= master_env
R *= master_env

# limiteur doux + normalisation à -1 dBFS
st = np.stack([L, R], axis=1)
st = np.tanh(st * 1.6) / np.tanh(1.6)
st *= 10 ** (-1 / 20) / np.max(np.abs(st))

out = sys.argv[1] if len(sys.argv) > 1 else "public/mockup-music.wav"
pcm = (st * 32767).astype("<i2")
import wave

with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{out} : {DUR} s, {SR} Hz, stéréo")
