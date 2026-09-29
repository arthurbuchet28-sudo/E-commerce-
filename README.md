# Première Vente

Plateforme de conseils et de formations pour passer de l'idée à la première vente en ligne,
étape par étape, en restant en règle avec le droit français.

> Projet en construction. Plan détaillé : [`PLAN.md`](./PLAN.md).
> Ce README sera complété pour un non-développeur (ajouter un guide, une leçon, publier,
> mettre à jour les chiffres) au fil des phases.

## Installer et lancer en local

Prérequis : [Node.js 22](https://nodejs.org/) et [pnpm](https://pnpm.io/).

```bash
pnpm install
cp .env.example .env.local   # facultatif en local : sans clés, des services simulés sont utilisés
pnpm dev                     # puis ouvrir http://localhost:3000
```

## Vérifier que tout fonctionne

```bash
pnpm check   # lint + vérification des types + tests + build
pnpm e2e     # tests de bout en bout et d'accessibilité (après pnpm build)
```

## Ajouter un guide

1. Créer un fichier `content/guides/<categorie>/<adresse-du-guide>.mdx` (copier un guide existant).
2. Remplir l'en-tête : titre, description (155 caractères max), réponse courte, catégorie, niveau,
   dates, sources (au moins une), `draft: true`.
3. Écrire le texte. Pour un chiffre ou une règle, utiliser `<Chiffre id="…" />` : la valeur, sa
   source et sa date viennent de `src/data/reference.ts`.
4. Lancer `pnpm test` : les erreurs indiquent le fichier et la ligne à corriger.
5. Après relecture, passer `draft: false` pour publier.

## Mettre à jour un chiffre ou une règle

Tout est dans `src/data/reference.ts` : modifier `value`, la source et `checkedAt`. Tous les guides
qui citent ce chiffre sont mis à jour au prochain build. Un test échoue si une valeur n'a pas été
vérifiée depuis plus de 12 mois.

## Où trouver quoi

- `PLAN.md` : architecture, modèle de données, phases de développement.
- `CLAUDE.md` : règles de travail et conventions.
- `TODO-CONTENU.md` : tout ce qui reste à compléter ou à vérifier avant la mise en ligne.
- `.env.example` : liste commentée des réglages (clés Supabase, Stripe, Brevo, Bunny…).
