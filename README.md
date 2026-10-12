# QuizMania 🎯

Plateforme de quiz ludique en français : thèmes variés, difficulté réglable, animations gratifiantes et rejouable à l'infini. Fonctionne sur ordinateur comme sur mobile, sans backend.

> État : **phase 1 (MVP)** — mode Classique en QCM, 156 questions locales, 4 niveaux de difficulté, jokers, animations, écran de résultats et records locaux.

## Installation

```bash
npm install
npm run dev          # serveur de développement → http://localhost:5173
npm test             # tests unitaires (Vitest)
npm run questions:check   # valide la banque de questions locale
npm run build        # build de production dans dist/
```

Node 20 ou plus récent est requis.

## Variables d'environnement

Copier `.env.example` en `.env`. Toutes sont optionnelles : sans elles, le jeu fonctionne avec la banque locale.

| Variable | Rôle |
|---|---|
| `VITE_OPENQUIZZDB_KEY` | Clé OpenQuizzDB (phase 2) |
| `VITE_RESTCOUNTRIES_KEY` | Clé REST Countries v5 (phase 2) ; sinon jeu de données pays local |
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

- Niveaux 1-2 : au moins 4 choix ; niveaux 3-4 : au moins 6 choix (le mode Expert en affiche 6).
- Vrai / Faux : `"type": "vrai_faux"`, `"choix": ["Vrai", "Faux"]`.
- Puis lancer `npm run questions:check`.

## Ajouter une source de questions

Créer un fichier dans `src/providers/` qui exporte un objet `FournisseurQuestions` (voir `src/providers/types.ts`) renvoyant des `Question` normalisées, puis l'ajouter au tableau `FOURNISSEURS` de `src/providers/registre.ts`. Une source distante est abandonnée au bout de 4 s et la banque locale prend le relais.
