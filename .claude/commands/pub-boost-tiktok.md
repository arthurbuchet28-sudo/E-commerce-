---
description: Génère avec Remotion une pub motion design de 22 s, montée comme par un pro, pour un site imaginaire qui booste la visibilité des comptes TikTok
---

# Mission

Crée dans ce projet Remotion une **publicité de 22 secondes** pour **[NOM DU SITE]**, un site imaginaire qui aide les créateurs à **gagner en visibilité sur TikTok**.

C'est un outil **honnête** : il analyse le compte et les vidéos, détecte les tendances, conseille sur les accroches et les heures de publication, et planifie les posts. Il ne vend **ni faux abonnés, ni bots, ni vues achetées**. Aucun texte de la vidéo ne doit le suggérer.

**Style :** exactement celui de la pub Promptly de ce projet (`src/site/`) : fond presque noir, glow et néons, ressorts doux, 3D CSS, grain léger, typographie Inter grasse.

**Niveau d'exigence :** la vidéo doit donner l'impression d'avoir été **montée par un monteur senior** : rythme calé sur la musique, transitions qui ont du sens, respirations, impact. Agréable à regarder du début à la fin, et impressionnante.

Infos complémentaires éventuelles de l'utilisateur : $ARGUMENTS

## 0. Valeurs par défaut (OBLIGATOIRE)

Si un champ n'est pas fourni, **ne t'arrête pas pour demander** : utilise la valeur par défaut, et liste à la fin celles que tu as utilisées.

| Champ | Défaut |
|---|---|
| `[NOM DU SITE]` | `Viralo` |
| URL | `viralo.app` |
| Slogan | `Fais-toi voir.` |
| Bouton final | `Essayer gratuitement` |
| Accent | orange flamme `#FF6B35` |
| Accent 2 | ambre `#FFD166` |
| Compte d'exemple (fictif) | `@lea.cuisine` |
| Chiffres (fictifs) | vues 214 → `1,2 M` · abonnés `+48 k` · score de viralité `92` |

- **Format principal : 9:16 (1080×1920, 60 fps)**, puisque la vidéo parle de TikTok. Fais aussi une version **16:9** seulement si `$ARGUMENTS` contient « 16:9 » ou « paysage ».
- **Pas d'imitation de marque.** N'utilise ni le logo TikTok, ni sa note de musique, ni son duo de couleurs cyan/rose. Le fil vidéo affiché est une interface **générique** de vidéos verticales (icônes cœur, commentaire, partage, en SVG). Tu peux écrire le mot « TikTok » dans un texte, comme description.
- **Aucune image ni vidéo téléchargée.** Tout est dessiné en JSX/CSS/SVG : profils, vignettes de vidéos (compositions abstraites en SVG), avatars en initiales sur dégradés.

## 1. Réutilise l'existant (lis-le d'abord)

- **Architecture :** reprends celle de `src/site/` : une `config.ts` qui contient tout, un `theme.ts` dont la palette est dérivée de `makePalette()`, un composant par scène, et `useLayout()` pour gérer le 9:16 et le 16:9.
- **Utilitaires à réutiliser :**
  - `src/lib/timeline.tsx` : `SceneTimeline`, `Camera`, fondus `none`/`dissolve`/`blur` ;
  - `src/lib/motionBlur.tsx` : `DirectionalBlur` et `velocity` ;
  - `src/lib/utils.ts` : `ease`, `glow`, `textGlow`, `mix`, `rgba`, `makePalette` ;
  - `src/components/Background.tsx` : `Background` et `Grain` ;
  - `src/site/components/LightTrail.tsx` ;
  - l'iPhone CSS 3D de `src/components/Phone.tsx` (`Phone3D`, `FlatPhone`, écran 384×824) ;
  - `src/fonts.ts`.
- **Nouveaux fichiers** dans `src/boost/` : `config.ts`, `theme.ts`, `PubBoost.tsx`, `scenes/`, `ui/` et `components/`. Ajoute la composition `PubBoost` dans `src/Root.tsx`, ainsi que `PubBoostWide` si la 16:9 est demandée.
- **Musique :** crée `scripts/make-music-boost.py` sur le modèle de `scripts/make-music.py` (voir la section 5).
- **Ne modifie pas** le rendu des compositions existantes (`Pub`, `PubSite`, `PubSiteVertical`, `PubMockup`).

## 2. Grammaire de montage (ce qui fait « monteur senior »)

Applique ces règles partout. Elles comptent plus que la quantité d'effets.

1. **Tout est calé sur la musique, à 120 BPM.** Une mesure dure 2 s (120 frames) et un temps 0,5 s (30 frames).
   - Chaque changement de scène tombe **sur un premier temps de mesure**.
   - Les apparitions secondaires (cartes, chiffres, mots) tombent sur les temps ou les demi-temps.
   - Définis `BEAT = 30` dans la config et exprime tous les timings en temps, pas en frames au hasard.
2. **Structure narrative en 5 actes :** accroche → problème → révélation → preuve → appel à l'action. Le spectateur doit comprendre l'histoire **sans le son**.
3. **Contraste de rythme :** rapide, puis respiration, puis rapide. Après chaque moment intense, laisse **au moins 1 temps de calme** (un plan qui se pose, un texte qui reste lisible). Ne remplis jamais tout l'écran tout le temps.
4. **Transitions qui ont du sens.** Pas de fondu par défaut. Chaque raccord doit être l'un des suivants :
   - **raccord par la forme** : un élément devient le suivant (la ligne plate du compteur devient la courbe du dashboard ; un cercle devient l'anneau du score) ;
   - **whip pan** : déplacement très rapide sur 8-10 frames, avec un `DirectionalBlur` fort (jusqu'à 40 px) dans le sens du mouvement, puis un ressort à l'arrivée ;
   - **zoom traversant** : on plonge dans un élément, et le plan suivant sort de son centre ;
   - **montée de vitesse** : un mouvement ralentit, puis accélère brusquement sur le temps fort (courbe `in` très marquée, et motion blur pendant l'accélération).
5. **Lisibilité :**
   - chaque texte reste à l'écran au minimum **0,4 s par mot, et jamais moins de 1 s** ;
   - au maximum **7 mots** par écran ;
   - une idée par plan ;
   - un mot-clé par phrase est mis en couleur d'accent.
6. **Typographie cinétique :** les titres arrivent **mot par mot** (décalage d'un demi-temps), avec un ressort, un flou de 12 → 0 px et une montée de 30 px. Le mot-clé fait un petit pop (scale 1,15 → 1) sur le temps.
7. **Continuité :** un fil visuel traverse toute la vidéo : **la ligne de lumière orange.**
   - Plate et terne dans le problème ;
   - elle s'enflamme pendant la révélation ;
   - elle devient la courbe de croissance dans la preuve ;
   - elle dessine le logo à la fin.
8. **Caméra jamais immobile :** la `Camera` globale, plus une dérive propre à chaque plan (zoom 1 → 1,04, légère rotation).
   - Les plans « calmes » bougent lentement, les plans « impact » font une petite secousse : 3 à 6 px, amortie en 10 frames, uniquement sur les gros temps forts.
9. **Étalonnage cohérent :**
   - noirs teintés `#07060A`, hautes lumières chaudes, glow orange et ambre ;
   - **2 graisses de police seulement** (800 pour les titres, 500 pour le reste) ;
   - un léger **flash lumineux** (overlay blanc à 12 % → 0 en 6 frames) sur les 3 impacts majeurs, pas plus.
10. **Zones sûres TikTok (9:16) :**
    - rien d'important dans les **250 px du bas** ni dans les **140 px de droite** (légende et icônes de l'app) ;
    - le bouton final est à environ y = 1350 au maximum.

## 3. Scénario (22 s = 11 mesures)

Les frames sont absolues, à 60 fps, avec 1 mesure = 120 frames. Tous les timings doivent être réglables dans la config.

| Mesure | Temps | Acte | Ce qui se passe |
|---|---|---|---|
| 1 | 0 → 2 s | **Accroche** | Sur fond noir, la typographie cinétique **en grand** (Inter 800, ~120 px) : « Ta vidéo a fait » puis, sur le temps 3, **« 214 vues. »**. Le chiffre est en gris, et un petit compteur sous le texte hésite (214 → 215 → 214), comme figé. Accroche émotionnelle immédiate, dès la frame 0 : pas d'intro vide. |
| 2 | 2 → 4 s | **Problème** | **Raccord par la forme** : le « 214 » rétrécit et devient le compteur de vues sur l'écran d'un **iPhone 3D** (`Phone3D`), qui arrive de 3/4. L'écran montre un fil de vidéos verticales générique : la vidéo de `@lea.cuisine` (vignette SVG d'une assiette stylisée), les icônes cœur, commentaire et partage, et le compteur « 214 ». Une **ligne plate et grise** traverse l'écran sous le téléphone, comme un électrocardiogramme sans pulsation. Texte au-dessus : « L'algorithme **ne te voit pas.** » (le mot-clé en gris, pas en accent : c'est le problème). Musique : retenue, juste une nappe et une pulsation sourde. |
| 3 | 4 → 6 s | **Révélation** | Sur le premier temps (4 s) : **impact**, avec flash et secousse. La ligne plate **s'enflamme** de gauche à droite (traînée orange en 3 couches : bloom, halo, cœur blanc), et la musique **entre** (kick et basse). Le téléphone recule et tourne. Texte : « Et si **tout changeait** ? ». À la fin de la mesure, **zoom traversant** dans l'écran du téléphone. |
| 4-5 | 6 → 10 s | **Solution** | On sort du zoom dans le **dashboard du site** : une carte vitrée en 3D légère. L'URL et le logo `[NOM DU SITE]` sont visibles en haut. Puis, temps par temps : **(a)** le profil `@lea.cuisine` est scanné par une barre de lumière qui le balaie ; **(b)** un **anneau « Score de viralité »** se remplit de 0 → 92, avec un compteur qui ralentit et un flou vertical sur les chiffres rapides ; **(c)** trois cartes de recommandations **pop en cascade**, sur les temps : « Meilleure heure : **19 h 12** », « Accroche à retravailler : **0-2 s** », « Tendance détectée : **recette en 15 s** ». Elles flottent en 3D avec de la profondeur de champ. La ligne orange court d'une carte à l'autre. Texte bas d'écran : « Ton compte, **analysé par l'IA.** » |
| 6-7 | 10 → 14 s | **Preuve** (le moment « waouh ») | **Montée de vitesse** : tout ralentit sur 1 temps, silence partiel dans la musique, puis **accélération** sur le premier temps (10 s), avec flash et secousse. La ligne orange devient une **courbe de croissance** qui monte en flèche, avec traînée lumineuse et particules. Le compteur de vues **explose** de 214 → **1,2 M** (format français « 1,2 M », easing `out`, flou vertical sur les chiffres), suivi de « **+48 k abonnés** ». Une cascade de **notifications** (cœurs, commentaires, « @… a commencé à te suivre ») arrive en 3D, de bas en haut, avec flou de mouvement et profondeur de champ. Des cœurs en particules s'échappent du compteur. À la fin, **1 temps de respiration** : le chiffre reste seul, avec un glow qui pulse. |
| 8-9 | 14 → 18 s | **Fonctionnalités** | Montage rapide, **une fonctionnalité par mesure ou demi-mesure**, enchaînées par des **whip pans** sur le temps : **Analyse** (graphique en barres qui pousse), **Tendances** (des bulles de hashtags génériques qui gonflent), **Planification** (un calendrier où trois créneaux s'allument). Chaque écran : un grand mot de 1 à 2 mots et une mini-maquette. Garde 1 s de lisibilité minimum par écran. |
| 10-11 | 18 → 22 s | **Appel à l'action** | Toutes les cartes **convergent** vers le centre (particules en traînées), puis noir presque total pendant 1 demi-temps (**respiration**). Sur le temps fort (19 s) : la ligne orange **dessine le logo** en trait lumineux. Le logo est une flèche montante dans une bulle de lecture, en SVG `pathLength` + `strokeDashoffset`. Il se remplit en dégradé accent → accent 2 sur le temps suivant. Ensuite : le nom du site, le slogan « Fais-toi voir. », le bouton « Essayer gratuitement » qui fait un **léger pop** sur le temps, avec un reflet qui le balaie, et l'URL. Respiration très légère jusqu'à la fin. **Pas de fondu au noir.** La musique finit sur un dernier accord et sa réverbération. |

## 4. Exigences visuelles (comme Promptly)

- Fond `Background` avec la couleur de la config, nébuleuses chaudes, `Grain`, vignettage.
- Cartes vitrées : `rgba(255,255,255,0.06)`, bordure 8 %, rayon 22 à 30, ombre interne. Glows empilés (`box-shadow` 8/28/80 px) sur tout ce qui est accent.
- Flou de mouvement **toujours calculé** à partir de la vitesse réelle (`valeur(f) − valeur(f−1)`), et retiré quand il est sous 0,3 px. Profondeur de champ : `blur = |z − focusZ| / 55`, plafonné à 14 px.
- Tout est déterministe : `random('seed')`, jamais `Math.random()`.
- Pièges 3D déjà rencontrés dans ce projet :
  - pas de `filter` ni d'`opacity` < 1 sur un parent `preserve-3d` (ça aplatit ses enfants) ;
  - un groupe dont tous les éléments sont dans le même plan doit être **plat** ;
  - `scale()` en CSS ne touche pas l'axe Z.
- Les chiffres sont au format français, avec une espace fine insécable (`1,2 M`, `48 k`, `19 h 12`).

## 5. Musique et sound design (OBLIGATOIRE, entièrement synthétisés)

Crée `scripts/make-music-boost.py` (numpy et scipy, aucun sample externe) sur le modèle de `scripts/make-music.py`. Sortie : `public/boost-music.wav`, ajoutée dans la composition avec `<Audio>`.

- **Style :** électro-pop moderne et énergique, mais propre, à **120 BPM**, en tonalité mineure lumineuse (par exemple fa mineur : Fm – Db – Ab – Eb).
- **Structure calée sur le scénario :**
  - **mesures 1-2 :** retenue (nappe filtrée et pulsation sourde) ;
  - **4 s :** impact, la batterie entre ;
  - **10 s :** coupure d'un demi-temps (silence ou filtre fermé), puis drop au maximum (kick, basse, synthé lead, claps) ;
  - **14-18 s :** même énergie, avec un whoosh sur chaque whip pan ;
  - **18 s :** break ;
  - **19 s :** coup sur le logo ;
  - **ensuite :** accord final et queue de réverbération.
- **Sound design synchronisé :**
  - whoosh à chaque transition ;
  - « tic » léger à chaque pop de carte ;
  - riser avant 4 s et avant 10 s ;
  - montée de hauteur en même temps que le compteur qui explose ;
  - « ding » cristallin sur l'arrivée à 1,2 M.
- **Mixage :** sidechain de la nappe et de la basse sur le kick, réverbération synthétique, limiteur doux. Vise un niveau d'environ **-14 LUFS** (le niveau courant sur les réseaux) avec un pic à -1 dBFS. Vérifie avec `ffmpeg -af ebur128`.
- Les repères temporels du script doivent **correspondre exactement** à la config de la vidéo. Mets-les en tête du script et commente-les.
- Ajoute le script npm `"music:boost": "python3 scripts/make-music-boost.py public/boost-music.wav"`.

## 6. Vérification (OBLIGATOIRE)

1. `npx tsc --noEmit` sans erreur.
2. `npx remotion bundle`, puis des stills à `--scale=0.33` sur **chaque temps fort et chaque transition** : 0, 60, 125, 240, 250, 300, 420, 540, 600, 610, 700, 820, 840, 900, 960, 1080, 1100, 1140, 1200, 1319.
3. Regarde chaque image **avec l'œil d'un monteur** et corrige :
   - un texte illisible ou à l'écran trop peu de temps ;
   - un plan vide ou, à l'inverse, surchargé ;
   - une transition qui « saute » au lieu de raccorder ;
   - un élément dans les zones sûres TikTok ;
   - une 3D cassée, un élément coupé.
4. Vérifie la synchro son/image : génère la courbe audio (`showwavespic`) et vérifie que les pics tombent bien aux frames des impacts (4 s, 10 s, 19 s).
5. Rendu final : `npx remotion render PubBoost out/pub-boost.mp4 --concurrency=4`. Ajoute le script npm `render:boost`.
6. `ffprobe` doit indiquer 1080×1920, 60 fps, 22,0 s, et une piste audio AAC. Extrais 6 images de la vidéo finale pour un dernier contrôle.
7. Vérifie que les compositions existantes rendent toujours la même image, sur une frame de chacune.

## 7. À la fin

- Ajoute au README une section courte : comment relancer le rendu et la musique, et comment modifier les textes, les chiffres, les couleurs, le tempo et les timings. Tout se règle dans `src/boost/config.ts`.
- Commite le code, la musique et la vidéo, puis pousse.
- Réponds-moi avec :
  - les valeurs par défaut utilisées ;
  - le déroulé mesure par mesure ;
  - ce qui se règle dans la config ;
  - les limites (par exemple : musique synthétisée, chiffres fictifs).
