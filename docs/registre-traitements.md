# Registre des activités de traitement — brouillon

> **Brouillon à faire valider** (avocat, juriste ou délégué à la protection des données). Il
> reprend les traitements décrits dans `src/data/privacy.ts`, qui alimente aussi la politique de
> confidentialité : toute modification doit être faite aux deux endroits (un test vérifie que
> chaque identifiant de traitement figure ici).

- **Responsable du traitement :** [À COMPLÉTER — nom, adresse, contact] (voir `src/config/site.ts`)
- **Délégué à la protection des données :** non désigné [À VÉRIFIER — obligation au regard de
  l'activité]
- **Date de création :** 29/09/2026 — **Dernière mise à jour :** 30/09/2026

## Sous-traitants

| Prestataire  | Rôle                                        | Localisation                          | Contrat / garanties            |
| ------------ | ------------------------------------------- | ------------------------------------- | ------------------------------ |
| Supabase     | Base de données, authentification, fichiers | UE (Francfort)                        | [À VÉRIFIER — DPA signé]       |
| Vercel       | Hébergement                                 | Exécution à Paris, société américaine | [À VÉRIFIER — DPA, transferts] |
| Stripe       | Paiement, remboursements                    | [À VÉRIFIER]                          | [À VÉRIFIER — DPA]             |
| Brevo        | E-mails transactionnels et newsletter       | UE [À VÉRIFIER]                       | [À VÉRIFIER — DPA]             |
| Bunny Stream | Vidéos des formations                       | UE [À VÉRIFIER]                       | [À VÉRIFIER — DPA]             |
| Matomo Cloud | Mesure d'audience exemptée                  | UE [À VÉRIFIER]                       | [À VÉRIFIER — DPA]             |
| Sentry       | Surveillance des erreurs techniques         | Région de données UE [À VÉRIFIER]     | [À VÉRIFIER — DPA, transferts] |

## Traitements

### `comptes` — Comptes membres et espace membre

- **Finalité :** créer et gérer le compte, sauvegarder la progression et les simulations.
- **Base légale :** exécution du contrat (CGU).
- **Personnes concernées :** membres.
- **Données :** e-mail, nom affiché (facultatif), mot de passe haché (Supabase Auth), progression,
  simulations, date et version des CGU acceptées.
- **Destinataires :** éditeur ; sous-traitants Supabase, Vercel, Brevo (e-mails de compte).
- **Durée :** jusqu'à la suppression du compte par le membre [À VALIDER — purge des comptes
  inactifs].
- **Mesures :** RLS sur toutes les tables, e-mail confirmé, export et suppression en libre-service.

### `formations` — Accès aux formations et suivi pédagogique

- **Finalité :** ouvrir l'accès, suivre la progression, corriger les quiz, délivrer les
  attestations de suivi.
- **Base légale :** exécution du contrat.
- **Données :** inscriptions, leçons terminées, réponses et scores, attestations.
- **Durée :** jusqu'à la suppression du compte.
- **Mesures :** bonnes réponses jamais transmises au navigateur, ressources servies par liens
  signés de courte durée.

### `commandes` — Commandes, paiements et facturation

- **Finalité :** vendre les formations, encaisser, facturer, tenir la comptabilité.
- **Base légale :** exécution du contrat ; obligation légale (conservation comptable).
- **Données :** nom, e-mail, formations, montants, dates, acceptation des CGV, renonciation
  éventuelle au droit de rétractation (date, version du texte), factures et avoirs.
- **Destinataires :** éditeur, expert-comptable [À COMPLÉTER] ; sous-traitants Stripe, Supabase,
  Vercel, Brevo.
- **Durée :** 10 ans pour les pièces comptables (`rgpd.conservationPiecesComptables`,
  [À VÉRIFIER]), y compris après suppression du compte (le lien au compte est alors effacé).
- **Mesures :** aucune donnée de carte sur le site ; accès accordé uniquement par le webhook
  signé de Stripe.

### `retractation` — Exercice du droit de rétractation

- **Finalité :** recevoir les rétractations, accuser réception, rembourser.
- **Base légale :** obligation légale.
- **Données :** nom, e-mail, numéro de commande, date, état du remboursement.
- **Durée :** avec la commande concernée [À VALIDER].
- **Mesures :** identification sans compte par numéro de commande et e-mail, limitation des
  tentatives.

### `newsletter` — Newsletter et checklist offerte

- **Finalité :** envoyer la newsletter et la séquence de bienvenue.
- **Base légale :** consentement (double opt-in).
- **Données :** e-mail, origine, dates de demande, confirmation et désinscription, version du texte
  de consentement.
- **Durée :** 30 jours sans confirmation ; 3 ans après désinscription pour la preuve
  [À VALIDER].
- **Mesures :** jetons de confirmation hachés à usage unique, désinscription en un clic
  (RFC 8058), purge quotidienne.

### `contact` — Formulaire de contact

- **Finalité :** répondre aux questions, signalements d'erreur et demandes (données, accessibilité).
- **Base légale :** intérêt légitime.
- **Données :** nom, e-mail, sujet, message.
- **Destinataires :** éditeur (back-office `/admin/messages`, e-mail de notification) ; Supabase,
  Vercel, Brevo.
- **Durée :** 3 ans au plus, purge quotidienne [À VALIDER].
- **Mesures :** champ piège, limitation des envois.

### `audience` — Mesure d'audience

- **Finalité :** statistiques de fréquentation pour améliorer le site.
- **Base légale :** intérêt légitime, dans les conditions de l'exemption de consentement CNIL.
- **Données :** pages vues, données techniques, adresse IP tronquée ; aucun cookie.
- **Durée :** [À VÉRIFIER — durée maximale fixée par la CNIL pour l'exemption].
- **Mesures :** opposition possible depuis « Gérer mes cookies ».

### `securite` — Sécurité et prévention des abus

- **Finalité :** limiter les tentatives (rétractation, newsletter, preuves de consentement).
- **Base légale :** intérêt légitime.
- **Données :** empreintes SHA-256 de l'adresse IP et de l'e-mail saisi.
- **Durée :** 24 heures (purge automatique) ; journaux de l'hébergeur [À VÉRIFIER].

### `erreurs` — Surveillance des erreurs techniques

- **Finalité :** détecter et corriger les erreurs du site (serveur et navigateur).
- **Base légale :** intérêt légitime.
- **Données :** adresse de la page sans paramètres, message d'erreur (adresses e-mail et jetons
  masqués avant envoi), date, environnement technique. Aucun cookie, en-tête, contenu de
  formulaire ni utilisateur (`src/lib/monitoring/scrub.ts`). Rien n'est chargé dans le
  navigateur : les erreurs passent par le serveur du site.
- **Durée :** [À VÉRIFIER — durée paramétrée dans Sentry].

### `traceurs` — Preuve des choix sur les traceurs

- **Finalité :** prouver les choix des visiteurs si des traceurs soumis à consentement sont un
  jour ajoutés (aucun en v1).
- **Base légale :** obligation légale.
- **Données :** identifiant aléatoire, choix par finalité, version, date ; pas d'adresse IP.
- **Durée :** 12 mois (purge quotidienne) [À VALIDER].

## Sauvegardes

Les données des traitements ci-dessus sont copiées dans les sauvegardes (`docs/sauvegardes.md`) :
sauvegardes quotidiennes Supabase (UE, 7 jours sur l'offre Pro) et archive hebdomadaire chiffrée
(clé privée conservée hors ligne par le responsable), conservée 90 jours
[À VALIDER — durée de conservation des sauvegardes]. Un compte supprimé disparaît des
sauvegardes à leur expiration.

## Violations de données

Procédure [À COMPLÉTER] : qualification, notification à la CNIL si nécessaire
[À VÉRIFIER — délai], information des personnes, journal des violations.
