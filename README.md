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

## Lancer l'espace membre en local

L'espace membre utilise Supabase, lancé en local avec Docker :

```bash
pnpm exec supabase start     # première fois : quelques minutes de téléchargement
pnpm exec supabase status    # affiche les clés à copier dans .env.local (voir .env.example)
```

Les e-mails (confirmation d'inscription, lien de connexion, mot de passe) ne partent pas vraiment :
ils s'affichent dans Mailpit, sur http://127.0.0.1:54324.

## Tester les paiements en local

Sans clé Stripe, le paiement est simulé : après « Continuer vers le paiement sécurisé », une page
« Paiement simulé » remplace Stripe (aucune carte demandée). Les e-mails de confirmation et
d'accusé de réception de rétractation s'affichent dans Mailpit si `EMAIL_PROVIDER=mailpit`.

Avec un compte Stripe en mode test : renseigner `STRIPE_SECRET_KEY` et lancer
`stripe listen --forward-to localhost:3000/api/stripe/webhook`, puis copier le secret affiché dans
`STRIPE_WEBHOOK_SECRET`. En production, déclarer le webhook dans le tableau de bord Stripe avec les
événements `checkout.session.completed`, `checkout.session.expired` et `charge.refunded`.

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

## Modifier une leçon de formation

Le texte de chaque leçon est dans `content/formations/<formation>/<leçon>.mdx` (même syntaxe que
les guides). Le titre, l'ordre, la durée, le prix et les questions de quiz sont dans
`supabase/seed.sql` (le back-office de la phase 11 permettra de les modifier sans code).

## Mettre à jour un chiffre ou une règle

Tout est dans `src/data/reference.ts` : modifier `value`, la source et `checkedAt`. Tous les guides
qui citent ce chiffre sont mis à jour au prochain build. Un test échoue si une valeur n'a pas été
vérifiée depuis plus de 12 mois.

## Où trouver quoi

- `PLAN.md` : architecture, modèle de données, phases de développement.
- `CLAUDE.md` : règles de travail et conventions.
- `TODO-CONTENU.md` : tout ce qui reste à compléter ou à vérifier avant la mise en ligne.
- `.env.example` : liste commentée des réglages (clés Supabase, Stripe, Brevo, Bunny…).
