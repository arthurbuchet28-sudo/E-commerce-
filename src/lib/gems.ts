/**
 * Accès typé aux données des gemmes (src/data/gems.json) et fonctions utilitaires
 * partagées par toutes les pages : libellés, couleurs, formatage des mesures…
 */
import rawGems from "../data/gems.json";

export type Category = "precieuse" | "fine" | "organique";
export type PriceRange = "bas" | "moyen" | "eleve";
export type ColorKey =
  | "rouge" | "rose" | "orange" | "jaune" | "vert" | "bleu" | "violet"
  | "brun" | "noir" | "blanc" | "gris" | "incolore" | "multicolore";

/** Intervalle de valeurs mesurées (min = max pour une valeur unique). */
export interface Range {
  min: number;
  max: number;
}

/** Crédit et emplacement de la photo d'une gemme (renseigné par scripts/fetch-images.mjs). */
export interface GemImage {
  src: string;
  width: number;
  height: number;
  title: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
}

export interface Gem {
  slug: string;
  name: string;
  nameEn: string;
  category: Category;
  family: string;
  formula: string;
  colors: ColorKey[];
  hardness: Range;
  density: Range;
  refractiveIndex: Range;
  deposits: string[];
  symbolism: string;
  birthMonths: number[];
  priceRange: PriceRange;
  description: string;
  /** Requêtes de recherche Wikimedia Commons utilisées par le script d'images. */
  imageQueries?: string[];
  /** Nom de fichier Commons imposé (facultatif) pour forcer le choix d'une photo. */
  imageFile?: string;
  image: GemImage | null;
}

const collator = new Intl.Collator("fr", { sensitivity: "base" });

/** Toutes les gemmes, triées par ordre alphabétique français. */
export const gems: Gem[] = (rawGems as Gem[]).slice().sort((a, b) => collator.compare(a.name, b.name));

export const getGem = (slug: string) => gems.find((g) => g.slug === slug);

/** Image utilisée lorsqu'aucune photo libre n'a été trouvée. */
export const PLACEHOLDER = "/images/gems/placeholder.svg";

/** Chemin de la vignette 400 px générée à côté de l'image 800 px. */
export const thumbOf = (src: string) => src.replace(/\.webp$/, "-400.webp");

export const CATEGORY_LABELS: Record<Category, string> = {
  precieuse: "Pierre précieuse",
  fine: "Pierre fine",
  organique: "Gemme organique",
};

export const CATEGORY_PLURALS: Record<Category, string> = {
  precieuse: "Pierres précieuses",
  fine: "Pierres fines",
  organique: "Gemmes organiques",
};

export const PRICE_LABELS: Record<PriceRange, string> = {
  bas: "Abordable",
  moyen: "Intermédiaire",
  eleve: "Élevé",
};

/** Libellé et teinte d'affichage de chaque couleur (pastilles et filtres). */
export const COLORS: Record<ColorKey, { label: string; swatch: string }> = {
  rouge: { label: "Rouge", swatch: "#b3122e" },
  rose: { label: "Rose", swatch: "#e48aa8" },
  orange: { label: "Orange", swatch: "#e2721b" },
  jaune: { label: "Jaune", swatch: "#e9c23a" },
  vert: { label: "Vert", swatch: "#1f8a4c" },
  bleu: { label: "Bleu", swatch: "#2457b8" },
  violet: { label: "Violet", swatch: "#7a3fa8" },
  brun: { label: "Brun", swatch: "#7b4a26" },
  noir: { label: "Noir", swatch: "#151515" },
  blanc: { label: "Blanc", swatch: "#f3f0e8" },
  gris: { label: "Gris", swatch: "#8a8d91" },
  incolore: { label: "Incolore", swatch: "linear-gradient(135deg,#ffffff,#dfe7ee)" },
  multicolore: {
    label: "Multicolore",
    swatch: "conic-gradient(#b3122e,#e9c23a,#1f8a4c,#2457b8,#7a3fa8,#b3122e)",
  },
};

export const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const nf = (digits: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Formate un intervalle : « 7 – 7,5 » ou « 9 » si min = max. */
export function formatRange(r: Range, digits = 0): string {
  const f = nf(digits);
  if (digits === 0) {
    // Dureté : on affiche les demi-valeurs sans zéro inutile (7 ; 7,5).
    const h = (n: number) => (Number.isInteger(n) ? String(n) : n.toLocaleString("fr-FR"));
    return r.min === r.max ? h(r.min) : `${h(r.min)} – ${h(r.max)}`;
  }
  return r.min === r.max ? f.format(r.min) : `${f.format(r.min)} – ${f.format(r.max)}`;
}

export const formatHardness = (g: Gem) => formatRange(g.hardness);
export const formatDensity = (g: Gem) => formatRange(g.density, 2);
export const formatRI = (g: Gem) => formatRange(g.refractiveIndex, 3);
export const formatMonths = (g: Gem) => g.birthMonths.map((m) => MONTHS[m - 1]).join(", ");

/** Groupe minéral simplifié (« corindon », « béryl »…) tiré du champ famille. */
export const mineralGroup = (g: Gem) => g.family.split("—").pop()!.replace(/\(.*?\)/g, "").trim().toLowerCase();

/**
 * Gemmes similaires : même groupe minéral en priorité, puis couleurs et
 * catégorie communes, puis dureté proche.
 */
export function similarGems(gem: Gem, count = 4): Gem[] {
  const group = mineralGroup(gem);
  return gems
    .filter((g) => g.slug !== gem.slug)
    .map((g) => {
      let score = 0;
      if (mineralGroup(g) === group) score += 10;
      score += g.colors.filter((c) => gem.colors.includes(c)).length * 2;
      if (g.category === gem.category) score += 2;
      score -= Math.abs(g.hardness.max - gem.hardness.max) * 0.5;
      return { g, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.g);
}

/** Texte alternatif décrivant la photo d'une gemme. */
export const altText = (g: Gem) =>
  g.image
    ? `Photographie de la gemme ${g.name} (${g.nameEn}), teintes : ${g.colors
        .slice(0, 3)
        .map((c) => COLORS[c].label.toLowerCase())
        .join(", ")}`
    : `Illustration générique de gemme (aucune photo disponible pour ${g.name})`;

/** Base des URL (gère un éventuel déploiement dans un sous-dossier). */
export const url = (p: string) => `${import.meta.env.BASE_URL.replace(/\/$/, "")}${p}`;
