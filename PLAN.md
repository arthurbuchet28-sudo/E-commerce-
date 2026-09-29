# Plan — « Première Vente » (plateforme de conseils et formations e-commerce)

## Contexte

Repo vierge (`README.md` seul, branche `claude/gifted-mayer-87835o`). Objectif : construire, phase par phase (15 phases du cahier des charges), une plateforme freemium francophone : guides MDX sourcés, parcours « Se lancer » en 8 étapes, outils interactifs, LMS avec formations payantes (Stripe), newsletter, back-office, conformité légale exemplaire. Arrêt et validation utilisateur à la fin de chaque phase.

## Décisions validées (questions + défauts §17)

| Sujet                  | Choix                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Nom / domaine          | Première Vente — `premiere-vente.fr` `[À VÉRIFIER disponibilité]`, centralisé dans `src/config/site.ts`                    |
| Hébergement            | Vercel (cdg1/fra1) + Supabase (Francfort)                                                                                  |
| Comptes tiers          | Aucun : Supabase local (Docker dispo), Stripe mode test, adaptateurs simulés e-mail/vidéo ; vraies clés via `.env` en prod |
| E-mails + newsletter   | **Brevo** (au lieu de Resend) — double opt-in, UE                                                                          |
| Vidéo                  | **Bunny Stream** (URL signées à expiration, VTT)                                                                           |
| Audience               | Matomo Cloud UE, mode exempté CNIL, aucun pixel pub                                                                        |
| Auteur                 | « La rédaction » + page « Méthode éditoriale » ; champ `author` du frontmatter prêt pour un vrai auteur                    |
| Organisme de formation | Non : `config.nda/qualiopi/cpf = false`                                                                                    |
| Défauts                | Éditeur micro-entreprise `[À COMPLÉTER]`, prix F1–F7 39–89 € TTC, pack 199 € TTC, accès 24 mois, pas d'abonnement          |

## Stack (versions vérifiées le 29/09/2026 via `npm view`)

Next.js 16.3 (App Router) · React 19.3 · Tailwind CSS 4.3 · Zod 4.6 · @supabase/ssr 0.12 + supabase-js 2.117 + CLI 2.118 · stripe 22.6 · Vitest 5 · Playwright 1.63 + @axe-core/playwright · Pagefind 1.5 · @mdx-js/mdx 3 via `next-mdx-remote-client`/`@next/mdx` (choix final en phase 4) · @react-pdf/renderer 4.9 (attestations, factures, checklist PDF) · ESLint 10 + Prettier + husky/lint-staged · pnpm.
Arbitrage phase 1 : `create-next-app` 16.3 installe **TypeScript 5.9** et **ESLint 9** (versions supportées par `eslint-config-next`) ; TypeScript 7.0 et ESLint 10 sont publiés mais pas encore validés par Next — on reste sur les versions supportées et on réévalue à chaque montée de Next.
Next 16 : le « middleware » s'appelle désormais **proxy** (`src/proxy.ts`).

## Architecture

- **Rendu** : pages éditoriales en SSG (`generateStaticParams`), outils = îlots client (`"use client"` limité au composant), espace connecté en server components dynamiques.
- **Couches** :
  - `src/lib/calc/*` — fonctions pures des outils (100 % testées, aucune dépendance React).
  - `src/data/reference.ts` — seule source des chiffres/règles (type `RefValue {value, unit, source:{name,url}, checkedAt, validUntil?, note?}`), accès via `ref('fevad.caTotal2025')` typé ; test d'obsolescence > 12 mois.
  - `src/data/platforms.ts`, `src/data/parcours.ts` (8 étapes), `src/data/checklist.ts`, `src/data/quiz-modele.ts`.
  - `src/lib/content/*` — chargement MDX + schémas Zod du frontmatter, calcul `readingTime`, TOC, auto-liens glossaire.
  - `src/lib/services/{email,video,payments}` — **interfaces + adaptateurs** (Brevo / console-mock ; Bunny / mock ; Stripe) sélectionnés par env → testable sans comptes, et prêt pour l'IA v2/CMS v2.
  - `src/lib/env.ts` — validation Zod des variables au démarrage (serveur / public séparés).
  - `src/lib/supabase/{server,client,admin}.ts` — `admin` (service_role) importé uniquement côté serveur (`server-only`).
- **Contenu** : `/content/guides/<categorie>/<slug>.mdx`, `/content/glossaire/*.mdx`, `/content/faq.mdx`, `/content/veille/*.mdx`, `/content/formations/<slug>/…` (texte des leçons en MDX ; structure/prix/quiz en base, seedés).
- **Sécurité** : middleware (session Supabase, CSP avec nonce, en-têtes), rate-limit (table Postgres ou Upstash optionnel), honeypot, Turnstile optionnel.

## Modèle de données (Supabase, RLS sur toutes les tables)

- `profiles` (id=auth.uid, display_name, role `member|admin`, email_prefs, created_at)
- `courses` (slug, title, price_cents, is_free, access_months, status, stripe_price_id, order) · `modules` (course_id, order, title, pass_score=80) · `lessons` (module_id, order, slug, title, duration_min, video_id?, mdx_path, is_preview) · `lesson_resources` (lesson_id, storage_path, label)
- `quizzes` / `quiz_questions` (choices jsonb, correct_index, explanation) · `quiz_attempts` (user, quiz, score, answers)
- `products` (course ou pack, price) · `orders` (user?, email, stripe_session_id unique, amount, status, withdrawal_waiver_at, waiver_text_version, created_at) · `order_items` · `enrollments` (user, course, source_order, expires_at) — **écrits uniquement par le webhook** (service_role)
- `stripe_events` (event_id PK → idempotence)
- `withdrawals` (order_id, email, requested_at, ack_sent_at, refund_id, status)
- `lesson_progress` (user, lesson, completed_at, last_seen_at) · `parcours_progress` (user, step, item, checked)
- `saved_simulations` (user, tool, inputs jsonb, created_at)
- `certificates` (user, course, issued_at, serial)
- `newsletter_subscribers` (email, status pending|confirmed|unsubscribed, token_hash, consent_at, consent_text_version, source) · `consent_log` (subject, type newsletter|cgv|waiver|cookies, text_version, at, ip_hash)
- `rate_limits`, `contact_messages`
- Politiques RLS : lecture de ses propres lignes ; contenus de leçon payants via fonction `has_access(course_id)` ; admin via `is_admin()`. Tests RLS en SQL (pgTAP via `supabase test db`).
- Purge planifiée (pg_cron) : abonnés `pending` > 30 j, logs de débit, messages contact > 3 ans… (durées dans le registre).

## Arborescence (extrait)

```
src/app/(site)/…          routes publiques (§3)
src/app/(compte)/compte/… espace membre (noindex)
src/app/apprendre/[formation]/[lecon]
src/app/admin/…           (rôle admin, noindex)
src/app/api/{stripe/webhook,newsletter,retractation,export,…}/route.ts
src/app/{sitemap,robots}.ts, llms.txt/route.ts, veille-reglementaire/rss.xml/route.ts, opengraph-image.tsx
src/components/{ui,mdx,layout,tools,lms}/
src/lib/{calc,content,services,supabase,seo,security}/
src/data/{reference,platforms,parcours,checklist,quiz-modele}.ts
src/config/site.ts        (nom, domaine, flags nda/qualiopi/cpf, éditeur [À COMPLÉTER])
content/…  supabase/{migrations,seed.sql,tests}  e2e/  docs/{registre-traitements,sauvegardes}.md
PLAN.md CLAUDE.md TODO-CONTENU.md README.md .env.example
```

## Phases (commit Conventional Commits + résumé non-dev + attente du feu vert à chaque fin)

1. **Fondations** : `create-next-app` (TS strict, Tailwind, ESLint), Prettier, husky/lint-staged, Vitest, Playwright + axe, `env.ts`, `.env.example`, `site.ts`, GitHub Actions (lint/typecheck/test/build/e2e), `PLAN.md` (ce plan détaillé), `CLAUDE.md` (< 150 lignes, règles d'or), `TODO-CONTENU.md`, (polices `next/font/local` : branchées en phase 2, une fois les familles choisies).
2. **Design system** : deux pistes (palette hex nommée, polices, échelle, wireframes ASCII accueil + leçon) → **arrêt pour votre choix** → tokens CSS (clair/sombre), composants §8.4, `/design-system` (noindex).
3. **Squelette** : layout, header, footer (légal, « Gérer mes cookies », « Se rétracter »), toutes les routes §3 en pages vides, métadonnées, sitemap/robots, 404/500, lien d'évitement.
4. **Contenu éditorial** : pipeline MDX+Zod, composants MDX (`Encadre`, `Etapes`, `Checklist`, `Exemple`, `Chiffre`, `Sources`, `AFaireAujourdhui`), `reference.ts` + test d'obsolescence, catégories, glossaire (infobulles), FAQ (FAQPage), veille + RSS, Pagefind (raccourci `/`), JSON-LD, `llms.txt`, seed 5 guides + 20 termes.
5. **Parcours « Se lancer »** : 8 étapes, checklists, progression localStorage → synchronisée au compte (phase 7), barre de progression animée (seule animation orchestrée).
6. **Outils** : 6 outils + fonctions pures + tests, méthode/hypothèses/date affichées, `aria-live`, export PDF checklist.
7. **Auth + espace membre** : Supabase Auth (mot de passe + lien magique), RLS, tableau de bord, export JSON, suppression de compte.
8. **LMS** : catalogue, pages de vente (Course JSON-LD), lecteur (prev/next, reprise, terminé, transcription, VTT), quiz 80 %, attestation PDF (« attestation de suivi », jamais diplôme/CPF), seed F0 complète + 1 payante 2 modules.
9. **Paiement** : Stripe Checkout, case de renonciation non pré-cochée horodatée, webhook signé + idempotent seul à créer les `enrollments`, factures (mention art. 293 B), `/retractation` en 2 temps sans connexion + accusé e-mail + remboursement Stripe.
10. **Newsletter/e-mails** : Brevo, double opt-in, lead magnet, séquence de 5 e-mails `[À VALIDER]`, désinscription 1 clic (List-Unsubscribe).
11. **Admin** : CRUD formations/modules/leçons/quiz/ressources, élèves, achats, export CSV, stats de complétion/abandon.
12. **Conformité** : trames mentions/CGV/CGU/confidentialité/cookies/accessibilité (« à faire valider par un professionnel du droit »), gestionnaire de consentement (inactif tant qu'aucun traceur soumis à consentement), `docs/registre-traitements.md`.
13. **Rédaction** : 30 guides en `draft: true`, sourcés, 80 termes, catalogue F0–F7 détaillé.
14. **Durcissement** : axe 0 violation sérieuse, Lighthouse CI ≥ 95, CSP, liens cassés (lychee), budget JS < 150 Ko.
15. **Mise en production** : checklist, README non-dev, Sentry UE, doc sauvegardes/restauration.

## Risques identifiés

- **Données réglementaires datées « septembre 2026 » non revérifiables par moi** : tout va dans `reference.ts` ; tout ce que je ne peux confirmer sur la source officielle est balisé `[À VÉRIFIER — source]` (taux de cotisations, seuil OSS, calendrier facturation électronique, ordonnance 2026-2).
- Pas de comptes tiers : e2e paiement via Stripe CLI/fixtures signées localement ; e-mail/vidéo en mocks → à tester à nouveau avec vraies clés avant prod.
- TypeScript 7 / Tailwind 4 / Next 16 récents : compatibilité à valider en phase 1.
- CSP stricte vs lecteur Bunny (iframe) et Matomo : directives listées explicitement.
- Volume éditorial (30 guides, 80 termes) : brouillons à relire obligatoirement ; jamais de chiffre hors `reference.ts`.
- Juridique : les trames ne remplacent pas un avocat — signalé partout.

## Vérification (à chaque phase)

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` ; à partir de la phase 3 : `pnpm e2e` (Playwright + axe sur toutes les routes publiques) ; captures Playwright 1440 px et 390 px des pages clés (clair + sombre) relues et corrigées ; à partir de la phase 7 : `supabase start` + `supabase test db` (RLS) ; phase 9 : `stripe listen` / webhook signé en test ; mise à jour de `TODO-CONTENU.md`.

## Décisions en cours de route

- **CSP stricte reportée à la phase 14** : une CSP à nonce oblige Next.js à rendre toutes les pages dynamiquement (perte du SSG). On évaluera en phase 14 une CSP à empreintes (hash) compatible avec le rendu statique. Les autres en-têtes de sécurité sont actifs depuis la phase 1.
- **Images Open Graph** : générées au build pour le site et chaque guide (polices WOFF statiques dans `src/app/fonts/og/`).
- **`<Chiffre id="…" />`** (et non `ref=`) : `ref` est réservé par React et interdit dans les Server Components.
- **Chiffres dans le frontmatter** : syntaxe `{{cle.reference}}` remplacée au build (`interpolateRefs`).
- **Recherche** : Pagefind indexe le HTML généré (`.next/server/app`) après `next build` ; index dans `public/pagefind` (non versionné). Indisponible en `pnpm dev`.
- **Progression du parcours** : `localStorage` (clé `parcours:v1`, aucun cookie), logique pure dans `src/lib/parcours/progress.ts` ; la synchronisation avec le compte (phase 7) se branchera derrière le hook `useParcoursProgress`.
- **Brouillons** : visibles en local et en preview avec un badge, jamais en production.
- **Registre des pages** `src/config/routes.ts` : source unique des titres, descriptions, fil d'Ariane, sitemap et plan du site.

## Journal des phases

| Phase                      | État                                                            | Commit                                       |
| -------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| 1. Fondations              | ✅ terminée                                                     | `chore: bootstrap project foundations`       |
| 2. Design system           | ✅ terminée — piste A « Carnet de route » + fiche de calcul (B) | `feat: add design system`                    |
| 3. Squelette et navigation | ✅ terminée                                                     | `feat: add site skeleton and navigation`     |
| 4. Contenu éditorial       | ✅ terminée                                                     | `feat: add editorial content pipeline`       |
| 5. Parcours « Se lancer »  | ✅ terminée                                                     | `feat: add guided launch path with progress` |
| 6. Outils interactifs      | ⏳ à faire                                                      |                                              |
