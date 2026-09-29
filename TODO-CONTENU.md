# TODO contenu

Liste de toutes les balises `[À COMPLÉTER]`, `[À VÉRIFIER — source]` et `[À VALIDER]` du projet.
Mettre à jour ce fichier à chaque ajout ou suppression de balise.

Vérification rapide : `grep -rn "À COMPLÉTER\|À VÉRIFIER\|À VALIDER" src content docs`

## À compléter

| Emplacement                                            | Élément                                    | Qui  |
| ------------------------------------------------------ | ------------------------------------------ | ---- |
| `src/config/site.ts` → `publisher.legalName`           | Nom et prénom ou dénomination de l'éditeur | Vous |
| `src/config/site.ts` → `publisher.siret`               | Numéro SIRET                               | Vous |
| `src/config/site.ts` → `publisher.address`             | Adresse de l'éditeur                       | Vous |
| `src/config/site.ts` → `publisher.email`               | E-mail de contact                          | Vous |
| `src/config/site.ts` → `publisher.publicationDirector` | Directeur de la publication                | Vous |

## À vérifier — données de référence (`src/data/reference.ts`)

Les valeurs du cahier des charges sont enregistrées avec `checkedAt: 2026-09-01`. Avant la mise en
ligne : les reconfirmer sur la source officielle, remplacer l'URL générique de chaque source par le
lien exact de la page consultée, et mettre à jour `checkedAt`.

| Clé                                   | Élément                                                                 | Source à consulter |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------ |
| `micro.tauxCotisationsVente`          | Taux de cotisations, vente de marchandises (valeur manquante)           | urssaf.fr          |
| `micro.tauxCotisationsServices`       | Taux de cotisations, prestations de services (valeur manquante)         | urssaf.fr          |
| `tva.seuilVentesDistanceUE`           | Seuil des ventes à distance intra-UE (OSS)                              | impots.gouv.fr     |
| `conso.fonctionRetractationDate`      | Référence de l'ordonnance n° 2026-2 et de l'article L221-21             | legifrance.gouv.fr |
| `conso.delaiRemboursement`            | Délai de remboursement après rétractation (art. L221-24)                | legifrance.gouv.fr |
| `conso.prolongationDefautInformation` | Prolongation de 12 mois (art. L221-20)                                  | legifrance.gouv.fr |
| Toutes les clés                       | Liens exacts des sources (actuellement : page d'accueil du site source) | —                  |

## À vérifier — contenus

| Emplacement                                                                      | Élément                                                                    | Source à consulter             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| `src/config/site.ts` → `domain`                                                  | Disponibilité du domaine `premiere-vente.fr`                               | Registrar (AFNIC)              |
| `content/glossaire/dropshipping.mdx`                                             | Article L221-15 du Code de la consommation (responsabilité de plein droit) | legifrance.gouv.fr             |
| `content/glossaire/kbis.mdx`                                                     | Document équivalent au Kbis pour une micro-entreprise commerciale          | entreprendre.service-public.fr |
| `content/guides/statut-et-creation/micro-entreprise-plafonds-tva-seuils.mdx`     | Règle des plafonds en cas d'activité mixte                                 | urssaf.fr                      |
| idem                                                                             | Sortie du régime après deux années consécutives de dépassement             | urssaf.fr                      |
| idem                                                                             | Date de basculement à la TVA en cas de dépassement du seuil majoré         | impots.gouv.fr                 |
| idem                                                                             | Maintien de la franchise entre seuil et seuil majoré                       | impots.gouv.fr                 |
| `content/guides/legal-et-conformite/droit-de-retractation-fonction-en-ligne.mdx` | Exceptions, article L221-28                                                | legifrance.gouv.fr             |
| idem                                                                             | Libellés exacts de la fonction de rétractation en droit français           | legifrance.gouv.fr             |
| `content/guides/legal-et-conformite/mentions-legales-site-e-commerce.mdx`        | Numérotation actuelle des articles de la LCEN                              | legifrance.gouv.fr             |
| idem                                                                             | Registre d'immatriculation à citer (RCS, RNE)                              | entreprendre.service-public.fr |
| `content/veille/2026-06-19-fonction-de-retractation.mdx`                         | Référence de l'ordonnance n° 2026-2                                        | legifrance.gouv.fr             |

## À valider (relecture humaine)

| Emplacement            | Élément                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `content/guides/**`    | Les 5 guides de démonstration sont en `draft: true` : à relire puis passer à `draft: false`   |
| `content/glossaire/**` | Les 20 termes sont en `draft: true`                                                           |
| `content/veille/**`    | Les 2 entrées de veille sont en `draft: true`                                                 |
| `content/faq.yaml`     | Réponses de la FAQ                                                                            |
| `src/data/parcours.ts` | Durées indicatives, objectifs, livrables et checklists des 8 étapes (estimations éditoriales) |
| `src/data/parcours.ts` | Titres et adresses prévus des guides « à paraître » (repris de la section 5.2)                |

Rappel : en production, les contenus en `draft: true` ne sont ni affichés, ni indexés, ni listés
dans le sitemap et `llms.txt`.
