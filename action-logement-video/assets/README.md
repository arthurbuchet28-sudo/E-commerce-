# Fichiers à déposer ici

| Fichier | Rôle | Si absent |
|---|---|---|
| `logo-action-logement.svg` | Logo officiel couleur (scène 5, fond blanc) | Emplacement réservé « LOGO OFFICIEL » |
| `logo-action-logement-blanc.svg` | Logo officiel blanc (scène 2, fond framboise) | Emplacement réservé « LOGO OFFICIEL » |
| `audio/music.mp3` | Musique libre de droits, corporate positive, ~120 BPM | Vidéo muette |
| `sfx/whoosh.mp3` | Son des wipes entre scènes | Ignoré |
| `sfx/pop.mp3` | Apparition logo blanc, changement de carte, maison reliée | Ignoré |
| `sfx/reveal.mp3` | Révélation du logo final | Ignoré |
| `fonts/*.woff2 / .otf / .ttf` | Police de la charte (graisse lue dans le nom : Medium, Bold, ExtraBold…) | Montserrat |
| Charte graphique (PDF) | Référence : elle prime sur les couleurs de `src/theme.ts` | — |

Chaque commande `npm run dev / render:* / stills` relance la détection
(`scripts/check-assets.mjs`) : il suffit de déposer les fichiers et de relancer.
Le logo n'est jamais redessiné en code ; il est affiché tel quel (proportions
conservées, aucun effet).
