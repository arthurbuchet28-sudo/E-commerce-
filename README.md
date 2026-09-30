# Première Vente

Plateforme de conseils et de formations pour passer de l'idée à la première vente en ligne,
étape par étape, en restant en règle avec le droit français : guides sourcés, parcours « Se
lancer » en 8 étapes, outils de calcul, formations en ligne avec attestation de suivi,
newsletter et back-office.

Ce document s'adresse à la personne qui fait vivre le site, sans être développeuse. Les
commandes à taper sont dans des encadrés gris ; les chemins comme `content/guides/` désignent
des dossiers du dépôt GitHub.

- **Mettre le site en ligne** : suivre [`docs/mise-en-production.md`](./docs/mise-en-production.md).
- **Ce qui reste à écrire ou à vérifier** : [`TODO-CONTENU.md`](./TODO-CONTENU.md), et la
  commande `pnpm prelaunch`, qui liste ce qui bloque encore l'ouverture.

## Comment une modification arrive sur le site

Le site est reconstruit automatiquement par Vercel à chaque modification du dépôt GitHub :

1. Modifiez un fichier (sur github.com : ouvrir le fichier, icône crayon), puis enregistrez-le
   sur une **nouvelle branche** en ouvrant une _pull request_.
2. GitHub vérifie tout seul la modification (typographie, liens, accessibilité, chiffres
   sourcés…) et Vercel publie un **aperçu** privé dont le lien apparaît dans la pull request.
3. Si les vérifications sont vertes et l'aperçu vous convient, fusionnez la pull request
   (_Merge_) : le site en ligne est mis à jour en deux ou trois minutes.

Une vérification rouge indique le fichier et la ligne à corriger ; rien n'est publié tant
qu'elle n'est pas corrigée.

## Au quotidien

### Publier un guide

1. Créer `content/guides/<categorie>/<adresse-du-guide>.mdx` (copier un guide existant).
2. Remplir l'en-tête : titre, description (155 caractères max), réponse courte, catégorie,
   niveau, dates, sources (au moins une), `draft: true`.
3. Écrire le texte. Pour un chiffre ou une règle, utiliser `<Chiffre id="…" />` : la valeur, sa
   source et sa date viennent de `src/data/reference.ts`. Jamais de chiffre inventé : ce qui
   reste à vérifier est balisé `[À VÉRIFIER — source]` et reporté dans `TODO-CONTENU.md`.
4. Relire l'aperçu (les brouillons y sont visibles, avec un badge « Brouillon »).
5. Passer `draft: false` : le guide apparaît en ligne, dans la recherche et le plan du site.

Le glossaire (`content/glossaire/`) et la veille réglementaire (`content/veille/`) fonctionnent
de la même façon ; la FAQ est dans `content/faq.yaml`.

### Ajouter ou modifier une leçon de formation

- **Le texte** d'une leçon est un fichier `content/formations/<formation>/<leçon>.mdx` (même
  syntaxe que les guides). Pour une nouvelle leçon, créez d'abord ce fichier et publiez-le.
- **Le reste** se fait dans le back-office (`/admin → Formations`), sans code : titre, ordre,
  durée, « Fichier du texte » (le chemin du fichier ci-dessus), vidéo, ressources PDF, quiz,
  prix. Une formation ne peut être publiée que si tous les textes de ses leçons existent.
- **Les vidéos** se téléversent dans Bunny Stream ; collez ensuite leur identifiant dans la
  leçon.

### Mettre à jour un chiffre ou une règle

Tout est dans `src/data/reference.ts` : modifier `value`, la source et `checkedAt` (date de
vérification). Tous les guides qui citent ce chiffre sont mis à jour à la publication suivante.
Une vérification échoue si un chiffre n'a pas été revérifié depuis plus de 12 mois : c'est le
signal de la revue annuelle.

### Lire les statistiques

- **Visites** (pages vues, provenance, appareils) : tableau de bord Matomo Cloud. La mesure est
  anonyme et sans cookie ; les visiteurs peuvent s'y opposer depuis « Gérer mes cookies ».
- **Ventes, remboursements, inscrits, taux de complétion et abandons des formations** :
  `/admin` (tableau de bord), avec export CSV des commandes pour la comptabilité.
- **Paiements et virements** : tableau de bord Stripe.
- **Newsletter** : `/admin/newsletter` (inscrits, statut du consentement, export) ; statistiques
  d'ouverture dans Brevo.

### Répondre aux messages et aux demandes

- Messages du formulaire de contact : `/admin/messages` (et par e-mail si `CONTACT_EMAIL` est
  renseigné). Marquez-les « traités ».
- Rétractations : elles sont automatiques (accès fermé, avoir, remboursement, accusé de
  réception). Un remboursement en échec apparaît dans `/admin/achats` avec un bouton pour le
  relancer.
- Demandes sur les données personnelles : un membre peut exporter ou supprimer son compte
  lui-même depuis « Mon compte ».

### Surveiller le site

- **`/statut`** : état des services (comptes, paiements, e-mails, vidéos, tâche quotidienne).
  `/api/sante` sert aux outils de surveillance de disponibilité.
- **Sentry** : chaque erreur technique du site y apparaît, sans donnée personnelle (ni
  adresse e-mail, ni cookie, ni paramètre d'adresse). Réglez dans Sentry une alerte par e-mail
  pour les nouvelles erreurs.
- **GitHub** : un ticket « Liens externes cassés » s'ouvre si une source officielle citée
  n'est plus en ligne (vérification chaque lundi).

### Sauvegardes

Supabase sauvegarde la base chaque jour, et une copie chiffrée indépendante (base et fichiers
PDF) est faite chaque dimanche. Tout est expliqué, y compris la restauration, dans
[`docs/sauvegardes.md`](./docs/sauvegardes.md). La clé de déchiffrement est à garder hors
ligne : sans elle, les sauvegardes sont illisibles.

## Les règles du site

- Aucune promesse de revenus, aucun faux avis, faux compteur, faux stock ou prix barré fictif ;
  aucune case pré-cochée.
- Les formations délivrent une **attestation de suivi** : jamais « diplôme », « certification »
  ni « éligible CPF » (le site n'est pas un organisme de formation certifié).
- Les pages légales (`content/legal/`) sont des **trames à faire valider par un professionnel
  du droit** : un avertissement s'affiche tant que `status: trame`. Les informations de
  l'éditeur se remplissent une seule fois dans `src/config/site.ts`. Si vous modifiez les CGV ou
  les CGU, changez aussi leur numéro de version dans `src/config/legal.ts`.
- Les traitements de données personnelles sont décrits dans `src/data/privacy.ts` (qui alimente
  la politique de confidentialité) et dans `docs/registre-traitements.md` : toute évolution se
  reporte aux deux endroits.
- Ajouter un service externe (outil de chat, vidéo YouTube…) demande d'autoriser son adresse
  dans `src/lib/security/csp.ts`, et de le déclarer comme sous-traitant.

## Pour les développeurs

### Installer et lancer en local

Prérequis : [Node.js 22](https://nodejs.org/), [pnpm](https://pnpm.io/) et Docker (pour
Supabase).

```bash
pnpm install
cp .env.example .env.local   # sans clés, des services simulés sont utilisés
pnpm exec supabase start     # base de données, comptes et e-mails locaux
pnpm exec supabase status    # clés à copier dans .env.local (voir .env.example)
pnpm dev                     # http://localhost:3000
```

Les e-mails ne partent pas vraiment : ils s'affichent dans Mailpit (http://127.0.0.1:54324) si
`EMAIL_PROVIDER=mailpit`. Pour devenir administrateur en local : créer un compte sur le site,
puis `pnpm admin:grant votre@email.fr` (`--remove` pour retirer le rôle).

### Paiements en local

Sans clé Stripe, le paiement est simulé : une page « Paiement simulé » remplace Stripe et passe
par le même webhook signé. Avec un compte Stripe en mode test : renseigner `STRIPE_SECRET_KEY`,
lancer `stripe listen --forward-to localhost:3000/api/stripe/webhook` et copier le secret affiché
dans `STRIPE_WEBHOOK_SECRET`.

### Tâche quotidienne

La séquence de bienvenue de la newsletter et les purges de données tournent chaque jour
(`vercel.json`, protégé par `CRON_SECRET`). En local : `curl http://localhost:3000/api/cron/quotidien`.

### Vérifications

```bash
pnpm check        # lint + types + tests unitaires + build
pnpm db:test      # sécurité de la base (RLS)
pnpm e2e          # tests de bout en bout et d'accessibilité (après pnpm build)
pnpm lighthouse   # notes Lighthouse ≥ 95 sur les pages clés (après pnpm build)
pnpm prelaunch    # ce qui bloque encore la mise en production
```

Elles tournent aussi dans GitHub Actions à chaque pull request : accessibilité WCAG 2.2 AA de
chaque page (mode sombre compris), liens internes, politique de sécurité (CSP), poids des pages
(moins de 150 Ko de JavaScript au premier chargement) et notes Lighthouse.

### Où trouver quoi

- `PLAN.md` : architecture, modèle de données, décisions et journal des phases.
- `CLAUDE.md` : règles de travail et conventions de code.
- `docs/` : design system, registre des traitements, sauvegardes, mise en production.
- `.env.example` : liste commentée des réglages (clés Supabase, Stripe, Brevo, Bunny, Sentry…).
