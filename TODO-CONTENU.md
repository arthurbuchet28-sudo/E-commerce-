# TODO contenu

Liste de toutes les balises `[À COMPLÉTER]`, `[À VÉRIFIER — source]` et `[À VALIDER]` du projet.
Mettre à jour ce fichier à chaque ajout ou suppression de balise.

Vérification rapide : `grep -rn "À COMPLÉTER\|À VÉRIFIER\|À VALIDER" src content docs`

## À compléter

| Emplacement                                                     | Élément                                                                                    | Qui  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| `src/config/site.ts` → `publisher.legalName`                    | Nom et prénom ou dénomination de l'éditeur                                                 | Vous |
| `src/config/site.ts` → `publisher.siret`                        | Numéro SIRET                                                                               | Vous |
| `src/config/site.ts` → `publisher.address`                      | Adresse de l'éditeur                                                                       | Vous |
| `src/config/site.ts` → `publisher.email`                        | E-mail de contact                                                                          | Vous |
| `src/config/site.ts` → `publisher.publicationDirector`          | Directeur de la publication                                                                | Vous |
| `content/formations/**/*.mdx` → `transcript`                    | Transcriptions intégrales des vidéos (à rédiger au tournage)                               | Vous |
| `supabase/seed.sql`                                             | Vidéos des leçons (identifiants Bunny Stream)                                              | Vous |
| `src/config/site.ts` → `hosting.phone`                          | Téléphone de l'hébergeur (mentions légales)                                                | Vous |
| `src/config/site.ts` → `mediator`                               | Médiateur de la consommation désigné (nom et site)                                         | Vous |
| `src/config/site.ts` → `privacyContact`, `accessibilityContact` | Adresses de contact données personnelles et accessibilité                                  | Vous |
| `content/legal/accessibilite.mdx`                               | Résultats d'un audit RGAA (taux, date) ; sous-titres des vidéos                            | Vous |
| `docs/registre-traitements.md`                                  | Responsable, expert-comptable, procédure en cas de violation                               | Vous |
| `src/app/a-propos/page.tsx`                                     | Quelques lignes sur l'éditeur ; transparence sur l'usage de l'IA ; politique d'affiliation | Vous |
| `supabase/seed.sql` → F2 à F7                                   | Textes des 62 leçons, quiz de fin de module, ressources PDF, vidéos                        | Vous |
| Pack « Tout le parcours »                                       | Offre groupée à créer (fonction d'achat multi-formations à développer)                     | Vous |
| `.env` → `CONTACT_EMAIL`                                        | Adresse qui reçoit les messages du formulaire de contact                                   | Vous |

## À vérifier — données de référence (`src/data/reference.ts`)

Les valeurs du cahier des charges sont enregistrées avec `checkedAt: 2026-09-01`. Avant la mise en
ligne : les reconfirmer sur la source officielle, remplacer l'URL générique de chaque source par le
lien exact de la page consultée, et mettre à jour `checkedAt`.

| Clé                                                 | Élément                                                                 | Source à consulter |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ------------------ |
| `micro.tauxCotisationsVente`                        | Taux de cotisations, vente de marchandises (valeur manquante)           | urssaf.fr          |
| `micro.tauxCotisationsServices`                     | Taux de cotisations, prestations de services (valeur manquante)         | urssaf.fr          |
| `tva.seuilVentesDistanceUE`                         | Seuil des ventes à distance intra-UE (OSS)                              | impots.gouv.fr     |
| `conso.fonctionRetractationDate`                    | Référence de l'ordonnance n° 2026-2 et de l'article L221-21             | legifrance.gouv.fr |
| `conso.delaiRemboursement`                          | Délai de remboursement après rétractation (art. L221-24)                | legifrance.gouv.fr |
| `conso.prolongationDefautInformation`               | Prolongation de 12 mois (art. L221-20)                                  | legifrance.gouv.fr |
| `micro.tauxVersementLiberatoireVente` / `…Services` | Taux du versement libératoire (valeurs manquantes)                      | impots.gouv.fr     |
| Toutes les clés                                     | Liens exacts des sources (actuellement : page d'accueil du site source) | —                  |

## À vérifier — contenus

| Emplacement                                                                                      | Élément                                                                                                            | Source à consulter                                     |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `src/config/site.ts` → `domain`                                                                  | Disponibilité du domaine `premiere-vente.fr`                                                                       | Registrar (AFNIC)                                      |
| Liens vers legifrance.gouv.fr, economie.gouv.fr, banque-france.fr, agirpourlatransition.ademe.fr | Ces sites bloquent les vérifications automatiques (anti-robot) : ouvrir chaque lien à la main lors de la relecture | Navigateur (le rapport lychee hebdomadaire les ignore) |
| `content/glossaire/dropshipping.mdx`                                                             | Article L221-15 du Code de la consommation (responsabilité de plein droit)                                         | legifrance.gouv.fr                                     |
| `content/glossaire/kbis.mdx`                                                                     | Document équivalent au Kbis pour une micro-entreprise commerciale                                                  | entreprendre.service-public.fr                         |
| `content/guides/statut-et-creation/micro-entreprise-plafonds-tva-seuils.mdx`                     | Règle des plafonds en cas d'activité mixte                                                                         | urssaf.fr                                              |
| idem                                                                                             | Sortie du régime après deux années consécutives de dépassement                                                     | urssaf.fr                                              |
| idem                                                                                             | Date de basculement à la TVA en cas de dépassement du seuil majoré                                                 | impots.gouv.fr                                         |
| idem                                                                                             | Maintien de la franchise entre seuil et seuil majoré                                                               | impots.gouv.fr                                         |
| `content/guides/legal-et-conformite/droit-de-retractation-fonction-en-ligne.mdx`                 | Exceptions, article L221-28                                                                                        | legifrance.gouv.fr                                     |
| idem                                                                                             | Libellés exacts de la fonction de rétractation en droit français                                                   | legifrance.gouv.fr                                     |
| `content/guides/legal-et-conformite/mentions-legales-site-e-commerce.mdx`                        | Numérotation actuelle des articles de la LCEN                                                                      | legifrance.gouv.fr                                     |
| idem                                                                                             | Registre d'immatriculation à citer (RCS, RNE)                                                                      | entreprendre.service-public.fr                         |
| `content/veille/2026-06-19-fonction-de-retractation.mdx`                                         | Référence de l'ordonnance n° 2026-2                                                                                | legifrance.gouv.fr                                     |
| `src/lib/calc/micro.ts`                                                                          | Messages d'alerte : sortie du régime après deux ans, bascule TVA, maintien de la franchise                         | urssaf.fr, impots.gouv.fr                              |
| `src/app/outils/simulateur-micro-entreprise/page.tsx`                                            | Absence de prorata des seuils de TVA l'année de création                                                           | impots.gouv.fr                                         |
| `src/lib/services/video.ts`                                                                      | Format du jeton de sécurité Bunny Stream (sha256 clé + vidéo + expiration)                                         | docs.bunny.net                                         |
| `src/config/legal.ts` → `waiverText()`                                                           | Texte de l'accord exprès et de la renonciation au droit de rétractation (art. L221-28 13°)                         | legifrance.gouv.fr                                     |
| `supabase/migrations/…_payments.sql` → `withdrawal_eligibility`                                  | Moment où l'exécution « a commencé » (retenu : ouverture d'une première leçon)                                     | legifrance.gouv.fr                                     |
| `src/lib/pdf/InvoiceDocument.tsx`                                                                | Mentions obligatoires des factures (mention « EI », adresse, date de la vente)                                     | entreprendre.service-public.fr                         |
| `src/components/commerce/WithdrawalForm.tsx`                                                     | Informations demandées et libellés de la fonction de rétractation (nom, e-mail, commande)                          | legifrance.gouv.fr                                     |
| `src/lib/services/audience.ts`                                                                   | Points d'accès de l'API Contacts de Brevo (ajout et retrait d'une liste)                                           | developers.brevo.com                                   |
| `src/config/site.ts` → `hosting`                                                                 | Dénomination et adresse de l'hébergeur                                                                             | vercel.com/legal                                       |
| `src/data/privacy.ts` → `processors`                                                             | Entités contractantes, lieux d'hébergement et garanties de transfert de chaque prestataire                         | Contrats (DPA) des prestataires                        |
| `src/data/privacy.ts` → `treatments`                                                             | Durée de conservation de la mesure d'audience exemptée ; journaux de l'hébergeur                                   | cnil.fr, vercel.com                                    |
| `src/data/privacy.ts` → `essentialStorage`                                                       | Durée du cookie de session Supabase                                                                                | supabase.com/docs                                      |
| `src/data/privacy.ts` → `sentry`, traitement `erreurs`                                           | Entité contractante et garanties de Sentry ; durée de conservation des erreurs paramétrée                          | Contrat (DPA) Sentry, réglages du projet               |
| `docs/mise-en-production.md` → Matomo                                                            | Réglages recommandés par la CNIL pour l'exemption de consentement                                                  | cnil.fr                                                |
| `src/data/reference.ts` → `rgpd.conservationPiecesComptables`                                    | Durée de conservation des pièces comptables (art. L123-22 C. com.)                                                 | legifrance.gouv.fr                                     |
| `content/legal/cgv.mdx`                                                                          | Articles L221-28 (exception), garantie légale de conformité, juridiction, mention TVA                              | legifrance.gouv.fr                                     |
| `content/legal/confidentialite.mdx`                                                              | Délai de réponse aux demandes d'exercice des droits                                                                | cnil.fr                                                |
| `content/legal/mentions-legales.mdx`                                                             | Registre d'immatriculation à citer                                                                                 | entreprendre.service-public.fr                         |
| `content/legal/cookies.mdx`                                                                      | Paramétrage Matomo conforme à l'exemption (IP, conservation, pas de recoupement)                                   | cnil.fr                                                |
| `content/legal/accessibilite.mdx`                                                                | Exemption EAA de l'éditeur ; modalités de saisine du Défenseur des droits                                          | defenseurdesdroits.fr                                  |
| `content/legal/*.mdx` → `sources`                                                                | Liens exacts des pages officielles citées                                                                          | Sites officiels                                        |
| `src/data/reference.ts` → `gpsr.dateApplication`, `factureElec.*`, `influence.loi`               | Date d'application du GPSR, calendrier de la facturation électronique, référence de la loi sur l'influence         | eur-lex.europa.eu, impots.gouv.fr, legifrance.gouv.fr  |
| `content/guides/**` (25 nouveaux guides)                                                         | Balises [À VÉRIFIER] dans le texte (articles de loi, seuils, calendriers) : `grep -rn "À VÉRIFIER" content/guides` | Sources citées dans chaque guide                       |
| `content/guides/**` → `sources`                                                                  | Liens exacts des pages officielles (certaines sources pointent vers la page d'accueil du site)                     | Sites officiels                                        |
| `src/data/platforms.ts`                                                                          | Tarifs et commissions de chaque plateforme (non recopiés, lien vers la page officielle)                            | Sites officiels                                        |

## À valider (relecture humaine)

| Emplacement                                       | Élément                                                                                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/guides/**`                               | Les 5 guides de démonstration sont en `draft: true` : à relire puis passer à `draft: false`                                                                      |
| `content/glossaire/**`                            | Les 20 termes sont en `draft: true`                                                                                                                              |
| `content/veille/**`                               | Les 2 entrées de veille sont en `draft: true`                                                                                                                    |
| `content/faq.yaml`                                | Réponses de la FAQ                                                                                                                                               |
| `src/data/parcours.ts`                            | Durées indicatives, objectifs, livrables et checklists des 8 étapes (estimations éditoriales)                                                                    |
| `src/data/parcours.ts`                            | Titres et adresses prévus des guides « à paraître » (repris de la section 5.2)                                                                                   |
| `src/data/quiz-modele.ts`                         | Pondération des réponses du quiz et descriptions des 6 modèles                                                                                                   |
| `src/data/platforms.ts`                           | Appréciations (difficulté, personnalisation, SEO, profils)                                                                                                       |
| `src/data/checklist.ts`                           | Les 50 points de la checklist de lancement                                                                                                                       |
| `src/config/legal.ts` → `CGV_VERSION`             | Version des CGV acceptée à la commande : à mettre à jour avec les CGV définitives (phase 12)                                                                     |
| `src/config/legal.ts` → `CGU_VERSION`             | Version des CGU enregistrée à l'inscription : à mettre à jour quand les CGU définitives seront publiées (phase 12)                                               |
| `supabase/templates/*.html`                       | Textes des e-mails de confirmation, lien de connexion, mot de passe et changement d'adresse                                                                      |
| `supabase/seed.sql`                               | Formations de démonstration : prix (F1 à 49 € TTC), durées, questions de quiz et explications ; F1 ne contient que 2 modules                                     |
| `content/formations/**`                           | Textes des 10 leçons de démonstration                                                                                                                            |
| `src/data/newsletter.ts` → `welcomeSequence`      | E-mails 2 à 5 de la séquence de bienvenue (`draft: true` : jamais envoyés en production avant validation)                                                        |
| `src/data/newsletter.ts` → `LEAD_MAGNET_IDS`      | Choix des 25 points de la checklist offerte                                                                                                                      |
| `src/data/newsletter-consent.ts`                  | Texte de la case newsletter et rythme annoncé (5 e-mails sur deux semaines, puis 1 par semaine au plus)                                                          |
| `src/data/newsletter.ts` → `NEWSLETTER_RETENTION` | Durées de conservation (30 jours sans confirmation, 3 ans après désinscription), à reporter au registre                                                          |
| `content/legal/*.mdx`                             | Les 6 trames (mentions légales, CGV, CGU, confidentialité, cookies, accessibilité) : à faire valider par un professionnel du droit, puis passer `status: valide` |
| `src/data/privacy.ts` → durées                    | Suppression des comptes inactifs, conservation des rétractations, preuves de consentement (12 mois)                                                              |
| `docs/registre-traitements.md`                    | Registre des traitements complet                                                                                                                                 |
| `content/guides/**`                               | Les 30 guides (dont 25 nouveaux) sont en `draft: true`                                                                                                           |
| `content/glossaire/**`                            | Les 82 termes (dont 62 nouveaux) sont en `draft: true`                                                                                                           |
| `supabase/seed.sql` → F2 à F7                     | Programmes, objectifs, durées et prix provisoires (39 à 89 € TTC)                                                                                                |
| `src/lib/contact/topics.ts`                       | Durée de conservation des messages de contact (3 ans)                                                                                                            |
| `docs/sauvegardes.md` → conservation              | Durée de conservation des sauvegardes (proposition : 90 jours pour les archives chiffrées), à reporter au registre                                               |

Rappel : en production, les contenus en `draft: true` ne sont ni affichés, ni indexés, ni listés
dans le sitemap et `llms.txt`.
