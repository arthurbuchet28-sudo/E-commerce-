# Design system — deux pistes (phase 2)

Deux pistes pour le concept « le carnet de route de l'entrepreneur ». Contrastes calculés selon
WCAG 2.2 (texte ≥ 4,5:1, composants ≥ 3:1). Les deux ont un mode sombre complet défini par tokens.
Polices : toutes sous licence libre (SIL OFL), auto-hébergées via `next/font/local` (fichiers issus
des paquets Fontsource), aucun appel à Google Fonts.

---

## Piste A — « Carnet de route »

Métaphore : un carnet de voyage annoté. La lecture longue est confortable comme dans un livre ;
le parcours se lit comme un itinéraire. Ton : posé, rassurant, éditorial.

### Palette

| Nom        | Clair     | Sombre    | Rôle                                                             | Contraste                          |
| ---------- | --------- | --------- | ---------------------------------------------------------------- | ---------------------------------- |
| Encre      | `#1C2B4B` | `#9DB4E0` | Structure, titres, bouton principal, liens                       | 13,1:1 sur Papier · 8,6:1 (sombre) |
| Papier     | `#F4F7FB` | `#0F1726` | Fond de page (blanc froid bleuté)                                | —                                  |
| Feuille    | `#FFFFFF` | `#172238` | Surfaces (cartes, encadrés, lecteur)                             | —                                  |
| Anthracite | `#262A31` | `#E3E8F0` | Texte courant                                                    | 13,4:1 · 14,6:1                    |
| Graphite   | `#4A5363` | `#A9B4C6` | Texte secondaire, métadonnées                                    | 7,2:1 · 8,6:1                      |
| Sauge      | `#3F6B55` | `#7FB597` | Progression, validation, étapes faites                           | 5,7:1 · 7,7:1                      |
| Signal     | `#F2C230` | `#F2C230` | Points d'attention juridiques (fond/bordure, texte Encre dessus) | Encre sur Signal : 8,4:1           |

Filets décoratifs `#D3DBE6` ; bordures de champs de formulaire plus foncées (≥ 3:1) définies en phase 2.

### Typographie

- **Literata** (serif variable, conçue pour la lecture sur écran) : titres et corps des guides/leçons.
- **Atkinson Hyperlegible Next** (sans, conçue pour la lisibilité par le Braille Institute) :
  interface, navigation, boutons, formulaires, outils, chiffres.

Échelle (ratio 1,25, base 18 px pour la lecture, 16 px pour l'interface) :

| Token     | Taille                                  | Usage                                    |
| --------- | --------------------------------------- | ---------------------------------------- |
| `display` | 44 px / 2,75 rem (mobile 34 px)         | Titre de l'accueil uniquement            |
| `h1`      | 36 px (mobile 30)                       | Titre de page                            |
| `h2`      | 28 px                                   | Sections                                 |
| `h3`      | 22 px                                   | Sous-sections                            |
| `lead`    | 20 px                                   | Chapô, réponse directe en tête d'article |
| `body`    | 18 px, interligne 1,65, ≤ 68 caractères | Lecture longue                           |
| `ui`      | 16 px                                   | Interface                                |
| `small`   | 14 px                                   | Métadonnées, sources                     |

### Principe de mise en page

- Colonne de lecture centrée (68 caractères) + **marge d'annotations** à droite sur desktop
  (définitions du glossaire, sources, « à retenir »), qui passe sous le paragraphe sur mobile.
- **Élément mémorable : la ligne d'itinéraire.** Le parcours en 8 étapes est une ligne verticale
  continue (Encre) avec des jalons ; la portion parcourue devient Sauge. C'est la seule animation
  orchestrée : la ligne se remplit jusqu'à votre étape à l'arrivée (désactivée si
  `prefers-reduced-motion`).
- Cartes sans ombre : fond Feuille + filet de 1 px ; coins 6 px.

### Wireframe — accueil (desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Première Vente      Se lancer  Guides  Formations  Outils  Ressources   [/] 🔍 [Mon compte] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Passer de l'idée à la première vente en ligne,        ●─ 1 Trouver son idée │
│  étape par étape, en restant en règle.                 │                     │
│                                                        ○─ 2 Valider le marché│
│  Un parcours gratuit en 8 étapes, des guides sourcés,  │                     │
│  des outils de calcul. Sans promesse de revenus.       ○─ 3 Choisir son statut│
│                                                        │   … (ligne          │
│  [ Commencer le parcours gratuit ]                     │    d'itinéraire     │
│  Faire le quiz : quel modèle pour moi ?                ○─ 8 Piloter          │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  Guides à lire en premier                                                    │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐        │
│  │ Statut et création │ │ Légal              │ │ Idée et produit    │        │
│  │ Micro, EI, SASU…   │ │ Mentions légales   │ │ Les 6 modèles      │        │
│  │ 12 min · Débutant  │ │ 9 min · Débutant   │ │ 14 min · Débutant  │        │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Outils de calcul          │  Formation gratuite « Les bases »               │
│  · Prix et marge           │  6 leçons · 1 h 30 · accès avec un compte       │
│  · Simulateur micro        │  [ Voir le programme ]                          │
│  · Seuil de rentabilité    │                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  Notre méthode : sources officielles citées · dates de mise à jour visibles  │
│  · aucun chiffre sans source.  Contenus vérifiés le [date]                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  Checklist : les 25 points à valider avant d'ouvrir     [e-mail] [Recevoir]  │
│  ☐ J'accepte de recevoir la newsletter (désinscription en 1 clic)            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Pied de page : guides · outils · légal · Gérer mes cookies · Se rétracter    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe — leçon (desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Les bases du e-commerce                              Progression ▓▓▓░░░ 50 %│
├───────────────────────┬──────────────────────────────────────────────────────┤
│ Module 1              │  Leçon 3 sur 6 · 12 min                              │
│ ● 1 Panorama          │  Choisir son modèle                                  │
│ ● 2 Les modèles       │  ┌────────────────────────────────────────────┐      │
│ ◐ 3 Choisir son modèle│  │            ▶  Lecteur vidéo (16:9)          │      │
│ ○ 4 Budget réaliste   │  └────────────────────────────────────────────┘      │
│ Module 2              │  [Transcription ▾]  [Sous-titres]                     │
│ ○ 5 Erreurs classiques│                                                       │
│ ○ 6 Plan 30 jours     │  Texte de la leçon (Literata 18 px,   │ Marge :      │
│                       │  68 caractères max)…                  │ « Dropship-  │
│ (sommaire en ligne    │                                       │ ping » : def.│
│  d'itinéraire)        │  ┌ Légal (fond Signal) ────────────┐  │              │
│                       │  │ Vous êtes responsable vis-à-vis  │  │ Source :     │
│                       │  │ du client…                       │  │ DGCCRF, 2026 │
│                       │  └──────────────────────────────────┘ │              │
│                       │  Ressources : Modèle de CGV (PDF)                     │
│                       │  [ Marquer comme terminée ]                           │
│                       │  ← Les modèles              Budget réaliste →         │
└───────────────────────┴──────────────────────────────────────────────────────┘
Mobile : le sommaire devient un tiroir « Sommaire du module (3/6) » en haut.
```

---

## Piste B — « Plan de montage »

Métaphore : une notice de montage technique, précise et rassurante. Chaque action est numérotée,
chaque chiffre est présenté comme sur une fiche de calcul. Ton : net, méthodique, outil de travail.

### Palette

| Nom     | Clair     | Sombre    | Rôle                                                     | Contraste       |
| ------- | --------- | --------- | -------------------------------------------------------- | --------------- |
| Prusse  | `#0B3C5D` | `#7FB8DD` | Structure, titres, bouton principal, liens               | 11,6:1 · 8,8:1  |
| Blanc   | `#FFFFFF` | `#0C1218` | Fond de page                                             | —               |
| Calque  | `#EEF3F7` | `#141D26` | Surfaces, zones d'outils (avec trame de grille légère)   | —               |
| Carbone | `#1B1F24` | `#E6EAEE` | Texte courant                                            | 16,6:1 · 15,6:1 |
| Ardoise | `#4B5560` | `#A3AEB9` | Texte secondaire                                         | 7,6:1 · 7,6:1   |
| Pré     | `#2D7A4B` | `#6CC08B` | Progression, validation                                  | 5,3:1 · 8,6:1   |
| Balise  | `#FFD43B` | `#FFD43B` | Attention juridique (fond/bordure, texte Carbone dessus) | 11,6:1          |

### Typographie

- **IBM Plex Sans** (variable) : titres, texte, interface — une seule famille, graisses 400/600/700.
- **IBM Plex Mono** : numéros d'étapes, chiffres des outils et des résultats (alignement tabulaire),
  références (articles de loi, dates de vérification).

Échelle (ratio 1,2, base 17 px) : `display` 40 px · `h1` 33 · `h2` 27 · `h3` 22 · `lead` 19 ·
`body` 17 px interligne 1,6 (≤ 72 caractères) · `ui` 15 · `small` 13 · `mono` 15.

### Principe de mise en page

- Grille stricte 12 colonnes ; guides en colonne de 8 colonnes + sommaire collant à gauche.
- **Élément mémorable : les grands numéros d'étape en Plex Mono** (72 px, Prusse, trait fin) qui
  structurent parcours, étapes et leçons comme une notice. Pas ailleurs : la numérotation est
  réservée aux vraies séquences.
- Outils présentés comme des fiches de calcul : lignes réglées, total souligné deux fois.
- Seule animation : le remplissage de la barre de progression en segments.

### Wireframe — accueil (desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Première Vente   Se lancer  Guides  Formations  Outils  Ressources  🔍  [Compte] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Passer de l'idée à la première vente en ligne,                               │
│ étape par étape, en restant en règle.                                        │
│ [ Commencer le parcours gratuit ]   Faire le quiz : quel modèle pour moi ?   │
├──────────────────────────────────────────────────────────────────────────────┤
│  01            02            03            04                                │
│  Trouver son   Valider le    Choisir son   Se mettre en                      │
│  idée          marché        statut        conformité                        │
│  ─────────────────────────────────────────────────────────                   │
│  05            06            07            08                                │
│  Créer sa      Paiement,     Premiers      Piloter et                        │
│  boutique      livraison     clients       rentabiliser                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Fiche de calcul (aperçu interactif du calculateur de marge)                  │
│  Coût d'achat ............................................  12,00 €          │
│  Frais de port réels .....................................   4,90 €          │
│  Prix minimum conseillé ..................................  ══════           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Guides à lire en premier (liste en 3 colonnes, sans cartes)                  │
│ Formation gratuite « Les bases » · Méthode et sources · Newsletter           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Pied de page : guides · outils · légal · Gérer mes cookies · Se rétracter    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe — leçon (desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Les bases du e-commerce  ›  Module 1           [▮▮▮▯▯▯] 3 / 6 leçons         │
├──────────────────────────────────────────────────────────────────────────────┤
│  03                                                                          │
│  Choisir son modèle                        12 min · vidéo + texte + quiz     │
│  ┌────────────────────────────────────────────────────────────┐              │
│  │                 ▶  Lecteur vidéo (16:9)                     │              │
│  └────────────────────────────────────────────────────────────┘              │
│  Transcription ▾                                                             │
│                                                                              │
│  Texte de la leçon (Plex Sans 17 px, 72 caractères max)…                     │
│  ┃ Balise (jaune) — Légal : vous êtes responsable vis-à-vis du client…       │
│  Quiz · 4 questions · 80 % pour valider                                      │
│  [ Marquer comme terminée ]                                                  │
│  ← 02 Les modèles                                     04 Budget réaliste →   │
└──────────────────────────────────────────────────────────────────────────────┘
Sommaire du module : bouton « Leçons du module » ouvrant un panneau latéral.
```

---

## Vérification anti-template

| Écueil à éviter                     | A                                       | B                                       |
| ----------------------------------- | --------------------------------------- | --------------------------------------- |
| Crème + serif + terracotta          | Fond blanc bleuté, aucun terracotta     | Sans serif, fond blanc pur              |
| Noir + vert acide                   | Mode sombre bleu nuit, sauge désaturée  | Sombre bleu-noir, vert pré              |
| Cartes SaaS avec ombres et dégradés | Filet 1 px, aucune ombre ni dégradé     | Listes et fiches réglées, pas de cartes |
| Étiquettes en capitales espacées    | Catégorie en casse normale, petit corps | Idem                                    |
| Mot du titre en couleur             | Non                                     | Non                                     |
| Flèches « → » partout               | Seulement précédent/suivant             | Idem                                    |
| Animations d'apparition             | Une seule : ligne d'itinéraire          | Une seule : barre segmentée             |

## Recommandation

**Piste A**. La plateforme est surtout faite de lecture longue (guides, leçons) pour un public
débutant et parfois méfiant : Literata + Atkinson maximisent confort et lisibilité, et la ligne
d'itinéraire incarne directement la promesse « étape par étape ». La piste B est plus forte pour
les outils de calcul ; on peut lui emprunter l'affichage des chiffres en fiche de calcul, avec des
chiffres tabulaires d'Atkinson.
