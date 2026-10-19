---
description: Génère avec Remotion une vidéo mockup où une main lance la pub Promptly sur un MacBook, qui la joue ensuite à l'écran
---

# Mission

Crée dans ce projet Remotion une nouvelle vidéo **« mockup »** d'environ **25 secondes** :

1. Un MacBook est posé sur un bureau, dans une ambiance sombre et premium.
2. Une **main** entre dans le champ, pose l'index sur le trackpad, déplace le curseur jusqu'au bouton lecture et **clique**.
3. La vidéo **`out/pub-site.mp4`** (la pub Promptly de 20 s déjà générée) **se lance et tourne en entier sur l'écran du laptop**.
4. La caméra se rapproche doucement pendant la lecture, puis recule légèrement à la fin.

Style : le même que les pubs existantes. Premium, type keynote Apple, calme, lumineux, ressorts doux, jamais de coupe sèche.

Infos complémentaires éventuelles de l'utilisateur : $ARGUMENTS

> Si `$ARGUMENTS` contient « tiktok » ou « 9:16 », fais **aussi** la version verticale (voir la section 8). Sinon, seulement la 16:9.

## 0. Avant de commencer (OBLIGATOIRE)

1. **Lis l'existant** et réutilise-le au lieu de réécrire : `src/site/components/Laptop.tsx` (`Laptop3D`, `Glare`, `LID_W`, `LID_H`), `src/site/ui/kit.tsx` (`SCREEN_W` = 1280, `SCREEN_H` = 800), `src/site/theme.ts` (palettes `A` / `B`), `src/site/layout.ts` (`useLayout`), `src/lib/motionBlur.tsx`, `src/lib/utils.ts`, `src/components/Background.tsx` (`Grain`), `src/lib/timeline.tsx` (`Camera`), `src/fonts.ts`.
2. **La vidéo source** :
   - Si `out/pub-site.mp4` n'existe pas, génère-la d'abord : `npx remotion render PubSite out/pub-site.mp4 --concurrency=4`.
   - Copie-la dans `public/pub-site.mp4` : Remotion ne lit les médias qu'à travers `staticFile()`.
   - Récupère sa durée avec `ffprobe` et ne la code jamais en dur : utilise une constante dans la config, qui vaut 1200 frames à 60 fps.
3. **Aucune image ni vidéo téléchargée.** La main, le bureau et le décor sont dessinés en SVG/CSS. Le seul média autorisé est `public/pub-site.mp4`.
4. **Ne modifie pas** les compositions existantes (`Pub`, `PubSite`, `PubSiteVertical`). Leur rendu doit rester identique.

## 1. Fichiers à créer

```
src/mockup/
├── config.ts            ← TOUT ce qui se règle : timings (en secondes), couleurs, teinte de peau, textes, caméra
├── PubMockup.tsx        ← la composition, avec son timeline
├── components/
│   ├── Hand.tsx         ← la main en SVG, articulée (voir la section 4)
│   ├── Desk.tsx         ← bureau + décor + lumières
│   ├── ScreenPlayer.tsx ← lecteur vidéo affiché dans l'écran du laptop
│   └── Cursor.tsx       ← curseur macOS en SVG
└── lib/paths.ts         ← trajectoires (Bézier) de la main et du curseur
```

- Ajoute la composition **`PubMockup`** dans `src/Root.tsx` : 1920×1080, 60 fps, durée = somme des timings de la config.
- Ajoute le script npm `"render:mockup": "remotion render PubMockup out/pub-mockup.mp4"`.

## 2. Scénario et timing (à 60 fps, frames absolues, réglables dans `config.ts`)

| Temps | Frames | Ce qui se passe |
|---|---|---|
| 0 → 1,6 s | 0-96 | **Établissement.** Laptop ouvert sur le bureau, vu de 3/4 (`rotateY` ≈ -16°, `rotateX` ≈ -16°, écran incliné de 10°). La caméra glisse lentement (léger travelling latéral + zoom de 1,00 → 1,03). L'écran affiche le lecteur **en pause** sur la 1ʳᵉ image de la pub, avec un gros bouton ▶ au centre. Le curseur est immobile dans le coin inférieur gauche de l'écran. |
| 1,6 → 2,6 s | 96-156 | **La main entre** depuis le bas à droite, hors champ, sur une courbe de Bézier, avec un ressort (`damping` 20, `stiffness` 60). Elle grossit légèrement en approchant (perspective) et sa vitesse produit un **flou de mouvement**. Son ombre portée sur le bureau la suit, d'abord large et diffuse. |
| 2,6 → 2,9 s | 156-174 | **Le doigt se pose** sur le trackpad : l'index descend, l'ombre de contact se resserre et s'assombrit (de diffuse à nette). |
| 2,9 → 3,5 s | 174-210 | **Le doigt glisse** sur le trackpad (~60 px, `ease inOut`). Le curseur, à l'écran, se déplace **en synchronisation** (même courbe d'easing, amplitude ×4) jusqu'au bouton ▶. Le bouton ▶ grossit un peu au survol (scale 1 → 1,08, glow plus fort). |
| 3,5 → 3,7 s | 210-222 | **Clic.** L'index s'enfonce (la phalange s'écrase de 3 %, le trackpad s'assombrit), puis remonte. Un anneau lumineux s'agrandit sous le doigt sur le trackpad. Un anneau identique apparaît sous le curseur à l'écran. |
| 3,7 → 4,2 s | 222-252 | **Lancement.** Le bouton ▶ fait un pop (1,08 → 1,25) puis disparaît (opacité + flou). La barre de contrôles du lecteur s'efface après 1 s. La vidéo **démarre à la frame 228**. La main se retire en douceur vers le bas à droite, puis sort du champ. |
| 4,2 → 23,8 s | 252-1428 | **Lecture** de la pub entière (1200 frames). La caméra **pousse lentement** vers l'écran pendant les 6 premières secondes de lecture : l'écran passe d'environ 45 % à 70 % de la largeur de l'image, et la rotation du laptop s'adoucit (`rotateY` -16° → -8°). Ensuite, elle ne fait plus que de micro-mouvements (respiration ±0,6 %, dérive lente). Le curseur disparaît 1,5 s après le clic. |
| 23,8 → 25,5 s | 1428-1530 | **Fin.** La vidéo reste sur sa dernière image (le logo Promptly et le bouton « Commencer gratuitement »). La caméra recule légèrement (`ease out`) pour remontrer tout le laptop. Le glow de l'écran sur le bureau reste allumé. **Pas de fondu au noir.** |

## 3. Le lecteur dans l'écran (`ScreenPlayer.tsx`)

- C'est le `children` du `Laptop3D` existant, en 1280×800.
- Fond noir. La vidéo en 16:9 fait 1280×720, centrée, avec deux fines bandes noires de 40 px en haut et en bas.
- **Vidéo** :
  - `<OffthreadVideo src={staticFile("pub-site.mp4")} muted />` dans une `<Sequence from={PLAY_START}>`, à l'intérieur du laptop ;
  - avant le lancement : la même vidéo dans un `<Freeze frame={0}>`, pour afficher la 1ʳᵉ image en pause ;
  - après la fin : `<Freeze frame={durée - 1}>` sur la dernière image ;
  - n'utilise jamais la balise `<Video>` HTML5 (non déterministe au rendu).
- **En pause** :
  - la vidéo est assombrie (`brightness(0.6)`) ;
  - bouton ▶ rond de 120 px au centre : verre dépoli `rgba(255,255,255,0.15)`, bord blanc à 40 %, triangle blanc, glow `A.base` ;
  - barre de contrôles en bas : bouton lecture, barre de progression vide, `0:00 / 0:20`, icônes volume et plein écran en SVG.
- **Pendant la lecture** :
  - la progression avance vraiment selon la frame, et le temps s'affiche en `m:ss` ;
  - les contrôles s'effacent 1 s après le clic.
- Le reflet `Glare` du laptop reste **par-dessus** la vidéo, pour garder l'aspect « vitre ».

## 4. La main (`Hand.tsx`), la partie la plus délicate

Elle doit être **crédible et élégante**, pas cartoon. C'est une **main droite** vue de dessus, de 3/4, l'index tendu, le majeur, l'annulaire et l'auriculaire repliés, avec le pouce sur le côté.

### Construction en SVG (viewBox ~ 600×900, poignet en bas)

- **Paume et dos de la main** : une forme organique (courbes de Bézier, aucun angle vif), plus large aux jointures qu'au poignet.
- **Index** : 3 phalanges séparées, chacune un `<path>` arrondi qui se chevauche avec la suivante. Elles sont articulées par des `<g transform="rotate()">` autour de leurs articulations. Il faut pouvoir **plier légèrement** la dernière phalange au moment du clic.
- **Doigts repliés** : trois formes arrondies superposées, chacune un peu plus sombre que la précédente (occlusion).
- **Pouce** : une forme le long du côté gauche, légèrement en retrait.
- **Ongle** de l'index :
  - forme arrondie, un ton plus clair et plus rose ;
  - fin reflet blanc à 35 % ;
  - c'est la partie la plus proche de la caméra, il doit être net.
- **Manche** au poignet : pull sombre (`#1a1a22` → `#0d0d12`) avec un poignet côtelé, dessiné par quelques lignes à 10 % d'opacité. La manche sort par le bas du cadre.

### Rendu (tout en SVG, sans image)

- **Peau** : `linearGradient` / `radialGradient` à partir d'une teinte de base définie dans la config (défaut `#C8956D`, réglable), avec :
  - des ombres plus foncées et légèrement rouges entre les doigts et sous les phalanges ;
  - des hautes lumières douces sur les jointures et le dessus de l'index.
- **Éclairage par l'écran** : un liseré (rim light) de la couleur d'accent `A.light`, à 25-40 %, sur le bord de la main tourné vers l'écran.
  - Pendant la lecture, son intensité suit doucement la luminosité moyenne de la vidéo. Une approximation sinusoïdale suffit.
  - Il est plus fort quand la main est proche de l'écran.
- **Texture** : un `feTurbulence` très léger (opacité 4 %) fondu dans la peau, pour éviter l'aspect « plastique ».
- **Ombre portée** sur le bureau : une ellipse floue dont le flou, la taille et l'opacité dépendent de la hauteur de la main.
  - Main en l'air : flou 40 px, opacité 0,25.
  - Doigt posé : flou 6 px, opacité 0,55, uniquement sous le bout de l'index.

### Placement 3D

- La main est un calque plat, placé **dans le même espace 3D que le laptop**, au-dessus du trackpad.
- Elle est inclinée pour suivre le plan du bureau (`rotateX` proche de celui de la base, en restant lisible).
- Le bout de l'index doit **toucher visuellement** le trackpad : calcule sa position à partir de la géométrie de `Laptop3D`, pas au jugé.
- **Ordre de profondeur** : la main passe **devant** la base du laptop et ne doit jamais apparaître derrière l'écran.
  - Si le tri 3D de Chrome pose problème, sors la main du contexte `preserve-3d`.
  - Projette alors manuellement la position du trackpad à l'écran (même perspective, même transformation), et place la main en 2D par-dessus, avec sa propre légère perspective.

### Animation

- Pilotée par 4 états interpolés : `approach`, `land`, `slide` et `press`, puis `retreat`.
- La trajectoire est une Bézier dans `lib/paths.ts`.
- Ajoute de **micro-mouvements vivants** : léger tremblé de 1 à 2 px (bruit sinusoïdal composé) et respiration de la rotation de ±0,5°. Une main n'est jamais parfaitement immobile.
- **Flou de mouvement** = vitesse instantanée (position(f) − position(f−1)) × coefficient, plafonné à 10 px. Applique-le avec le `DirectionalBlur` existant, dans la direction du mouvement.

## 5. Le bureau et l'ambiance (`Desk.tsx`)

- **Bureau** :
  - un grand plan en perspective sous le laptop, en bois sombre ou en surface mate anthracite (dégradé `#15131c` → `#0b0a10`) ;
  - un léger grain de matière (`feTurbulence` étiré horizontalement, opacité 6 %).
- **Lumière de l'écran** :
  - un halo coloré sur le bureau devant le laptop (ellipse floue `A.base` / `B.base`, à 18-30 %) qui **pulse doucement pendant la lecture** ;
  - plus faible et blanc-gris tant que la vidéo est en pause ;
  - plus un **reflet** flou et inversé de l'écran sur le bureau, à 8 % d'opacité.
- **Arrière-plan** : un mur très sombre avec 6 à 10 cercles de **bokeh** flous (accent, cyan, ambre chaud), qui dérivent lentement, plus une lampe chaude hors champ suggérée par un dégradé ambre en haut à gauche.
- **Accessoires** discrets, flous car hors de la zone de netteté : une tasse et un carnet, en formes simples dégradées en SVG.
- **Profondeur de champ** : le décor du fond est flou (8-14 px), le laptop et la main sont nets.
- Pour finir, le `Grain` existant et un vignettage, comme dans les autres pubs.

## 6. Signature visuelle (identique aux pubs existantes)

- Mouvements par ressorts amortis ou Bézier douces (`0.65,0,0.35,1` et `0.16,1,0.3,1`). Aucun mouvement linéaire visible.
- Glow et bloom sur ce qui est accent (bouton ▶, anneaux de clic, halo de l'écran) : `box-shadow` empilés et `drop-shadow`.
- Tout est **déterministe** : temps dérivé de `useCurrentFrame()`, aléatoire via `random('seed')`, jamais `Math.random()`.
- Pièges 3D CSS déjà rencontrés dans ce projet, à respecter :
  - un `filter` ou une `opacity` < 1 sur un parent `preserve-3d` **aplatit** ses enfants. Mets-les sur les couches elles-mêmes, ou sur un wrapper au-dessus de celui qui porte `perspective` ;
  - un groupe dont tous les enfants sont dans le même plan doit être **plat**, sans `preserve-3d` : sinon Chrome les trie mal et en coupe une partie.

## 7. Vérification (OBLIGATOIRE avant le rendu final)

1. `npx tsc --noEmit` sans erreur.
2. `npx remotion bundle`, puis des **stills** à `--scale=0.5` aux frames : 30, 120, 160, 190, 214, 226, 260, 400, 700, 1000, 1300, 1430, 1529.
3. Vérifie sur ces images :
   - la main est crédible : proportions, pas de forme cassée, le doigt touche **vraiment** le trackpad ;
   - la main est toujours devant la base et jamais derrière l'écran ;
   - le curseur est sur le bouton ▶ au moment du clic ;
   - **la vidéo avance** : les images à 400, 700 et 1000 montrent des scènes différentes de la pub ;
   - aucun élément coupé, aucun trou noir.
4. Pour la main, génère aussi 2 stills **à pleine résolution** (frames 190 et 214), recadrés sur la main, et itère sur sa forme jusqu'à ce qu'elle soit propre.
5. Rendu final : `npx remotion render PubMockup out/pub-mockup.mp4 --concurrency=4`.
6. `ffprobe` doit indiquer 1920×1080, 60 fps et environ 25,5 s. Extrais 6 images de la vidéo finale pour un dernier contrôle.
7. Vérifie que `Pub` et `PubSite` rendent toujours la même image qu'avant, sur une frame au choix.

## 8. Version verticale (seulement si demandée)

- Ajoute une composition `PubMockupVertical` en 1080×1920, qui utilise **`public/pub-site-tiktok.mp4`** (la version 9:16).
- Pour un écran de laptop, la vidéo verticale s'affiche en pilier : centrée en hauteur, avec des bandes latérales floues qui reprennent la vidéo elle-même, agrandie et floutée à 40 px.
- Le cadrage est serré sur le laptop. La main entre par le bas. Ajoute une accroche texte en haut de l'écran, en Inter 800 : « Regarde ce que l'IA peut créer ».
- Sortie : `out/pub-mockup-tiktok.mp4`.

## 9. À la fin

- Ajoute au README une section courte : comment relancer le rendu, et comment modifier les timings, la teinte de peau, les couleurs et la vidéo affichée. Tout se règle dans `src/mockup/config.ts`.
- Commite le code et la vidéo, puis pousse.
- Réponds-moi avec :
  - un résumé du déroulé ;
  - ce qui se règle dans la config ;
  - les limites éventuelles. Par exemple, la vidéo source est muette, donc le mockup aussi, sauf si on ajoute une musique.
