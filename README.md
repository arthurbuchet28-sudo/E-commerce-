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

---

# Pub n°2 — « Promptly », site de formation vidéo IA (20 s)

Composition `PubSite` (1920×1080, 60 fps, 1200 frames). Elle réutilise les utilitaires de la pub n°1 (fondus, caméra, flou de mouvement, grain).

```bash
npm run dev          # Studio : choisir la composition « PubSite »
npm run render:site  # rendu final → out/pub-site.mp4
```

```
src/site/
├── config.ts          ← TOUT ce qui se personnalise (textes, couleurs, chiffre, durées)
├── theme.ts           ← palettes dérivées des 2 couleurs + formats
├── PubSite.tsx        ← enchaînement des 6 scènes
├── scenes/            ← Scene1Laptop, Scene2Dive, Scene3Generate, Scene4Stat, Scene5Screens, Scene6Logo
├── components/        ← Laptop3D (MacBook CSS 3D) + FlatBrowser, SiteLogo, LightTrail
└── ui/                ← maquettes : Landing, LessonScreen, EditorScreen, CommunityScreen, AIThumb (vignettes SVG)
```

| Scène | Temps | Contenu |
|---|---|---|
| 1 | 0-3 s | Le MacBook arrive en rotation, la landing page apparaît bloc par bloc |
| 2 | 3-6,5 s | Plongée dans l'écran, les blocs flottent en 3D avec profondeur de champ |
| 3 | 6,5-10 s | Le prompt se tape, « Générer », traînée néon, la vidéo se génère jusqu'à 100 % |
| 4 | 10-13,5 s | Compteur 12 400 créateurs formés, mini-stats, avatars |
| 5 | 13,5-16,5 s | 3 fenêtres (leçon, montage, communauté) reliées par des lignes de lumière |
| 6 | 16,5-20 s | Convergence, logo tracé en lumière, nom, bouton « Commencer gratuitement » |

## Modifier (dans `src/site/config.ts`)

- **Textes** : `siteName`, `tagline`, `ctaLabel`, `url`, `heroTitle`, `heroSubtitle`, `prompt`, `generateLabel`, `readyLabel`, `stat.*`, `screens[]`. Le contenu détaillé des maquettes est dans `src/site/ui/`.
- **Couleurs** : `accent` (violet) et `accent2` (cyan). Les teintes claires/pâles/foncées, les glows et les dégradés en sont dérivés. Fond : `background.center` / `background.edge`.
- **Durée** : `durations` (secondes par scène, total recalculé automatiquement) et `transition` (fondus). Les moments précis d'une animation sont des plages `interpolate(frame, [début, fin], …)` en frames (60/s), dans le fichier de la scène.

## Version TikTok (9:16)

Composition `PubSiteVertical` (1080×1920) : mêmes scènes et même config, mise en page adaptée au portrait (`src/site/layout.ts` détecte le format).

```bash
npm run render:tiktok   # → out/pub-site-tiktok.mp4
```

- Accroche en haut de l'écran pendant la scène 1 : `verticalHook` dans `src/site/config.ts`.
- Les éléments importants restent dans la zone centrale (la barre de légende et les icônes TikTok couvrent le bas et la droite).

---

# Mockup — une main lance la pub sur un MacBook (25,5 s)

Composition `PubMockup` (1920×1080, 60 fps) : une main entre, pose l'index sur le trackpad, amène le curseur sur ▶ et clique ; la pub `public/pub-site.mp4` tourne ensuite en entier sur l'écran du laptop pendant que la caméra se rapproche.

```bash
npm run render:mockup   # → out/pub-mockup.mp4
```

```
src/mockup/
├── config.ts               ← timings, teinte de peau, couleurs, caméra, vidéo affichée
├── PubMockup.tsx           ← composition : caméra, laptop + bureau 3D, calque de la main
├── components/             ← Hand (SVG articulée), Desk (bureau, mur, bokeh, accessoires), ScreenPlayer, Cursor
└── lib/                    ← geometry.ts (projection du trackpad à l'écran), paths.ts (trajectoires main/curseur)
```

**Modifier (dans `src/mockup/config.ts`)** :
- **Timings** : `timing.handIn`, `land`, `slide`, `click`, `play`, `handOut`, `pushIn`, `endHold` (secondes). La durée totale = `play` + durée de la vidéo + `endHold`.
- **Main** : `skin` (teinte de peau ; ombres et lumières dérivées), `sleeve` (couleurs du pull).
- **Couleurs** : `desk`, `wall`, `lampColor` ; les lueurs reprennent l'accent de `src/site/config.ts`.
- **Caméra** : `camera.startScale` / `closeScale` / `endScale` (taille du laptop), rotations.
- **Vidéo affichée** : copier le fichier dans `public/`, puis changer `video`, `videoFrames` (nombre d'images, cf. `ffprobe`) et `videoLabel` (titre affiché en pause).

**Musique** : piste originale synthétisée par `scripts/make-music.py` (aucun sample téléchargé, donc libre de droits), électro/ambient à 100 BPM en la mineur, calée sur les moments clés (montée pendant l'arrivée de la main, clic à 3,5 s, impact au lancement à 3,8 s, souffles sur chaque changement de scène de la pub, break et cloches sur le logo, fondu final).
- Régénérer après avoir changé les timings : `npm run music` (nécessite `pip install numpy scipy`), puis `npm run render:mockup`.
- Volume : `musicVolume` dans `src/mockup/config.ts` ; pour utiliser une autre musique, mettez le fichier dans `public/` et changez `music` (ou `music: ""` pour aucune).

---

# Vidéo n°3 — « Vicat », offre béton (23 s)

Composition `VicatBeton` (1920×1080, 60 fps, 1380 frames), même style que Promptly : elle réutilise `SceneTimeline` (fondus dissolve / blur), `Camera`, `Background`, `Grain`, `DirectionalBlur` et `LightTrail`. Seuls les textes, les couleurs (fond béton clair, bleu `#004587` extrait du logo officiel, anthracite) et le logo changent.

```bash
npm run dev           # Studio : choisir la composition « VicatBeton »
npm run render:vicat  # rendu final → out/vicat-beton-presentation.mp4
```

| Scène | Temps | Contenu |
|---|---|---|
| 1 | 0-3 s | Particules convergentes, logo Vicat tracé lettre par lettre puis rempli |
| 2 | 3-6,5 s | « Bâtir le futur, décarboner le présent. » mot par mot |
| 3 | 6,5-10,5 s | Carte 3D « Le béton prêt à l'emploi » qui remonte ; les gammes Classiques · Décoratifs · Spécifiques jaillissent en tuiles séparées (échantillon de matière), reliées par des lignes de lumière |
| 4 | 10,5-14 s | Picto feuille + CO₂ en baisse, « Bas carbone avec DECA. Recyclé avec REVY. » |
| 5 | 14-17,5 s | Formulation · Pompage · Centrale mobile · Livraison, reliés par des lignes de lumière |
| 6 | 17,5-20 s | Compteur 200+ implantations en France |
| 7 | 20-23 s | Logo, « Besoin de béton pour votre chantier ? », bouton vicat.fr |

Tout se règle dans `src/vicat/config.ts`. Logo : `public/logo-vicat-bleu.svg` (tracés repris dans `src/vicat/components/VicatLogo.tsx`). Pictos au trait : `src/vicat/components/Pictos.tsx`.

**Musique** : piste originale synthétisée par `scripts/make-music-vicat.py` (même moteur que la musique du mockup, aucun sample, donc libre de droits). Électro/ambient « industrielle » à 120 BPM en ré mineur, pour que chaque changement de scène tombe sur un temps. Elle suit les moments clés : montée pendant l'intro, impact et cloches quand le logo se remplit, entrée du groove sur l'accroche, impacts métalliques à partir de l'offre, une note par gamme et par service, tics du compteur et impact sur « 200+ », break et cloches sur le logo final, fondu de fin.
- Régénérer après avoir changé les durées : `npm run music:vicat` (nécessite `pip install numpy scipy`), puis `npm run render:vicat`. Les repères sont en haut du script.
- Volume : `musicVolume` dans `src/vicat/config.ts` ; `music: ""` pour aucune musique.
