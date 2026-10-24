# Gemmes — encyclopédie des pierres précieuses

Site statique de référence sur **69 gemmes** (4 pierres précieuses, 60 pierres fines, 5 gemmes organiques),
chacune illustrée d'une photographie libre de droits issue de Wikimedia Commons.

Stack : [Astro](https://astro.build) + TypeScript + [Tailwind CSS](https://tailwindcss.com) v4. Aucune base de données :
toutes les données sont dans `src/data/gems.json`.

## Lancer le site

Prérequis : **Node.js 22.22 ou plus récent**.

```bash
npm install
npm run dev        # http://localhost:4321
```

Autres commandes :

| Commande                | Rôle                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| `npm run build`         | Génère le site statique dans `dist/` (pages + `sitemap-index.xml`)     |
| `npm run preview`       | Sert le contenu de `dist/` localement                                  |
| `npm run check`         | Vérification TypeScript / Astro                                        |
| `npm run fetch-images`  | Récupère les images manquantes depuis Wikimedia Commons                |
| `npm run verify`        | Contrôle les données, les images et (si `dist/` existe) chaque fiche   |

Avant de déployer, indiquez l'URL publique du site (utilisée pour les liens canoniques, l'Open Graph,
le sitemap et `robots.txt`) : `SITE_URL=https://mon-domaine.fr npm run build`, ou modifiez `astro.config.mjs`.

## Pages

| URL                      | Contenu                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| `/`                      | Présentation, les 4 pierres précieuses, sélection de gemmes                  |
| `/catalogue`             | Grille filtrable : recherche instantanée, catégorie, couleur, dureté, mois, tri |
| `/gemmes/[slug]`         | Fiche détail : image + crédit, tableau des caractéristiques, gisements, similaires |
| `/pierres-de-naissance`  | Calendrier des 12 mois                                                       |
| `/comparateur`           | Comparaison de 2 ou 3 gemmes (`/comparateur?g=rubis,saphir,spinelle`)        |
| `/a-propos`              | Sources des données et crédits de toutes les images                          |

Les filtres du catalogue sont reflétés dans l'URL (ex. `/catalogue?color=bleu&month=12`).

## Structure

```
scripts/
  fetch-images.mjs     # téléchargement des images Wikimedia Commons
  verify.mjs           # contrôles de cohérence
src/
  data/gems.json       # LES DONNÉES (une entrée par gemme)
  lib/gems.ts          # types, libellés, formatage, gemmes similaires
  layouts/BaseLayout.astro   # <head> SEO / Open Graph, thème, en-tête, pied de page
  components/          # Header, Footer, GemCard, GemImage
  pages/               # une page par route
  styles/global.css    # thème (variables CSS clair/sombre) + Tailwind
public/images/gems/    # <slug>.webp (800 px) + <slug>-400.webp (vignette) + placeholder.svg
```

## Ajouter une gemme

1. Ajoutez une entrée dans `src/data/gems.json` :

   ```jsonc
   {
     "slug": "benitoite",                 // minuscules, chiffres et tirets ; devient l'URL /gemmes/benitoite
     "name": "Bénitoïte",
     "nameEn": "Benitoite",
     "category": "fine",                  // "precieuse" | "fine" | "organique"
     "family": "Silicates (cyclosilicates) — bénitoïte",
     "formula": "BaTiSi₃O₉",
     "colors": ["bleu", "incolore"],      // rouge, rose, orange, jaune, vert, bleu, violet, brun, noir, blanc, gris, incolore, multicolore
     "hardness": { "min": 6, "max": 6.5 },          // échelle de Mohs
     "density": { "min": 3.64, "max": 3.68 },
     "refractiveIndex": { "min": 1.757, "max": 1.804 },
     "deposits": ["États-Unis (Californie)"],
     "symbolism": "…",
     "birthMonths": [],                   // 1 = janvier … 12 = décembre
     "priceRange": "eleve",               // "bas" | "moyen" | "eleve"
     "description": "3 à 5 phrases…",
     "imageQueries": ["Benitoite gemstone", "Benitoite crystal"],
     "image": null
   }
   ```

   Vérifiez les valeurs minéralogiques auprès d'une source fiable (GIA, Mindat.org, manuel de gemmologie).

2. Récupérez son image :

   ```bash
   npm run fetch-images -- benitoite
   ```

   Le script interroge l'API Commons avec `imageQueries`, ne retient que les licences libres
   (domaine public, CC0, CC BY, CC BY-SA…), écarte les bijoux portés, cartes, schémas, etc., puis
   enregistre `public/images/gems/benitoite.webp` (+ vignette 400 px) et le crédit dans `gems.json`.

   Si la photo choisie ne convient pas, imposez un fichier précis de Commons avec le champ
   `"imageFile": "Nom du fichier.jpg"` puis relancez la commande (le changement est détecté
   automatiquement ; `--force` re-télécharge tout). Sans image libre, la fiche affiche
   `placeholder.svg`.

3. Contrôlez : `npm run build && npm run verify`.

> L'API Wikimedia limite le débit des requêtes. Le script espace ses appels, envoie un User-Agent
> identifiable et respecte l'en-tête `Retry-After` ; en cas d'erreurs 429 persistantes, relancez-le plus tard
> (les images déjà téléchargées sont conservées).

## Qualité

- **SEO** : `<title>` et meta description uniques par page, URL canonique, Open Graph / Twitter Card,
  données structurées JSON-LD sur les fiches, `sitemap-index.xml` et `robots.txt` générés.
- **Accessibilité** : texte alternatif sur chaque image, lien d'évitement, navigation au clavier
  (focus visible), libellés de formulaires, tableaux avec en-têtes, contrastes ≥ 4,5:1 dans les deux thèmes,
  respect de `prefers-reduced-motion`.
- **Performance** : site 100 % statique, images WebP (800 px et 400 px via `srcset`), `loading="lazy"`,
  dimensions explicites pour éviter les décalages de mise en page.

## Crédits

Photographies : Wikimedia Commons, sous licences libres — auteur et licence affichés sous chaque image
et récapitulés sur la page `/a-propos`. Les données sont fournies à titre informatif.
