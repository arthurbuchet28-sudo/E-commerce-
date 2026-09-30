# Design system — « Carnet de route »

Choix validé : **piste A « Carnet de route »** + **fiche de calcul** empruntée à la piste B
(voir `docs/design-pistes.md`). Démonstration vivante : `/design-system` (page non indexée).

## Tokens de couleur (`src/app/globals.css`)

Utilisation dans Tailwind : `bg-ink`, `text-muted`, `border-line`, etc. Jamais de couleur en dur.

| Token      | Nom        | Clair     | Sombre    | Rôle                                         | Contraste (clair · sombre)   |
| ---------- | ---------- | --------- | --------- | -------------------------------------------- | ---------------------------- |
| `--ink`    | Encre      | `#1C2B4B` | `#9DB4E0` | Structure, titres, action principale, liens  | 13,1:1 · 8,6:1 sur `--paper` |
| `--paper`  | Papier     | `#F4F7FB` | `#0F1726` | Fond de page                                 | —                            |
| `--sheet`  | Feuille    | `#FFFFFF` | `#172238` | Surfaces                                     | —                            |
| `--text`   | Anthracite | `#262A31` | `#E3E8F0` | Texte courant                                | 13,4:1 · 14,6:1              |
| `--muted`  | Graphite   | `#4A5363` | `#A9B4C6` | Texte secondaire                             | 7,2:1 · 8,6:1                |
| `--sage`   | Sauge      | `#3F6B55` | `#7FB597` | Progression, validation                      | 5,7:1 · 7,7:1                |
| `--signal` | Signal     | `#F2C230` | `#F2C230` | Attention juridique (fond/bordure seulement) | Encre sur Signal : 8,4:1     |
| `--line`   | Filet      | `#D3DBE6` | `#2A3752` | Séparateurs décoratifs                       | décoratif                    |
| `--border` | Contour    | `#7A8699` | `#6B7A94` | Bordures de champs                           | 3,4:1 · 4,1:1 (≥ 3:1)        |
| `--danger` | Alerte     | `#A4262C` | `#F29B9B` | Erreurs                                      | 6,8:1 · 7,5:1                |
| `--focus`  | Focus      | `#2F6FDE` | `#8CB4FF` | Anneau de focus (3 px)                       | 4,4:1 (≥ 3:1)                |
| `--*-soft` | Teintes    | —         | —         | Fonds d'encadrés                             | texte ≥ 10:1                 |

Mode sombre : suit le système (`prefers-color-scheme`) ; `data-theme="light|dark"` force un
thème sur `<html>` ou sur une section.

## Typographie (auto-hébergée, SIL OFL, `public/fonts/`)

Déclarée dans `src/app/globals.css` (`@font-face`). Seules les deux graisses droites sont
préchargées ; les italiques se chargent quand une page en contient. Des polices de secours aux
métriques ajustées limitent le décalage au chargement. Les fichiers sont servis avec un cache
d'un an : changez le nom du fichier si son contenu change.

- **Literata** (`font-serif`) : titres, corps des guides et leçons (classe `.prose-guide`,
  18 px, interligne 1,65, 68 caractères max).
- **Atkinson Hyperlegible Next** (`font-sans`) : interface, formulaires, outils. Chiffres
  tabulaires (`tabular-nums`) dans les outils et la fiche de calcul.

Échelle : `text-display` 44 · `text-h1` 36 · `text-h2` 28 · `text-h3` 22 · `text-lead` 20 ·
`text-body` 18 · `text-ui` 16 · `text-small` 14.

## Composants (`src/components/ui/`)

| Composant                            | Fichier                            | Notes d'accessibilité                                                                      |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Bouton, lien-bouton                  | `Button.tsx`                       | cible ≥ 44 px, verbes d'action précis                                                      |
| Champ texte, sélecteur, case, radios | `Field.tsx`                        | label visible, `aria-describedby` aide + erreur, jamais de case de consentement pré-cochée |
| Encadré info/attention/légal/astuce  | `Callout.tsx`                      | type annoncé par un texte, pas seulement la couleur                                        |
| Carte de guide, carte de formation   | `Cards.tsx`                        | lien étendu : une seule tabulation par carte                                               |
| Badge de niveau                      | `LevelBadge.tsx`                   | libellé textuel                                                                            |
| Barre de progression                 | `ProgressBar.tsx`                  | `role="progressbar"` + valeurs                                                             |
| Ligne d'itinéraire (stepper)         | `RouteStepper.tsx`                 | `aria-current="step"`, statut en texte ; **seule animation**                               |
| Fiche de calcul                      | `CalcSheet.tsx`                    | `<dl>`, chiffres tabulaires ; entourer d'un `aria-live` si dynamique                       |
| Accordéon                            | `Accordion.tsx`                    | `<details>` natif                                                                          |
| Onglets                              | `Tabs.tsx`                         | motif WAI-ARIA, flèches / Début / Fin                                                      |
| Infobulle de glossaire               | `GlossaryTerm.tsx`                 | survol + focus, Échap, WCAG 1.4.13 ; vrai lien sans JS                                     |
| Modale                               | `Modal.tsx`                        | `<dialog>` natif (`showModal`)                                                             |
| Toast                                | `Toast.tsx`                        | région `role="status"` polie, pas de disparition automatique                               |
| Pagination, fil d'Ariane             | `Pagination.tsx`, `Breadcrumb.tsx` | `aria-current="page"`                                                                      |
| Tableau responsive                   | `ResponsiveTable.tsx`              | `<table>` natif, défilement dans une région focusable                                      |
| Lecteur vidéo                        | `VideoPlayer.tsx`                  | pas de lecture auto, sous-titres VTT, transcription obligatoire                            |

## Règles

- Un seul élément mémorable par page ; le reste sobre. Pas d'ombres, pas de dégradés.
- Numérotation réservée aux vraies séquences (parcours, étapes, leçons).
- Une seule animation orchestrée (ligne d'itinéraire) ; `prefers-reduced-motion` respecté.
- Icônes : Lucide (`lucide-react`), toujours `aria-hidden` avec un texte à côté.
