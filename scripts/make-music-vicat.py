"""
Musique originale de la vidéo Vicat, entièrement synthétisée (aucun sample, aucun fichier téléchargé).
Même moteur et mêmes instruments que la musique du mockup (scripts/make-music.py) : nappe, kick avec
sidechain, basse, arpège FM en écho ping-pong, hats, souffles et cloches, réverbération synthétique.

Ambiance : électro/ambient « industrielle », 120 BPM (chaque changement de scène tombe sur un temps),
ré mineur (Dm9 – Bbmaj7 – Fmaj7 – C6), avec un impact métallique sur les temps 2 et 4.
Synchronisée sur la composition VicatBeton (src/vicat/config.ts) :
  0 → 3 s        nappe d'intro + montée pendant que les particules convergent
  1,45 s         impact + cloches : le logo se remplit
  3 s            l'accroche arrive, le groove entre (kick, basse, hats)
  6,5 s          scène offre : arpège + impacts métalliques ; 8,5 s : une note par gamme
  11,2 s         petit « pop » sur le badge CO₂
  14,6 → 16,3 s  une note par service mis en avant
  17,6 → 18,9 s  tics du compteur qui ralentissent, impact sur « 200+ »
  20 s           break : le groove s'efface ; cloches sur le logo, accent sur le bouton
  21,6 → 23 s    fin douce

Usage : python3 scripts/make-music-vicat.py [sortie.wav]
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 23.0
BPM = 120.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
FPS = 60

# Débuts de scène (secondes) — cf. VICAT.durations
SCENE_DUR = [3, 3.5, 4, 3.5, 3.5, 2.5, 3]
STARTS = np.concatenate([[0], np.cumsum(SCENE_DUR)])[:-1]  # 0, 3, 6.5, 10.5, 14, 17.5, 20
HOOK, OFFER, CARBON, SERVICES, STAT, OUTRO = STARTS[1:]
LOGO_FILL = 86 / FPS  # Scene1Intro : remplissage du logo
CAPTION = 118 / FPS
CHIPS = [OFFER + (118 + i * 12) / FPS for i in range(3)]  # Scene3Offer : SWAP + i * 12
BADGE = CARBON + 44 / FPS  # Scene4Carbon
HIGHLIGHTS = [SERVICES + (34 + i * 34) / FPS for i in range(4)]  # Scene5Services : STEP = 34
COUNT_FROM, COUNT_TO = STAT + 6 / FPS, STAT + 84 / FPS  # Scene6Stat : compteur, puis « + »
BREAK = OUTRO
OUTRO_FILL = OUTRO + 58 / FPS  # Scene7Outro
BUTTON = OUTRO + 108 / FPS

rng = np.random.default_rng(11)
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
    [62, 65, 69, 72, 76],  # Dm9   (D F A C E)
    [58, 62, 65, 69, 74],  # Bbmaj7 (Bb D F A) + D
    [53, 60, 64, 69, 72],  # Fmaj7 (F C E A C)
    [60, 64, 67, 69, 72],  # C6    (C E G A C)
]
ROOTS = [38, 34, 41, 36]  # D2 Bb1 F2 C2


def chord_at(time):
    return int((time // BAR) % 4)


# ───────────────────────── Nappe (pad) ─────────────────────────
pad = np.zeros(N)
for b in range(int(np.ceil(DUR / BAR)) + 1):
    start = b * BAR
    if start >= DUR:
        break
    notes = CHORDS[b % 4]
    n = int((BAR + 1.2) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for k, m in enumerate(notes):
        f = midi(m - 12)
        for det in (-0.12, 0.0, 0.12):  # désaccord léger = largeur
            ph = rng.uniform(0, 2 * np.pi)
            fd = f * 2 ** (det / 12)
            sig += sum(np.sin(2 * np.pi * fd * h * tt + ph * h) / h**1.6 for h in range(1, 7)) * (0.9 if k else 1.0)
    sig *= env_adsr(n, 0.7, 0.4, 0.8, 1.2)
    place(pad, sig, start)
# filtre qui s'ouvre pendant l'intro
open_ = smooth(t, 0.0, 1.0, 0.0, HOOK)
pad = lp(pad, 800) * (1 - open_) + lp(pad, 3000) * open_
pad *= 0.016
pad *= smooth(t, 0.55, 1.0, 0, 0.8) * (1 - 0.35 * ((t > HOOK) & (t < BREAK))) * smooth(t, 1, 1.25, BREAK - 0.3, BREAK + 0.5)

# ───────────────────────── Kick ─────────────────────────
def kick():
    n = int(0.4 * SR)
    tt = np.arange(n) / SR
    f = 47 + 100 * np.exp(-tt * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 8)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-tt * 300) * 0.12
    return body + click


KICK = kick()
kick_buf = np.zeros(N)
duck = np.ones(N)  # sidechain : la nappe et la basse « respirent » avec le kick
for bt in np.arange(HOOK, BREAK, BEAT):
    place(kick_buf, KICK * 0.9, bt)
    i = int(bt * SR)
    n = int(0.3 * SR)
    d = 1 - 0.55 * np.exp(-np.arange(n) / SR * 10)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], d[: j - i])

# ───────────────────────── Basse ─────────────────────────
bass = np.zeros(N)
eighth = BEAT / 2
for k, st in enumerate(np.arange(HOOK, BREAK, eighth)):
    m = ROOTS[chord_at(st)] + (12 if k % 4 == 3 else 0)
    n = int(eighth * 0.95 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) + 0.15 * np.sin(2 * np.pi * 3 * f * tt)
    s *= env_adsr(n, 0.004, 0.1, 0.55, 0.04)
    place(bass, s * (0.85 if k % 2 else 1.0), st)
bass = lp(bass, 750) * 0.22

# ───────────────────────── Arpège (pluck) : entre sur la scène offre ─────────────────────────
arp = np.zeros(N)
six = BEAT / 4
pattern = [0, 2, 1, 3, 4, 3, 2, 1]
for k, st in enumerate(np.arange(OFFER, BREAK, six)):
    m = CHORDS[chord_at(st)][pattern[k % len(pattern)]] + 12
    n = int(0.36 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    mod = np.sin(2 * np.pi * f * 2 * tt) * 1.2 * np.exp(-tt * 18)  # petite FM = attaque brillante
    s = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 10)
    place(arp, s * (0.75 + 0.25 * (k % 4 == 0)), st)
arp = lp(arp, 5200) * smooth(t, 0, 1, OFFER, OFFER + BAR) * 0.045
# écho ping-pong (3/16)
d = int(BEAT * 0.75 * SR)
arp_l = arp.copy()
arp_r = arp.copy()
arp_r[d:] += 0.45 * arp[:-d]
arp_l[2 * d :] += 0.28 * arp[: -2 * d]

# ───────────────────────── Hats ─────────────────────────
hats = np.zeros(N)
for k, st in enumerate(np.arange(HOOK + BAR / 2, BREAK, eighth)):
    n = int(0.07 * SR)
    tt = np.arange(n) / SR
    s = hp(rng.standard_normal(n), 7500) * np.exp(-tt * (55 if k % 2 else 80))
    place(hats, s * (1.0 if k % 2 else 0.55), st)
hats *= 0.02

# ───────────────────────── Impact métallique (temps 2 et 4) : la touche « chantier » ─────────────────────────
metal = np.zeros(N)
for bt in np.arange(OFFER + BEAT, BREAK, 2 * BEAT):
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    # partiels inharmoniques (tôle frappée) + bruit bref
    ring = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * dcy) for f, dcy in ((420, 14), (1130, 18), (1870, 24), (2950, 30)))
    hit = bp(rng.standard_normal(n), 1200, 6000) * np.exp(-tt * 60)
    place(metal, ring * 0.25 + hit * 0.8, bt)
metal = hp(metal, 300) * 0.022

# ───────────────────────── Effets synchronisés ─────────────────────────
fx = np.zeros(N)


def whoosh(at, length=0.7, gain=0.05):
    n = int(length * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    u = tt / length
    sig = (bp(noise, 200, 1200) * (1 - u) + bp(noise, 1500, 8000) * u) * np.sin(np.pi * u) ** 1.5
    place(fx, sig * gain, at - length * 0.6)


def boom(at, gain=0.4, length=1.4):
    n = int(length * SR)
    tt = np.arange(n) / SR
    place(fx, np.sin(2 * np.pi * (38 + 40 * np.exp(-tt * 6)) * tt) * np.exp(-tt * 2.8) * gain, at)


def bell(at, m, gain=0.035, length=2.4):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 3)) * np.exp(-tt * 1.5)
    place(fx, s * gain, at)


def pluck(at, m, gain=0.05):
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * tt + np.sin(2 * np.pi * f * 3 * tt) * 0.8 * np.exp(-tt * 20)) * np.exp(-tt * 6)
    place(fx, s * gain, at)


# Intro : montée pendant la convergence, impact + cloches au remplissage du logo
n = int((LOGO_FILL - 0.15) * SR)
tt = np.arange(n) / SR
place(fx, bp(rng.standard_normal(n), 400, 6000) * (tt / tt[-1]) ** 2.2 * 0.03, 0.15)
boom(LOGO_FILL, 0.35)
for k, m in enumerate([86, 93, 89, 96]):
    bell(LOGO_FILL + 0.1 + k * BEAT * 0.5, m, 0.03)
pluck(CAPTION, 81, 0.03)

# Souffles sur chaque changement de scène ; impact quand le groove entre
for s in STARTS[1:]:
    whoosh(s)
n = int(0.5 * SR)
place(fx, bp(rng.standard_normal(n), 300, 5000) * np.linspace(0, 1, n) ** 3 * 0.05, HOOK - 0.5)
boom(HOOK, 0.45)

# Une note par gamme (offre) et par service mis en avant
for k, at in enumerate(CHIPS):
    pluck(at, [81, 84, 88][k])
for k, at in enumerate(HIGHLIGHTS):
    pluck(at, [74, 77, 81, 86][k], 0.045)

# Badge CO₂ : petit « pop » qui descend (CO₂ en baisse)
n = int(0.18 * SR)
tt = np.arange(n) / SR
place(fx, np.sin(2 * np.pi * np.cumsum(1400 * np.exp(-tt * 9) + 300) / SR) * np.exp(-tt * 18) * 0.05, BADGE)

# Compteur : tics qui ralentissent comme le chiffre (ease.out), impact sur « 200+ »
for k in range(1, 21):
    u = 1 - (1 - k / 20) ** (1 / 3)  # inverse d'une sortie cubique
    at = COUNT_FROM + u * (COUNT_TO - COUNT_FROM)
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    place(fx, np.sin(2 * np.pi * (1800 + 40 * k) * tt) * np.exp(-tt * 200) * 0.05, at)
boom(COUNT_TO, 0.3, 1.0)
bell(COUNT_TO, 86, 0.03, 1.6)

# Break logo : souffle long, cloches au remplissage, accent sur le bouton
whoosh(BREAK, 1.0, 0.06)
for k, m in enumerate([86, 93, 89, 96]):
    bell(OUTRO_FILL + k * BEAT * 0.5, m)
n = int(2.2 * SR)
tt = np.arange(n) / SR
acc = sum(np.sin(2 * np.pi * midi(m) * tt) for m in (62, 69, 74, 77, 81)) * np.exp(-tt * 1.1) * env_adsr(n, 0.02, 0.3, 0.8, 1.0)
place(fx, lp(acc, 4000) * 0.03, BUTTON)
boom(BUTTON, 0.28, 1.2)

# ───────────────────────── Mixage ─────────────────────────
groove_gate = smooth(t, 1, 0, BREAK - 0.2, BREAK + 0.6)  # le groove s'efface au break
kick_buf *= groove_gate
bass *= groove_gate * duck
hats *= groove_gate
metal *= groove_gate
arp_l *= groove_gate
arp_r *= groove_gate
pad *= duck**0.6

L = pad + bass + kick_buf * 0.32 + hats * 0.8 + metal * 1.15 + arp_l + fx
R = pad + bass + kick_buf * 0.32 + hats * 1.2 + metal * 0.85 + arp_r + fx
sh = int(0.011 * SR)  # léger décalage stéréo de la nappe
R[sh:] += 0.25 * pad[:-sh]

# réverbération (réponse impulsionnelle synthétique, bruit à décroissance exponentielle)
ir_n = int(2.6 * SR)
ir_t = np.arange(ir_n) / SR
ir_l = lp(rng.standard_normal(ir_n), 6000) * np.exp(-ir_t * 2.4)
ir_r = lp(rng.standard_normal(ir_n), 6000) * np.exp(-ir_t * 2.4)
ir_l /= np.sqrt(np.sum(ir_l**2))
ir_r /= np.sqrt(np.sum(ir_r**2))
send = hp(pad + arp_l * 0.8 + metal * 0.6 + fx * 0.9, 250)
L = L + 0.3 * fftconvolve(send, ir_l)[:N]
R = R + 0.3 * fftconvolve(send, ir_r)[:N]

# fin douce (pas de coupure sèche), début sans clic
master_env = smooth(t, 1, 0, DUR - 1.4, DUR) * smooth(t, 0, 1, 0, 0.05)
L *= master_env
R *= master_env

# limiteur doux + normalisation à -1 dBFS
st = np.stack([L, R], axis=1)
st = np.tanh(st * 1.6) / np.tanh(1.6)
st *= 10 ** (-1 / 20) / np.max(np.abs(st))

out = sys.argv[1] if len(sys.argv) > 1 else "public/vicat-music.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print(f"{out} : {DUR} s, {SR} Hz, stéréo")
