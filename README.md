# QuizMania 🎯

Plateforme de quiz ludique en français : thèmes variés, difficulté réglable, animations gratifiantes et rejouable à l'infini. Fonctionne sur ordinateur comme sur mobile, sans backend.

> État : **phase 2 (contenu)** — mode Classique, 408 questions locales, questions générées depuis Wikidata, les pays du monde, les départements français et le blind test Deezer ; types QCM, vrai/faux, image, audio, saisie libre, chronologie et estimation.

## Installation

```bash
npm install
npm run dev          # serveur de développement → http://localhost:5173
npm test             # tests unitaires (Vitest)
npm run questions:check   # valide la banque de questions locale
npm run data:wikidata     # régénère les instantanés Wikidata (src/data/generes/)
npm run build        # build de production dans dist/
```

Node 20 ou plus récent est requis.

## Variables d'environnement

Copier `.env.example` en `.env`. Toutes sont optionnelles : sans elles, le jeu fonctionne avec la banque locale.

| Variable | Rôle |
|---|---|
| `VITE_OPENQUIZZDB_KEY` | Clé OpenQuizzDB ; sans clé, la source reste inactive |
| `VITE_RESTCOUNTRIES_KEY` | Clé REST Countries v5 ; met à jour les populations (les noms français viennent de Wikidata) |
| `VITE_ADMIN_CODE` | Code de l'espace admin (phase 5) — simple verrou, visible dans le bundle |

## Architecture

```
src/
  engine/      logique du jeu, sans React (points, partie, sélection, aléatoire, validation)
  providers/   sources de questions (adaptateurs au format normalisé) + registre
  data/        banque locale (src/data/questions/<categorie>.json)
  config/      difficulte.ts (tous les réglages d'équilibrage), categories.ts
  store/       état Zustand (partie, réglages, records)
  components/  composants d'interface
  pages/       écrans (accueil, configuration, partie, résultats)
  i18n/fr.ts   tous les textes de l'interface
scripts/       check-questions.ts
```

## Sources de questions

| Source | Contenu | Hors ligne | Activation |
|---|---|---|---|
| Banque locale (`src/data/questions/`) | 408 questions rédigées, avec anecdotes | oui | toujours |
| Wikidata + Wikimedia Commons | « Qui est-ce ? » en photo (crédit affiché), années de naissance, pays, domaines ; monuments en photo ; années et chronologies d'événements | sans les photos | par défaut |
| Pays du monde (Wikidata, drapeaux `flag-icons`) | drapeaux, capitales, monnaies, populations | oui | par défaut ; REST Countries v5 si clé |
| Départements français | préfectures, numéros, régions | oui | par défaut |
| Deezer (API publique) | blind test : extraits officiels de 30 s, titre / interprète / année | non | par défaut |
| OpenQuizzDB | quiz francophones | non | si `VITE_OPENQUIZZDB_KEY` |
| Open Trivia DB | sciences et géographie, en anglais | non | désactivée : seulement avec un traducteur fiable (`definirTraducteur`) |

Règles communes : chaque source renvoie le format `Question` normalisé ; une source distante qui échoue ou dépasse 4 s est ignorée et la banque locale prend le relais ; les questions sont dédoublonnées et celles vues récemment sont évitées ; les images sont préchargées et remplacées si elles ne s'affichent pas. Les questions générées ont des mauvaises réponses crédibles (même domaine, même époque, même continent…). **Aucune parole de chanson n'est jamais affichée.**

### Instantanés Wikidata

`npm run data:wikidata` interroge Wikidata (SPARQL) et Wikimedia Commons (auteur et licence de chaque photo), puis écrit `src/data/generes/*.json`. Seules les personnes et les lieux très connus (beaucoup d'articles Wikipédia) sont retenus, et seules les dates précises à l'année. Si Commons limite le débit, la photo est conservée avec un crédit provisoire et l'application récupère auteur et licence à l'affichage ; relancer le script plus tard complète les crédits (les réponses sont en cache dans `node_modules/.cache/`). Derrière un proxy : `NODE_USE_ENV_PROXY=1 npm run data:wikidata`.

## Ajouter une question

Ajouter un objet dans le fichier JSON de la catégorie (`src/data/questions/<categorie>.json`) :

```json
{
  "id": "loc-hi-014",
  "type": "qcm",
  "difficulte": 2,
  "enonce": "En quelle année… ?",
  "choix": ["Bonne réponse", "Mauvaise 1", "Mauvaise 2", "Mauvaise 3"],
  "bonneReponse": "Bonne réponse",
  "anecdote": "Le saviez-vous ? …"
}
```

- Niveaux 1-2 : au moins 4 choix ; niveaux 3-4 : au moins 6 choix (le mode Expert en affiche 6). Ajouter `reponsesAcceptees` permet au mode Expert de poser parfois la question en saisie libre.
- Vrai / Faux : `"type": "vrai_faux"`, `"choix": ["Vrai", "Faux"]`.
- Saisie libre : `"type": "saisie"`, `"bonneReponse": "Berlin"`, `"reponsesAcceptees": ["…"]` (variantes). Casse, accents, ponctuation et articles sont ignorés ; les fautes tolérées dépendent de la difficulté.
- Chronologie : `"type": "chronologie"`, `"bonneReponse": ["le plus ancien", "…", "le plus récent"]` (3 à 6 éléments).
- Estimation : `"type": "estimation"`, `"bonneReponse": 1789`, `"estimation": { "marge": 20, "unite": "mètres", "min": 0, "max": 100 }` : 100 % des points si c'est exact, puis de moins en moins jusqu'à 0 à `marge` d'écart (`min` / `max` affichent un curseur).
- Puis lancer `npm run questions:check`.

## Ajouter une source de questions

1. Créer `src/providers/ma-source.ts` qui exporte un objet `FournisseurQuestions` (voir `src/providers/types.ts`) : `id`, `categories` couvertes, `partMax` (part maximale d'une partie), `horsLigne`, `estDisponible()` et `recuperer()` qui renvoie des `Question` normalisées. Facultatif : `rafraichirMedia()` pour renouveler un lien expiré.
2. L'ajouter à la liste de `src/providers/index.ts`.
3. Écrire un test de normalisation avec un exemple de réponse réelle dans `src/providers/__tests__/fixtures/`.
