# Pub motion design — Remotion

Publicité de 15 s (1920×1080, 60 fps) générée en React + TypeScript avec [Remotion](https://www.remotion.dev/).
Toutes les maquettes d'interface sont dessinées en JSX : aucune image externe.

## Lancer

```bash
npm install
npm run dev      # Remotion Studio : prévisualisation en direct dans le navigateur
npm run render   # rendu final → out/pub.mp4
```

## Structure

```
src/
├── config.ts              ← TOUT ce qui se personnalise (textes, couleurs, durées)
├── Pub.tsx                ← enchaînement des scènes, fondus, caméra globale
├── Root.tsx / index.ts    ← déclaration de la composition Remotion
├── fonts.ts               ← chargement d'Inter
├── scenes/
│   ├── Scene1Phone.tsx    ← 0-3 s   iPhone 3D qui arrive en rotation
│   ├── Scene2Dive.tsx     ← 3-6 s   plongée dans l'écran, UI flottante + profondeur de champ
│   ├── Scene3Stat.tsx     ← 6-9 s   carte clé, compteur, traînée néon
│   ├── Scene4Screens.tsx  ← 9-12 s  écrans en perspective, lignes de lumière + particules
│   └── Scene5Logo.tsx     ← 12-15 s convergence, logo tracé, nom, bouton
├── components/            ← Phone (iPhone CSS 3D), Logo, Background + grain
├── ui/                    ← maquettes de l'app (écran d'accueil, séance, progression, régularité)
└── lib/                   ← utilitaires (couleurs, easing, flou de mouvement, contexte de scène)
```

## Personnaliser

Tout se règle dans **`src/config.ts`** :

| Quoi | Clé |
|---|---|
| Nom de l'app, slogan, texte du bouton | `appName`, `tagline`, `ctaLabel` |
| Couleur d'accent (glow, boutons, graphiques) | `accent` (les teintes claires/foncées en sont dérivées automatiquement) |
| Dégradé de fond | `background.center`, `background.edge` |
| Police | `fontFamily` |
| Chiffre clé de la scène 3 | `stat.label`, `stat.exercise`, `stat.value`, `stat.decimals`, `stat.unit`, `stat.delta` |
| Légendes des écrans de la scène 4 | `screens[]` |
| Durée de chaque scène (secondes) | `durations.intro` … `durations.outro` — la durée totale est leur somme |
| Durée des fondus enchaînés | `transition` |

Les textes internes des maquettes (exercices, séries, etc.) sont dans `src/ui/HomeScreen.tsx` et `src/ui/OtherScreens.tsx`.
Le logo (carré arrondi + pulsation) est dessiné en SVG dans `src/components/Logo.tsx` : remplacez les chemins `tile` et `pulse` pour le vôtre.

> Les animations internes des scènes sont réglées pour des scènes de ~3 s. Si vous allongez beaucoup une scène, les mouvements continus (caméra, flottement, traînée) s'étirent naturellement, mais vous pouvez ajuster les plages de frames (`interpolate(frame, [début, fin], …)`) dans le fichier de la scène.
