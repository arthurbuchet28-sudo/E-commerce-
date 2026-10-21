# Action Logement — vidéo motion design (22 s)

Projet [Remotion](https://www.remotion.dev/) (React + TypeScript).
Deux compositions : `ActionLogement-16x9` (1920×1080) et `ActionLogement-9x16`
(1080×1920), 30 fps, mêmes scènes avec mise en page adaptée.

## Commandes

```bash
npm install
npm run dev          # Remotion Studio (prévisualisation)
npm run render:16x9  # → out/action-logement-16x9.mp4 (H.264, CRF 16)
npm run render:9x16  # → out/action-logement-9x16.mp4
npm run stills       # contrôle qualité : 1 image par scène et par format → out/stills/
```

## Où modifier quoi

| Besoin | Fichier |
|---|---|
| Durées (passer à 20 ou 25 s), BPM, fondus audio | `src/timings.ts` |
| Tous les textes | `src/texts.ts` |
| Couleurs, polices, easings | `src/theme.ts` |
| Logo, musique, SFX, police de charte | `assets/` (voir `assets/README.md`) |

## Structure

```
src/
  Main.tsx              composition principale : <Series> des 5 scènes + wipes + son
  Root.tsx              compositions 16:9 / 9:16 (+ chaque scène seule dans le Studio)
  scenes/               Scene1Accroche … Scene5Signature
  components/           AnimatedText, Icons (pictos SVG originaux), Logo, Wipe,
                        FloatingShapes, SoundTrack, layout (safe zones)
```

## Rythme

À 120 BPM / 30 fps, 1 temps = 15 images, 1 mesure = 2 s. Scènes : 6 / 8 / 16 / 8 / 6
temps (= 3 / 4 / 8 / 4 / 3 s). Chaque wipe est plein écran exactement sur le temps
du changement de scène ; chaque carte de la scène 3 change sur une mesure.
L'écran final est immobile pendant les 2 dernières secondes.

## Safe zones

8 % sur tous les bords ; en 9:16, aucun texte dans les 15 % du bas.
En 9:16, les cartes voisines du carrousel (qui sortent du cadre) n'affichent
pas leur texte, pour qu'aucun mot n'apparaisse coupé.

## Rendus de référence

`renders/` contient les deux MP4 rendus sans logo officiel ni musique
(emplacements réservés visibles) — à régénérer une fois les assets fournis.
