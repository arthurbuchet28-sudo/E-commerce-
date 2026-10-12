# QuizMania 🎯

Plateforme de quiz ludique **en français** : 12 thèmes et un mix aléatoire, 7 modes de jeu, difficulté réglable ou adaptative, animations et sons gratifiants, progression (XP, niveaux, badges) et révision des questions ratées. Elle fonctionne sur ordinateur comme sur mobile, s'installe comme une application (PWA) et se joue hors ligne avec la banque locale. Aucun backend n'est nécessaire.

## Sommaire

- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Ajouter une question](#ajouter-une-question)
- [Ajouter une source de questions](#ajouter-une-source-de-questions)
- [Espace admin](#espace-admin)
- [Hors ligne et installation](#hors-ligne-et-installation)
- [Accessibilité](#accessibilité)
- [Tests et qualité](#tests-et-qualité)
- [Déploiement](#déploiement)
- [Crédits et licences](#crédits-et-licences)
- [Limites connues et évolutions](#limites-connues-et-évolutions)

## Installation

Node 20 ou plus récent est requis.

```bash
npm install
npm run dev               # serveur de développement → http://localhost:5173
npm run build             # build de production dans dist/
npm run preview           # sert dist/ (pour tester la PWA et le hors-ligne) → http://localhost:4173
```

| Script | Rôle |
|---|---|
| `npm test` | tests unitaires et de composants (Vitest + Testing Library) |
| `npm run questions:check` | valide la banque locale : format, doublons, bonne réponse présente dans les choix, catégories |
| `npm run data:wikidata` | régénère les instantanés Wikidata (`src/data/generes/`) |
| `npm run sons` | régénère les effets sonores (`public/sons/*.wav`) |
| `npm run lint:types` | vérification TypeScript (mode strict) |

## Variables d'environnement

Copier `.env.example` en `.env`. Toutes sont facultatives : sans elles, le jeu fonctionne avec la banque locale et les sources gratuites.

| Variable | Rôle |
|---|---|
| `VITE_ADMIN_CODE` | Code d'accès à l'espace admin. Sans code, l'espace admin est désactivé. ⚠️ C'est un simple verrou : la valeur est lisible dans le code envoyé au navigateur. |
| `VITE_OPENQUIZZDB_KEY` | Clé OpenQuizzDB ; sans clé, cette source reste inactive. |
| `VITE_RESTCOUNTRIES_KEY` | Clé REST Countries v5 ; met à jour les populations (les noms français viennent de Wikidata). |
| `VITE_URL_PARTAGE` | Adresse publique de l'application, utilisée dans le QR code des parties entre amis quand la page est affichée dans un cadre (sinon : l'adresse courante). |
| `VITE_LIEN_MULTI` | Lien vers une version où le jeu entre amis est disponible, proposé quand il ne l'est pas ici. |
| `VITE_MULTI_LOCAL` | `1` pour activer le transport « entre onglets » (BroadcastChannel) hors développement, pour tester le multijoueur sur un seul navigateur. |

## Fonctionnalités

### Modes de jeu

| Mode | Règle |
|---|---|
| Classique | 10 ou 20 questions, un thème, une difficulté (ou adaptative) |
| Contre-la-montre | un maximum de bonnes réponses en 60 s, enchaînement automatique |
| Survie | 3 vies ; la difficulté monte d'un cran toutes les 5 questions |
| Blind test | 10 extraits Deezer de 30 s, par époque (années 60-70 à aujourd'hui) ou par style (variété, rap, rock) ; bonus de rapidité doublé |
| Défi du jour | 10 questions tirées avec une graine basée sur la date : identiques pour tout le monde, une fois par jour, avec série de jours consécutifs |
| Duel local | 2 à 4 joueurs sur le même appareil, chacun son tour, écran de passage de relais et podium |
| Entraînement | sans chrono ni score, anecdotes à revoir en fin de partie |
| Révision | les questions ratées sont reposées ; une question réussie sort de la liste |
| Entre amis | chacun sur son téléphone : l'hôte crée un salon, les amis scannent le QR code (ou tapent le code à 4 caractères), l'hôte lance quand tout le monde est là ; mêmes questions et mêmes choix pour tous, classement en direct, nouvelle manche en un clic |

### Jouer entre amis

1. **Accueil → Jouer avec des amis → Créer le salon** : choisir le thème, la difficulté, le nombre de questions et son pseudo.
2. Le salon affiche un **QR code** (généré sur l'appareil) et le code du salon. Les amis le scannent, entrent leur pseudo et apparaissent dans la liste.
3. L'hôte appuie sur **« Tout le monde est là, on lance ! »** : tous les appareils passent à la partie en même temps.
4. Le classement se met à jour à chaque réponse, pendant la partie et sur l'écran de fin ; l'hôte peut enchaîner une **nouvelle manche**.

Fonctionnement : chaque appareil publie sa présence (pseudo, avatar, score, progression) dans un salon temps réel ; l'hôte y ajoute la configuration de la manche et une graine. Les questions sont tirées de la banque locale d'origine avec cette graine (`src/engine/salon.ts`), donc identiques partout sans serveur de jeu. Le transport est abstrait (`src/multi/transport.ts`) : salons temps réel de l'hébergement Claude aujourd'hui, BroadcastChannel entre onglets en développement, Supabase Realtime facile à ajouter.

### Difficulté

Tous les réglages sont dans `src/config/difficulte.ts` :

| | Facile | Moyen | Difficile | Expert |
|---|---|---|---|---|
| Niveau des questions | 1 | 1-2 | 2-3 | 3-4 |
| Choix en QCM | 3 | 4 | 4 | 6 (ou saisie libre) |
| Temps par question | 30 s | 20 s | 15 s | 10 s |
| Jokers | 3 | 2 | 1 | 0 |
| Tolérance aux fautes | large | moyenne | faible | stricte |
| Multiplicateur | ×1 | ×1,5 | ×2 | ×3 |

**Adaptatif** : la difficulté monte après 3 bonnes réponses d'affilée et baisse après 2 erreurs. Jokers : 50/50, indice, passer, +10 s. Les réglages des modes sont dans `src/config/modes.ts`.

### Types de questions

QCM (2 à 6 choix), vrai / faux, saisie libre (tolérante : accents, casse, articles et quelques fautes selon la difficulté, par distance de Levenshtein), image (personnalités, monuments, drapeaux), audio (blind test), chronologie (glisser-déposer ou boutons ↑ ↓ au clavier), estimation (points dégressifs selon l'écart).

### Ambiance

Bouton qui « pop » ou tremble, coche animée, confettis (plus abondants si la réponse est rapide ou la série longue), points qui s'envolent vers le score, combo ×3 / ×5 / ×10 avec flammes, chrono circulaire vert → orange → rouge qui pulse dans les 5 dernières secondes, écran de résultats avec étoiles, feu d'artifice en cas de record et partage du score façon Wordle (🟩🟨🟥⬜). Effets sonores synthétisés (discrets pour une erreur), vibration légère sur mobile. Réglages : son et volume, animations réduites, vibrations, thème clair / sombre / automatique.

### Progression

Tout est enregistré sur l'appareil ; aucun compte n'est nécessaire.

- **Profil** : pseudo et avatar générés localement avec DiceBear.
- **XP et niveaux** : 10 XP par bonne réponse × le multiplicateur de difficulté, 1 XP par erreur, +50 pour une partie parfaite (moitié en entraînement, révision et duel ; ×1,5 au défi du jour). Titres : Curieux, Fouineur, Futé, Érudit, Tête bien faite, Puits de science, Encyclopédie vivante, Légende de QuizMania.
- **27 badges** définis dans `src/config/progression.ts` (ajouter un badge = ajouter une entrée avec sa condition).
- **Statistiques** par catégorie (taux de réussite, catégorie forte, catégorie à travailler), **historique** des 200 dernières parties, **classement local** par mode et par difficulté (joueurs de duel compris).

## Architecture

```
src/
  engine/       logique du jeu, sans React : partie et modes, points, évaluation des réponses,
                sélection, aléatoire à graine, défi du jour, progression, validation, import / export
  providers/    sources de questions (adaptateurs au format normalisé), registre, cache, réseau
    generateurs/   questions générées depuis les données (personnalités, monuments, pays, blind test…)
    wikidata/      requêtes SPARQL et normalisation
  data/         banque locale (questions/*.json), instantanés générés (generes/), départements, blind test
  config/       difficulte.ts, modes.ts, progression.ts (titres, badges), categories.ts
  store/        état Zustand : partie, réglages, records, profil, révision, admin, multi (salon entre amis)
  multi/        transports temps réel du jeu entre amis
  components/   composants d'interface (zones de réponse, chrono, combo, podium…)
  pages/        écrans (accueil, configuration, partie, résultats, progression/, admin/)
  i18n/fr.ts    tous les textes de l'interface
  lib/          effets (confettis, vibrations), sons, préchargement, stockage, installation PWA
scripts/        check-questions, generer-donnees (Wikidata), generer-sons
```

Le moteur (`src/engine`) est pur et testé indépendamment de l'interface. Les pages secondaires, les instantanés de données, les styles d'avatars et les drapeaux sont chargés à la demande.

## Ajouter une question

**Depuis l'espace admin** (voir plus bas), ou directement dans le fichier JSON de la catégorie (`src/data/questions/<categorie>.json`) :

```json
{
  "id": "loc-hi-035",
  "type": "qcm",
  "difficulte": 2,
  "enonce": "En quelle année… ?",
  "choix": ["Bonne réponse", "Mauvaise 1", "Mauvaise 2", "Mauvaise 3"],
  "bonneReponse": "Bonne réponse",
  "anecdote": "Le saviez-vous ? …"
}
```

- Une anecdote est obligatoire.
- Niveaux 1-2 : au moins 4 choix ; niveaux 3-4 : au moins 6 choix (le mode Expert en affiche 6). Ajouter `reponsesAcceptees` permet au mode Expert de poser parfois la question en saisie libre.
- Vrai / Faux : `"type": "vrai_faux"`, `"choix": ["Vrai", "Faux"]`.
- Saisie libre : `"type": "saisie"`, `"bonneReponse": "Berlin"`, `"reponsesAcceptees": ["…"]` (variantes).
- Chronologie : `"type": "chronologie"`, `"bonneReponse": ["le plus ancien", "…", "le plus récent"]` (3 à 6 éléments).
- Estimation : `"type": "estimation"`, `"bonneReponse": 1789`, `"estimation": { "marge": 20, "unite": "mètres", "min": 0, "max": 100 }` : 100 % des points si c'est exact, puis de moins en moins jusqu'à 0 à `marge` d'écart (`min` / `max` affichent un curseur).
- **Jamais de paroles de chansons** (droits d'auteur) : pour la musique, uniquement titre, interprète ou année.
- Puis lancer `npm run questions:check`.

## Ajouter une source de questions

1. Créer `src/providers/ma-source.ts` qui exporte un objet `FournisseurQuestions` (voir `src/providers/types.ts`) : `id`, `categories` couvertes, `partMax` (part maximale d'une partie), `horsLigne`, `estDisponible()` et `recuperer()` qui renvoie des `Question` normalisées. Facultatif : `rafraichirMedia()` pour renouveler un lien expiré.
2. L'ajouter à la liste de `src/providers/index.ts`.
3. Écrire un test de normalisation avec un exemple de réponse réelle dans `src/providers/__tests__/fixtures/`.

Règles communes appliquées par le registre : une source distante qui échoue ou dépasse 4 s est ignorée et la banque locale prend le relais ; les questions sont dédoublonnées ; celles vues récemment sont évitées ; les images sont préchargées et remplacées si elles ne s'affichent pas ; les sources générées en produisent davantage pour garder celles du niveau demandé.

### Sources intégrées

| Source | Contenu | Hors ligne | Activation |
|---|---|---|---|
| Banque locale | 408 questions rédigées, avec anecdotes | oui | toujours |
| Wikidata + Wikimedia Commons | « Qui est-ce ? » en photo (crédit affiché), années de naissance, pays, domaines ; monuments en photo ; années et chronologies d'événements | sans les photos | par défaut |
| Pays du monde (Wikidata, drapeaux `flag-icons`) | drapeaux, capitales, monnaies, populations | oui | par défaut ; REST Countries v5 si clé |
| Départements français | préfectures, numéros, régions | oui | par défaut |
| Deezer (API publique) | blind test : extraits officiels de 30 s | non | par défaut |
| OpenQuizzDB | quiz francophones | non | si `VITE_OPENQUIZZDB_KEY` |
| Open Trivia DB | sciences et géographie, en anglais | non | désactivée : seulement avec un traducteur fiable (`definirTraducteur`) |

Les questions générées ont des mauvaises réponses crédibles (même domaine et même époque pour une personne, même continent pour un pays, même époque et même style pour une chanson).

**Instantanés Wikidata** : `npm run data:wikidata` interroge Wikidata (SPARQL) et Wikimedia Commons (auteur et licence de chaque photo), puis écrit `src/data/generes/*.json`. Seules les personnes et les lieux très connus (beaucoup d'articles Wikipédia) et les dates précises à l'année sont retenus. Si Commons limite le débit, la photo est conservée avec un crédit provisoire et l'application récupère auteur et licence à l'affichage ; relancer le script plus tard complète les crédits (réponses en cache dans `node_modules/.cache/`). Derrière un proxy : `NODE_USE_ENV_PROXY=1 npm run data:wikidata`.

## Espace admin

Accessible par le lien « Espace admin » en bas de page (`#/admin`), avec le code `VITE_ADMIN_CODE`.

- **Questions** : recherche, filtres (catégorie, type, statut), ajout, modification et suppression avec validation (mêmes règles que `questions:check`), restauration.
- **Signalements** : les joueurs peuvent « Signaler cette question » après avoir répondu (erreur, réponse discutable, faute, autre + commentaire) ; l'admin les consulte, ouvre la question, les marque comme traités.
- **Import / export** : import JSON (tableau de questions ou fichiers de la banque) ou CSV (séparateur `;`, listes séparées par `|`), avec aperçu des erreurs ligne par ligne ; export JSON au format des fichiers de la banque, export CSV, export des seules modifications.

Sans backend, les modifications sont conservées **sur l'appareil**, par-dessus les fichiers. Pour les rendre définitives, exporter la banque en JSON et remplacer les fichiers de `src/data/questions/`.

## Hors ligne et installation

L'application est une PWA (`vite-plugin-pwa`) : le bouton « Installer l'application » apparaît dans les réglages sur les navigateurs compatibles. Le code, la banque locale, les instantanés, les drapeaux et les sons sont mis en cache à la première visite ; les photos Wikimedia déjà vues aussi. Hors ligne, tous les modes fonctionnent avec la banque locale, sauf le blind test (les extraits Deezer expirent et ne sont jamais mis en cache), qui affiche un message clair. Pour tester : `npm run build && npm run preview`, puis couper le réseau.

## Accessibilité

- Navigation complète au clavier : touches 1 à 6 pour répondre, Entrée pour valider ou continuer, focus visible, focus déplacé sur le contenu à chaque changement de page.
- Audit axe-core (WCAG 2.1 A/AA + bonnes pratiques) sans violation sur toutes les pages, en thème clair et sombre.
- Textes alternatifs sur les images (neutres pour ne pas donner la réponse), crédits des photos, rôles et libellés ARIA (chrono, progression, jokers, cœurs…), annonces des résultats.
- Graphique des statistiques doublé d'une vue tableau.
- `prefers-reduced-motion` respecté (et réglage « Animations réduites »), son coupable à tout moment.

## Tests et qualité

```bash
npm test                  # 148 tests
npm run questions:check
npm run lint:types
```

Les tests couvrent le calcul des points, la tolérance aux fautes, le mode adaptatif, la survie, le duel, le défi du jour (même graine = mêmes questions), la normalisation de chaque fournisseur (avec de vraies réponses d'API en exemple), les générateurs de questions, la progression et les badges, l'import / export JSON et CSV, et les zones de réponse.

## Déploiement

Le build est statique (`dist/`) et utilise des chemins relatifs et un routage par ancre (`#/…`) : il fonctionne sur n'importe quel hébergement statique (GitHub Pages, Netlify, Vercel…) et dans un sous-dossier, sans configuration de réécriture d'URL.

**GitHub Pages** : le workflow `.github/workflows/pages.yml` teste, construit et publie le site sur la branche `gh-pages` à chaque push (adresse : https://arthurbuchet28-sudo.github.io/E-commerce-/). Le blind test y fonctionne ; le jeu entre amis renvoie vers la version hébergée sur Claude (`VITE_LIEN_MULTI`).

## Crédits et licences

- Photos : Wikimedia Commons (auteur et licence affichés sous chaque photo) ; données : Wikidata (CC0).
- Extraits musicaux : API publique Deezer (extraits officiels de 30 s, aucune parole affichée).
- Drapeaux : [flag-icons](https://github.com/lipis/flag-icons) (MIT).
- Avatars : [DiceBear](https://www.dicebear.com) — styles thumbs, lorelei et notionists (CC0), bottts (libre d'usage).
- Effets sonores : synthétisés par `scripts/generer-sons.ts` (aucun droit tiers).
- Questions de la banque locale : rédigées pour QuizMania.

## Limites connues et évolutions

- Profil, progression, records et modifications admin sont stockés dans le navigateur : vider ses données les efface. L'architecture (fournisseurs, stores séparés, moteur pur) est prête pour **Supabase** : comptes, classement en ligne, banque partagée et multijoueur.
- Jeu entre amis : il faut un transport temps réel. Hébergé sur Claude, les amis doivent avoir accès à la page (partage par e-mail depuis le menu Partager) et être connectés ; sur un hébergement statique classique, brancher un transport Supabase Realtime dans `src/multi/transport.ts`. Le score affiché par chaque joueur est celui que calcule son appareil (pas d'arbitre serveur).
- Le code admin n'est qu'un verrou côté client (pas de sécurité réelle sans backend).
- OpenQuizzDB n'a pas pu être testée sans clé : l'adaptateur suit le format documenté.
- Une partie des photos de l'instantané n'a qu'un crédit provisoire (complété à l'affichage) : relancer `npm run data:wikidata` pour l'enregistrer.
