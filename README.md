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

## Où trouver quoi

- `PLAN.md` : architecture, modèle de données, phases de développement.
- `CLAUDE.md` : règles de travail et conventions.
- `TODO-CONTENU.md` : tout ce qui reste à compléter ou à vérifier avant la mise en ligne.
- `.env.example` : liste commentée des réglages (clés Supabase, Stripe, Brevo, Bunny…).
