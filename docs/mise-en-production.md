# Mise en production — checklist

À suivre dans l'ordre, en cochant au fur et à mesure. Le script `pnpm prelaunch` vérifie
automatiquement une partie de la liste (textes à compléter, pages légales, brouillons,
configuration) : il doit afficher « Aucun point bloquant » avant l'ouverture.

Comptes à créer, tous en région **Union européenne** : Vercel, Supabase (Francfort), Stripe,
Brevo, Bunny Stream, Matomo Cloud, Sentry (région de données UE, Francfort — à choisir à la
création de l'organisation : elle ne peut plus être changée ensuite, d'après la documentation
Sentry consultée le 30/09/2026).

## 1. Contenu et informations légales

- [ ] `src/config/site.ts` : nom ou raison sociale, SIRET, adresse, e-mail, directeur de la
      publication, médiateur de la consommation, contacts données personnelles et accessibilité.
- [ ] Les 6 pages légales (`content/legal/*.mdx`) relues et validées par un professionnel du
      droit, puis `status: valide`. Changer `CGV_VERSION` / `CGU_VERSION` dans
      `src/config/legal.ts` si leur texte a changé.
- [ ] Registre des traitements (`docs/registre-traitements.md`) complété : responsable, contrats
      de sous-traitance (DPA) signés avec chaque prestataire, durées de conservation.
- [ ] Guides, termes du glossaire et entrées de veille relus : `draft: false` pour ceux à
      publier. Aucun `[À COMPLÉTER]` dans un contenu publié.
- [ ] Chiffres de `src/data/reference.ts` revérifiés sur leur source officielle (`checkedAt` à
      jour) ; lignes « À vérifier » de `TODO-CONTENU.md` traitées.
- [ ] Formations : textes des leçons, quiz, prix validés ; formations à vendre publiées dans
      `/admin` (une formation ne peut être publiée que si tous ses textes existent).
- [ ] Newsletter : e-mails de la séquence de bienvenue relus (`draft: false` dans
      `src/data/newsletter.ts`).
- [ ] Nom de domaine réservé (`premiere-vente.fr` [À VÉRIFIER disponibilité]).

## 2. Supabase (projet de production, région Francfort)

- [ ] Projet créé en région `eu-central-1` (Francfort), offre avec sauvegardes quotidiennes
      (voir `docs/sauvegardes.md`).
- [ ] Migrations appliquées : `pnpm exec supabase link --project-ref <ref>` puis
      `pnpm exec supabase db push`. Ne **pas** charger `seed.sql` (données de démonstration) :
      créez les formations dans `/admin`.
- [ ] _Authentication → URL Configuration_ : Site URL = `https://premiere-vente.fr`, Redirect
      URLs = `https://premiere-vente.fr/**`.
- [ ] _Authentication → Providers → Email_ : confirmation d'e-mail obligatoire, mot de passe de
      10 caractères minimum avec lettres et chiffres (comme `supabase/config.toml`).
- [ ] _Authentication → Emails_ : envoi par le SMTP de Brevo (expéditeur de votre domaine) et
      modèles copiés depuis `supabase/templates/` (confirmation, lien de connexion, mot de passe,
      changement d'adresse).
- [ ] _Storage_ : bucket **privé** `ressources`.
- [ ] Clés récupérées pour Vercel : URL du projet, clé publique (anon/publishable), clé secrète
      (service role / secret).

## 3. Services tiers

- [ ] **Stripe** : compte activé (identité, IBAN), clés **live**. Webhook
      `https://premiere-vente.fr/api/stripe/webhook` avec les événements
      `checkout.session.completed`, `checkout.session.expired` et `charge.refunded` ; copier son
      secret de signature.
- [ ] **Brevo** : domaine d'envoi authentifié (enregistrements SPF, DKIM et DMARC dans le DNS),
      clé API, liste newsletter (identifiant dans `BREVO_NEWSLETTER_LIST_ID`, facultatif).
- [ ] **Bunny Stream** : bibliothèque vidéo, authentification par jeton activée, identifiant de
      bibliothèque et clé de jeton ; vidéos téléversées, identifiants collés dans `/admin`.
- [ ] **Matomo Cloud** : site créé, anonymisation de l'adresse IP et configuration exemptée de
      consentement selon la CNIL [À VÉRIFIER — réglages recommandés par la CNIL].
- [ ] **Sentry** : organisation en région UE, projet Next.js, DSN (hôte en `.de.sentry.io` :
      le site refuse de démarrer sinon) ; durée de conservation réglée et reportée au registre.
- [ ] **Surveillance de disponibilité** (facultatif) : un service qui interroge
      `https://premiere-vente.fr/api/sante` toutes les 5 minutes et vous prévient s'il répond 503.

## 4. Vercel

- [ ] Projet relié au dépôt GitHub, branche de production `main`, région `cdg1`
      (`vercel.json`).
- [ ] Variables d'environnement de **Production** (liste commentée dans `.env.example`) :
      `APP_ENV=production`, `NEXT_PUBLIC_SITE_URL=https://premiere-vente.fr`, Supabase (3),
      Stripe (3), `EMAIL_PROVIDER=brevo`, `BREVO_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`,
      `VIDEO_PROVIDER=bunny`, Bunny (2), Matomo (2), `SENTRY_DSN`, `CRON_SECRET`
      (`openssl rand -hex 32`). Le site refuse de démarrer si l'une manque.
- [ ] Variables de **Preview** : clés Stripe de **test**, `APP_ENV=preview`, projet Supabase de
      test (jamais la base de production).
- [ ] Vérification : `vercel env pull .env.production.local --environment=production` puis
      `pnpm prelaunch --env .env.production.local` (puis supprimer ce fichier).
- [ ] Domaine ajouté dans Vercel et DNS configurés ; HTTPS actif.
- [ ] Tâche planifiée visible dans _Settings → Cron Jobs_ (`/api/cron/quotidien`, tous les
      jours).

## 5. Sauvegardes et surveillance

- [ ] Clé de chiffrement des sauvegardes créée et rangée hors ligne en deux exemplaires ;
      secrets du workflow « Sauvegarde » renseignés ; premier lancement manuel réussi
      (`docs/sauvegardes.md`).
- [ ] Une erreur de test remonte dans Sentry (par exemple une requête vers `/api/erreurs`
      depuis la console du navigateur sur le site).
- [ ] Rôle administrateur donné : créer votre compte sur le site, puis
      `pnpm admin:grant votre@email.fr` avec les variables de production.

## 6. Recette avant ouverture

- [ ] `pnpm prelaunch --env …` : aucun point bloquant.
- [ ] `/statut` : tous les services « Opérationnel ».
- [ ] Parcours complet sur téléphone et ordinateur : inscription, confirmation par e-mail,
      connexion, formation gratuite, quiz, attestation.
- [ ] Achat réel d'une formation avec votre propre carte : e-mail de confirmation, facture PDF
      (numéro `F…-00001`), accès ouvert ; puis rétractation en ligne : accusé de réception,
      avoir, remboursement visible dans Stripe.
- [ ] Newsletter : inscription, e-mail de confirmation, checklist PDF, désinscription en un clic.
- [ ] Formulaire de contact : message visible dans `/admin/messages` et reçu par e-mail.
- [ ] Aucun cookie déposé sur les pages publiques avant connexion (outils du navigateur →
      Application → Cookies).
- [ ] Google Search Console : domaine vérifié, `https://premiere-vente.fr/sitemap.xml` envoyé.

## 7. Après l'ouverture

- [ ] Première semaine : consulter Sentry et `/statut` chaque jour.
- [ ] Chaque lundi : ticket « Liens externes cassés » éventuel (vérification automatique).
- [ ] Chaque trimestre : exercice de restauration (`docs/sauvegardes.md`), revue des chiffres de
      `reference.ts` (un test échoue au-delà de 12 mois sans vérification).
