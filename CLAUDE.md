@AGENTS.md

# Première Vente — guide de travail pour Claude

Plateforme francophone de conseils et de formations pour se lancer dans le e-commerce.
Plan de référence : `PLAN.md` (architecture, modèle de données, phases). Contenus à compléter : `TODO-CONTENU.md`.

## Règles d'or

- Si l'exécution s'écarte du plan validé, arrête-toi et repasse en plan mode.
- Ne jamais inventer de chiffre, de texte de loi, de témoignage, d'avis client ou de logo partenaire.
- Toute donnée réglementaire ou chiffrée vient de `src/data/reference.ts` avec sa source et sa date.
- Travailler phase par phase ; à la fin de chaque phase : `pnpm check` + `pnpm e2e` verts → commit
  (Conventional Commits) → résumé pour un non-développeur → attendre le feu vert.
- Contenu manquant : `[À COMPLÉTER]`. Chiffre ou point juridique à revérifier : `[À VÉRIFIER — source]`.
  Chaque balise ajoutée est reportée dans `TODO-CONTENU.md`.
- Jamais « éligible CPF », jamais le logo Qualiopi, jamais « diplôme » ou « certification » :
  l'attestation est une « attestation de suivi ». Flags dans `src/config/site.ts` (désactivés).
- Pas de dark patterns : pas de faux stock, faux compteurs, prix barrés fictifs, cases pré-cochées.
- Aucun secret dans le repo. Toute nouvelle variable d'env : `src/lib/env.ts` + `.env.example`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5.9 strict · Tailwind CSS 4 · Zod 4 ·
Supabase (Postgres, Auth, Storage, région UE) · Stripe Checkout · Brevo (e-mails, newsletter) ·
Bunny Stream (vidéos) · Pagefind · Matomo Cloud UE (mode exempté) · Vitest · Playwright + axe-core.
Hébergement : Vercel (`cdg1`) + Supabase Francfort. Gestionnaire de paquets : **pnpm**.

Next 16 diffère de ce que tu connais : lis `node_modules/next/dist/docs/` avant d'utiliser une API
(ex. le middleware s'appelle `proxy`, `LayoutProps`/`PageProps` sont générés, `typedRoutes` actif).

## Commandes

```bash
pnpm dev          # serveur de développement (http://localhost:3000)
pnpm build        # build de production
pnpm lint         # ESLint
pnpm typecheck    # next typegen + tsc --noEmit
pnpm test         # Vitest (unitaires)
pnpm e2e          # Playwright + axe (nécessite `pnpm build` avant)
pnpm format       # Prettier
pnpm check        # lint + typecheck + test + build
```

Sandbox avec un Chromium préinstallé différent :
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium pnpm e2e`.

## Structure

```
src/app/            routes (App Router) ; route handlers dans src/app/api/
src/components/     ui/ (design system), mdx/, layout/, tools/, lms/
src/lib/            calc/ (fonctions pures des outils), content/ (MDX+Zod), services/
                    (adaptateurs email/video/payments), supabase/, seo/, security/
src/lib/env.ts      validation Zod des variables ; env.server.ts pour le serveur uniquement
src/config/site.ts  nom, domaine, éditeur, flags formation (NDA/Qualiopi/CPF)
src/data/           reference.ts (chiffres sourcés), platforms.ts, parcours.ts, checklist.ts
content/            guides MDX, glossaire, FAQ, veille, textes de leçons
supabase/           migrations, seed.sql, tests RLS
e2e/                tests Playwright
docs/               design-system.md (tokens, composants), registre, sauvegardes
```

## Conventions de code

- Code, identifiants et commentaires en **anglais** ; interface et contenus en **français (fr-FR)**.
- Typographie française dans les textes : espace insécable (U+00A0 ou U+202F) avant `: ; ! ?`,
  guillemets « », vouvoiement, phrases courtes.
- Server components par défaut ; `"use client"` seulement pour les îlots interactifs.
- Toute entrée externe (formulaire, route handler, frontmatter, env) est validée avec Zod côté serveur.
- Fonctions de calcul pures dans `src/lib/calc/`, 100 % couvertes par des tests Vitest (`*.test.ts`
  à côté du fichier).
- Services tiers derrière une interface (`src/lib/services/*`) avec un adaptateur mock pour le local.
- `SUPABASE_SERVICE_ROLE_KEY` et `src/lib/supabase/admin.ts` : uniquement dans du code `server-only`.
- RLS activée sur toutes les tables ; toute nouvelle table a ses politiques et un test.
- Droits d'accès aux formations accordés uniquement par le webhook Stripe `checkout.session.completed`.
- Pas de `dangerouslySetInnerHTML` sur du contenu utilisateur. Pas de couleurs en dur : tokens CSS
  (`docs/design-system.md`). Réutiliser `src/components/ui/` avant de créer un composant.
- Accessibilité WCAG 2.2 AA : un seul `h1`, labels visibles, focus visible, `aria-live` sur les résultats.
- Commits : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).

## Vérification visuelle

Avant de rendre la main sur une phase qui touche l'interface : lancer le serveur, captures Playwright
à 1440 px et 390 px (clair et sombre) des pages clés, corriger ce qui ne va pas.
