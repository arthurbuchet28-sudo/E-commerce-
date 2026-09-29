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

## La newsletter

Inscription en deux temps : le visiteur coche la case de consentement, reçoit un e-mail, puis
confirme d'un clic ; la checklist offerte arrive aussitôt. Les e-mails suivants de la séquence de
bienvenue (`src/data/newsletter.ts`) partent grâce à une tâche quotidienne déclarée dans
`vercel.json` (renseigner `CRON_SECRET` sur Vercel). Tant qu'un e-mail est marqué `draft: true`, il
n'est pas envoyé en production. En local, la tâche se lance à la main :
`curl http://localhost:3000/api/cron/quotidien`.

## Le back-office

L'espace d'administration est sur `/admin`. Pour donner le rôle d'administrateur à un compte
existant (créé d'abord sur le site) : `pnpm admin:grant votre@email.fr` (et `--remove` pour le
retirer). Vous pouvez y créer et modifier les formations, les modules, les leçons, les quiz et les
ressources PDF, suivre les ventes, les élèves et la newsletter, et exporter les commandes et les
abonnés en CSV. Le texte d'une leçon reste un fichier `content/formations/<formation>/<leçon>.mdx` ;
une vidéo se téléverse dans Bunny Stream, puis son identifiant se colle dans la leçon.

## Les pages légales

Les mentions légales, CGV, CGU, la politique de confidentialité, la page cookies et la
déclaration d'accessibilité sont des fichiers texte dans `content/legal/`. Ce sont des **trames à
faire valider par un professionnel du droit** : un avertissement s'affiche tant que `status: trame`.
Les informations de l'éditeur (nom, SIRET, adresse, médiateur, contacts) se remplissent une seule
fois dans `src/config/site.ts`. Les traitements de données et les prestataires sont décrits dans
`src/data/privacy.ts` et repris dans `docs/registre-traitements.md`. Si vous modifiez les CGV ou
les CGU, changez aussi leur numéro de version dans `src/config/legal.ts`.

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
les guides). Le titre, l'ordre, la durée, le prix et les questions de quiz se modifient dans le
back-office (`/admin`), sans code.

## Mettre à jour un chiffre ou une règle

Tout est dans `src/data/reference.ts` : modifier `value`, la source et `checkedAt`. Tous les guides
qui citent ce chiffre sont mis à jour au prochain build. Un test échoue si une valeur n'a pas été
vérifiée depuis plus de 12 mois.

## Où trouver quoi

- `PLAN.md` : architecture, modèle de données, phases de développement.
- `CLAUDE.md` : règles de travail et conventions.
- `TODO-CONTENU.md` : tout ce qui reste à compléter ou à vérifier avant la mise en ligne.
- `.env.example` : liste commentée des réglages (clés Supabase, Stripe, Brevo, Bunny…).
