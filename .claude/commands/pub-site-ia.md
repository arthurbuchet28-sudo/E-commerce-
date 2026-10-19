---
description: Génère avec Remotion une pub motion design premium (~20 s) pour un site qui apprend à créer des vidéos IA
---

# Mission

Crée un projet **Remotion (React + TypeScript)** qui génère une **publicité motion design de 20 secondes** pour **[NOM DU SITE]**, un site/une plateforme de formation qui **apprend à créer des vidéos avec l'IA** (écrire des prompts, générer des plans, monter, animer, publier).

Style visé : **premium, type keynote / pub Apple**. Calme, précis, lumineux. Aucune coupe sèche.

Infos complémentaires éventuelles de l'utilisateur : $ARGUMENTS

## 0. Valeurs par défaut (OBLIGATOIRE)

Si un champ ci-dessous est resté entre crochets ou n'est pas fourni, **ne t'arrête pas pour demander** : utilise la valeur par défaut, et liste à la fin celles que tu as utilisées.

| Champ | Valeur par défaut |
|---|---|
| `[NOM DU SITE]` | `Promptly` |
| Slogan | `Vos idées. En vidéo.` |
| Bouton final | `Commencer gratuitement` |
| URL affichée | `promptly.studio` |
| Couleur d'accent | violet électrique `#8B5CF6` |
| Couleur secondaire (dégradés, particules) | cyan `#22D3EE` |
| Chiffre clé | `12 400` créateurs formés (le compteur s'arrête dessus) |
| Prompt d'exemple tapé à l'écran | `Un astronaute surfe sur une vague de néon, plan large, lumière dorée` |

## 1. Contraintes techniques

- **1920×1080, 60 fps, 1200 frames (20 s)**, H.264, CRF 16, `yuv420p`.
- Police **Inter** embarquée via `@fontsource/inter` (graisses 400 à 800), avec SF Pro en repli. Titres en **800**, letter-spacing négatif (-0,03em).
  - Bloque le rendu avec `delayRender` / `continueRender` jusqu'à ce que `document.fonts.load()` soit résolu pour chaque graisse.
- Versions exactes dans `package.json` (pas de `^`) : `remotion`, `@remotion/cli` (même version), `react@18.3.1`, `react-dom@18.3.1`, `typescript`.
- **Aucune image ni vidéo téléchargée** : toutes les maquettes (site, lecteur vidéo, éditeur, vignettes « générées par l'IA ») sont dessinées en JSX/CSS/SVG.
  - Les vignettes vidéo sont des compositions abstraites : dégradés, formes, soleil, horizon, silhouettes en SVG.
- Fond **presque noir** (`#030305` aux bords) avec un léger dégradé radial plus clair au centre (`#120F24`), plus deux nébuleuses floues de la couleur d'accent qui dérivent lentement.
- Si le dossier contient déjà un projet Remotion du même style (iPhone 3D, `src/config.ts`, `src/lib/motionBlur.tsx`…), **réutilise ses utilitaires et son architecture** dans une nouvelle composition `PubSite`, au lieu de tout réécrire.

## 2. Architecture du code

```
src/
├── config.ts          ← TOUT ce qui se personnalise : textes, couleurs, chiffres, durées des scènes
├── Pub.tsx            ← enchaînement des scènes + fondus + caméra globale + grain
├── Root.tsx, index.ts, fonts.ts
├── scenes/            ← UN composant par scène (Scene1Browser.tsx … Scene6Logo.tsx)
├── components/        ← Laptop3D / Browser3D, FlatBrowser, Logo, Background, Grain
├── ui/                ← maquettes du site (Landing, LessonPlayer, PromptStudio, Timeline, Community)
└── lib/               ← utils (couleurs, easing, glow), contexte de scène, flou de mouvement
```

### `config.ts`

Il exporte un objet `CONFIG` qui contient : `siteName`, `tagline`, `ctaLabel`, `url`, `accent`, `accent2`, `background`, `fontFamily`, `prompt`, `stat` (`value`, `label`, `suffix`), `screens[]` (légendes), `durations` (en secondes, par scène), `transition`, `fps`, `width`, `height`.

- `TOTAL_FRAMES` = somme des durées → c'est la durée de la composition.
- Toute la palette (clair, pâle, foncé, `rgba`) est **dérivée** de `accent` / `accent2` par des fonctions `mix()` / `rgba()`. Changer une couleur ne doit demander qu'une seule modification.

### Enchaînement des scènes (`Pub.tsx`)

- Chaque scène est une `<Sequence>` qui démarre `PAD` frames avant son début officiel et finit `PAD` frames après, avec `PAD = transition / 2`.
- Un contexte `useScene()` fournit `{ frame (locale, 0 = début officiel, négative pendant l'entrée), duration, absFrame, fps }`.
- Un composant `SceneSlot` applique les fondus d'entrée et de sortie, avec trois styles :
  - `none` : pas de fondu ;
  - `dissolve` : opacité seule ;
  - `blur` : opacité + flou jusqu'à 16 px + zoom de 1,08 → 1 à l'entrée, et de 1 → 0,94 à la sortie.
- Ordre de rendu : la scène suivante est au-dessus.
- **Caméra globale** sur toutes les scènes : zoom continu de 1 → 1,06 sur les 20 s, rotation `sin(t·0,35)·0,7°`, légère dérive x/y. **La caméra ne doit jamais être totalement immobile.**

## 3. Scénario (≈ 20 s)

Les frames indiquées sont **locales à chaque scène**, à 60 fps.

### Scène 1 — 0 → 3 s : le laptop arrive (`intro`, 3 s)

- Un **MacBook en CSS 3D** :
  - écran incliné en `rotateX` sur une charnière, coins arrondis, bezel noir fin, encoche caméra ;
  - base en aluminium faite d'une **pile de 12 à 14 couches** arrondies avec `translateZ` pour donner l'épaisseur ;
  - reflet glissant sur la vitre (`linear-gradient` 115° dont la `background-position` suit la rotation).
- **Entrée** :
  - `spring({ damping: 22, stiffness: 48, mass: 1.25 })` sur environ 140 frames ;
  - rotation Y de 200° → -18°, Y de +800 → 0, Z de -1400 → 0 ;
  - puis pose « posée, légèrement de 3/4 », avec un flottement sinusoïdal permanent calculé sur le **temps absolu** (pour que la scène 2 reprenne exactement la même pose).
- **Flou de mouvement** = vitesse instantanée (`valeur(f) − valeur(f−1)`) × coefficient, plafonné à 9 px.
- **Écran : la landing page du site**, dont les blocs apparaissent en cascade (fade-up décalé de 5 frames entre chaque bloc) :
  - nav avec logo, liens et bouton ;
  - grand titre « Créez des vidéos IA dignes du cinéma » ;
  - sous-titre ;
  - champ de prompt avec bouton « Générer » ;
  - rangée de 3 cartes de cours avec vignettes SVG, durée et niveau ;
  - barre de progression « Module 3/8 ».
- Un halo d'accent derrière l'appareil et un reflet ellipse flou au sol apparaissent avec le ressort.

### Scène 2 — 3 → 6,5 s : plongée dans l'écran (`dive`, 3,5 s)

- La caméra **plonge dans l'écran** : l'écran se redresse (rotations → 0) et grossit (×1 → ×2,6) en `easeInOut` sur 80 frames. Le laptop se dissout ensuite (opacité + flou jusqu'à 10 px), avec un **flash** radial d'accent au passage de la vitre.
- Les **blocs de l'interface sortent de l'écran** : chaque élément de la landing est défini **une seule fois** dans un tableau `{ key, x, y, w, h, node }`, partagé avec la maquette.
  - Chaque élément part de sa position à l'écran × l'échelle courante.
  - Il rejoint une cible 3D `{ x, y, z, rotX, rotY, scale }`, en ressort décalé de 2-3 frames par élément.
  - Puis il dérive doucement (sinus sur x, y et z).
- **Profondeur de champ** : `blur = clamp(|z + camZ − focusZ| / 55, 0, 14)`, plus un flou de mouvement proportionnel à la vitesse.
  - Le plan de netteté `focusZ` glisse vers **le champ de prompt**, la vedette de la scène suivante.
- Le monde 3D a sa propre caméra : orbite lente en `rotateY` de +7° → -7°, travelling avant continu.

### Scène 3 — 6,5 → 10 s : la génération IA, moment « waouh » (`generate`, 3,5 s)

- Le **champ de prompt** occupe le centre en grand : carte vitrée, bord lumineux, icône étincelle.
- Le prompt d'exemple **se tape lettre par lettre** :
  - environ 2 caractères par frame au départ, en ralentissant ;
  - le caret clignote ;
  - les lettres apparaissent avec un léger fade et un flou de 4 → 0 px.
- Le bouton **« Générer »** est enfoncé (scale 0,94 puis ressort), puis une **traînée néon** fait le tour du contour du champ.
  - Recette : SVG `<rect rx pathLength=1>` avec `strokeDasharray="0.16 0.84"` et `strokeDashoffset` animé.
  - Trois couches superposées : bloom large flouté (`feGaussianBlur` 14), halo moyen (flou 4), cœur blanc fin plus court en tête de comète.
  - Une seconde traînée, plus faible, part à l'opposé.
- La traînée « déverse » sa lumière dans une **vignette vidéo 16:9** qui se génère sous le champ :
  - une barre de progression avec pourcentage qui monte jusqu'à 100 % ;
  - l'image se révèle par **balayage diagonal** (`clip-path`) et passe du flou au net : un paysage néon abstrait en SVG (soleil dégradé, horizon, vague, silhouette d'astronaute faite de formes simples) ;
  - à 100 %, une **onde de choc** (bordure qui s'agrandit et s'efface) et un badge « Prête en 12 s » qui pop.

### Scène 4 — 10 → 13,5 s : le chiffre clé (`stat`, 3,5 s)

- Grande carte en 3D légère (rotateX ≈ 4-6°, rotateY oscillant de ±4°) qui arrive du fond (Z -500 → 0, ressort).
- **Compteur** de 0 → `CONFIG.stat.value` en `easeOut` sur environ 105 frames :
  - format français avec espace fine (`12 400`) ;
  - **flou de mouvement vertical sur les chiffres** proportionnel à leur vitesse (SVG `feGaussianBlur stdDeviation="0 y"`).
- Label « créateurs formés ».
- Trois mini-stats en dessous apparaissent en cascade : « 120 leçons », « 4,9 ★ » (étoile dessinée en SVG, pas d'emoji), « Certificat inclus ».
- Une rangée d'avatars dessinés (initiales sur dégradés) qui se chevauchent.
- Même traînée néon sur le contour. À la fin du compteur : onde de choc et glow qui s'intensifie.

### Scène 5 — 13,5 → 16,5 s : le parcours (`screens`, 3 s)

- **Trois écrans** du site dans des fenêtres de navigateur plates (barre d'onglets, 3 pastilles, URL `CONFIG.url`) :
  1. **Lecteur de leçon** : vidéo, chapitres, progression ;
  2. **Éditeur / timeline** : pistes colorées, playhead, waveform en SVG ;
  3. **Communauté / certificat** : galerie de créations, badge.
- Les trois sont posés dans **un même plan 3D** (`rotateY ≈ -24°`, `rotateX ≈ 8°`) qui **défile latéralement** (translateX +560 → -560, `ease` doux), avec un **flou de mouvement horizontal directionnel** proportionnel à la vitesse.
- Ils sont reliés par des **lignes de lumière** : courbes de Bézier cubiques dans le même plan, qui se tracent via `strokeDashoffset`.
  - Chaque ligne a un bloom flou, un trait fin, des impulsions blanches qui circulent (dasharray animé), des nœuds lumineux aux extrémités, plus deux lignes qui partent hors champ.
- **Particules** le long des lignes : position calculée avec la formule de Bézier et `random(seed)` de Remotion (jamais `Math.random`), fade selon `sin(u·π)`, halo + cœur blanc.
- Légendes sous chaque écran, depuis `CONFIG.screens` : « Apprenez », « Créez », « Partagez ».
- **Dernières 48 frames** : tout converge vers le centre (écrans resserrés, échelle → 0,22, flou) et un point lumineux grossit au centre.

### Scène 6 — 16,5 → 20 s : logo et appel à l'action (`outro`, 3,5 s)

- Environ 90 **traînées de particules** convergent vers le centre depuis un rayon de 700 à 1400 px.
  - Ce sont des segments entre la position à `f` et à `f−3` : c'est ça qui donne le flou de mouvement.
  - Délais aléatoires, `ease in`.
  - Puis un **cœur lumineux** s'allume au centre.
- Le **logo se dessine en trait lumineux** :
  - un carré arrondi, puis un triangle « play » qui contient une petite étincelle à 4 branches ;
  - tracé via `pathLength=1` + `strokeDashoffset`, avec une copie floutée dessous pour le bloom ;
  - puis le logo se **remplit** d'un dégradé accent → accent2, et le trait du play devient blanc.
- Le logo glisse vers la gauche (ressort) et **le nom du site** apparaît à côté :
  - révélation par `clip-path` de gauche à droite, avec un flou de 10 → 0 px ;
  - texte en dégradé blanc → accent pâle, glow en `drop-shadow` (pas en `text-shadow`, qui salit le texte clippé) ;
  - la largeur du nom est mesurée avec un `canvas.measureText` pour un centrage exact.
- Le slogan apparaît en fondu en dessous, puis le bouton **« Commencer gratuitement »** fait un **léger pop** :
  - ressort `damping: 10, stiffness: 150` ;
  - glow empilé ;
  - un reflet qui balaie le bouton ;
  - l'URL en petit dessous.
- Respiration très légère (scale ±1,2 %) jusqu'à la dernière frame. **Pas de fondu au noir.**

## 4. Signature visuelle (à respecter partout)

- **Mouvements** : ressorts amortis ou courbes de Bézier douces (`0.65,0,0.35,1` / `0.16,1,0.3,1`). Jamais de mouvement linéaire visible, sauf les rotations continues lentes.
- **Motion blur** : uniquement sur les mouvements rapides, toujours calculé depuis la vitesse réelle. Un filtre à 0 doit être retiré (performances).
- **Glow / bloom** sur tout ce qui est accent : `box-shadow` empilés (8 / 28 / 80 px), `drop-shadow` sur les SVG, copies floutées des traits.
- **Grain** très léger sur toute la vidéo : SVG `feTurbulence` `fractalNoise`, `baseFrequency` 0,85, `seed = frame % 24`, opacité 0,07, `mix-blend-mode: overlay`. Plus un vignettage radial.
- **Maquettes** : cartes vitrées (`rgba(255,255,255,0.06)`, bordure `rgba(255,255,255,0.08)`, rayon 22, ombre interne de 1 px). Textes blancs, gris secondaire `#8B93A7`, icônes en SVG `stroke` arrondi. **Pas d'emoji** (pas de police emoji au rendu).
- **3D CSS** : `transform-style: preserve-3d` sur les conteneurs 3D.
  - Attention : un `filter` aplatit ses enfants. Mets les flous sur un wrapper **au-dessus** du conteneur qui porte `perspective`, ou sur des éléments plats.
- Tout est **déterministe** : temps dérivé de `useCurrentFrame()`, aléatoire via `random('seed')`.

## 5. Vérification avant le rendu final

1. `npx tsc --noEmit` sans erreur.
2. Bundle une fois (`npx remotion bundle`), puis génère des **stills à mi-résolution** (`--scale=0.5`) à des frames clés de chaque scène et aux transitions, par exemple : 20, 100, 200, 260, 330, 420, 500, 560, 640, 720, 800, 900, 990, 1060, 1150, 1199.
3. **Regarde ces images** et corrige : texte coupé ou qui déborde, 3D cassée, élément invisible, fondu qui laisse un trou noir, logo et nom mal centrés.
4. Rendu final : `npx remotion render PubSite out/pub-site.mp4 --concurrency=4`.
5. Vérifie avec `ffprobe` : 1920×1080, 60 fps, 20,0 s. Extrais 5 images de la vidéo finale pour un dernier contrôle visuel.

## 6. À la fin

- Ajoute des scripts npm : `dev` (studio), `render`, `typecheck`.
- Écris un README court : structure, et **comment modifier les textes, les couleurs et la durée** (tout se règle dans `config.ts`).
- Commite le code et la vidéo.
- Réponds-moi avec :
  - les valeurs par défaut utilisées ;
  - un résumé des 6 scènes ;
  - le guide « modifier textes / couleurs / durée ».
