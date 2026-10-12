/**
 * Synthétise les effets sonores du jeu (fichiers WAV courts, sans dépendance ni droits d'auteur).
 * Usage : npm run sons
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FREQ = 22050;
const DOSSIER = join(import.meta.dirname, '..', 'public', 'sons');

type Note = { f: number; debut: number; duree: number; volume?: number; type?: 'sinus' | 'triangle' | 'carre'; glisse?: number };

const NOTES: Record<string, number> = { A3: 220, C4: 261.63, E4: 329.63, F4: 349.23, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 };

function onde(type: Note['type'], phase: number) {
  if (type === 'triangle') return (2 / Math.PI) * Math.asin(Math.sin(phase));
  if (type === 'carre') return Math.sign(Math.sin(phase)) * 0.5;
  return Math.sin(phase) + 0.25 * Math.sin(2 * phase) + 0.1 * Math.sin(3 * phase);
}

/** Enveloppe courte : attaque rapide, décroissance exponentielle douce. */
function enveloppe(t: number, duree: number) {
  const attaque = 0.008;
  if (t < attaque) return t / attaque;
  return Math.exp((-4 * (t - attaque)) / duree) * (t < duree ? 1 : Math.max(0, 1 - (t - duree) / 0.03));
}

function synthetiser(notes: Note[], volumeGlobal = 0.6): Buffer {
  const fin = Math.max(...notes.map((n) => n.debut + n.duree)) + 0.05;
  const n = Math.ceil(fin * FREQ);
  const echantillons = new Float32Array(n);
  for (const note of notes) {
    let phase = 0;
    const debut = Math.floor(note.debut * FREQ);
    const longueur = Math.ceil((note.duree + 0.03) * FREQ);
    for (let i = 0; i < longueur && debut + i < n; i++) {
      const t = i / FREQ;
      const f = note.f * (note.glisse ? Math.pow(note.glisse, t / note.duree) : 1);
      phase += (2 * Math.PI * f) / FREQ;
      echantillons[debut + i]! += onde(note.type, phase) * enveloppe(t, note.duree) * (note.volume ?? 1);
    }
  }
  const max = Math.max(1e-6, ...echantillons.map(Math.abs));
  const donnees = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) donnees.writeInt16LE(Math.round((echantillons[i]! / max) * volumeGlobal * 32767), i * 2);
  const entete = Buffer.alloc(44);
  entete.write('RIFF', 0);
  entete.writeUInt32LE(36 + donnees.length, 4);
  entete.write('WAVEfmt ', 8);
  entete.writeUInt32LE(16, 16);
  entete.writeUInt16LE(1, 20); // PCM
  entete.writeUInt16LE(1, 22); // mono
  entete.writeUInt32LE(FREQ, 24);
  entete.writeUInt32LE(FREQ * 2, 28);
  entete.writeUInt16LE(2, 32);
  entete.writeUInt16LE(16, 34);
  entete.write('data', 36);
  entete.writeUInt32LE(donnees.length, 40);
  return Buffer.concat([entete, donnees]);
}

const N = NOTES as Record<string, number>;
const SONS: Record<string, { notes: Note[]; volume?: number }> = {
  // Bonne réponse : deux notes montantes, joyeuses.
  bonne: { notes: [{ f: N.C6!, debut: 0, duree: 0.12 }, { f: N.E6!, debut: 0.08, duree: 0.22 }] },
  // Combo : arpège plus brillant.
  combo: { notes: [{ f: N.C6!, debut: 0, duree: 0.1 }, { f: N.E6!, debut: 0.07, duree: 0.1 }, { f: N.G6!, debut: 0.14, duree: 0.3 }] },
  // Mauvaise réponse : discret, jamais agressif (notes graves et douces, volume réduit).
  mauvaise: { notes: [{ f: N.E4!, debut: 0, duree: 0.14, type: 'triangle' }, { f: N.C4!, debut: 0.12, duree: 0.25, type: 'triangle' }], volume: 0.35 },
  // Tic-tac des 5 dernières secondes.
  tic: { notes: [{ f: N.A5!, debut: 0, duree: 0.03, type: 'triangle' }], volume: 0.3 },
  // Fin de partie : petite fanfare.
  fin: { notes: [{ f: N.G4!, debut: 0, duree: 0.14 }, { f: N.C5!, debut: 0.12, duree: 0.14 }, { f: N.E5!, debut: 0.24, duree: 0.14 }, { f: N.G5!, debut: 0.36, duree: 0.45 }] },
  // Nouveau record : fanfare plus longue.
  record: {
    notes: [
      { f: N.C5!, debut: 0, duree: 0.12 },
      { f: N.E5!, debut: 0.1, duree: 0.12 },
      { f: N.G5!, debut: 0.2, duree: 0.12 },
      { f: N.C6!, debut: 0.3, duree: 0.5 },
      { f: N.E6!, debut: 0.3, duree: 0.5, volume: 0.5 },
    ],
  },
  // Badge débloqué : scintillement.
  badge: { notes: [{ f: N.E6!, debut: 0, duree: 0.08, volume: 0.7 }, { f: N.G6!, debut: 0.06, duree: 0.08, volume: 0.7 }, { f: N.C6! * 2, debut: 0.12, duree: 0.25, volume: 0.6 }] },
  // Clic / joker.
  joker: { notes: [{ f: N.A4!, debut: 0, duree: 0.18, glisse: 2, type: 'triangle' }], volume: 0.45 },
};

mkdirSync(DOSSIER, { recursive: true });
for (const [nom, s] of Object.entries(SONS)) {
  const wav = synthetiser(s.notes, s.volume ?? 0.6);
  writeFileSync(join(DOSSIER, `${nom}.wav`), wav);
  console.log(`✓ ${nom}.wav (${(wav.length / 1024).toFixed(1)} Ko)`);
}
