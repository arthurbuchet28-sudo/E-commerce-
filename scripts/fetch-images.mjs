#!/usr/bin/env node
/**
 * Récupère une photo libre de droits pour chaque gemme depuis Wikimedia Commons.
 *
 * Pour chaque gemme de src/data/gems.json :
 *   1. interroge l'API de recherche de Commons (espace de noms « Fichier ») avec
 *      les requêtes de `imageQueries` (ou, si présent, le fichier imposé `imageFile`) ;
 *   2. filtre les résultats : licence libre uniquement (domaine public, CC0, CC BY,
 *      CC BY-SA…), photo matricielle assez grande, titre sans mot évoquant un bijou
 *      porté, une carte, un dessin… ;
 *   3. attribue un score à chaque candidat (pertinence du titre, mots « cut »,
 *      « faceted », « crystal », « rough »…) et garde le meilleur ;
 *   4. télécharge la vignette de 800 px de large, la convertit en WebP (sharp) dans
 *      public/images/gems/<slug>.webp, plus une version 400 px (<slug>-400.webp)
 *      pour les cartes du catalogue (attribut srcset) ;
 *   5. enregistre auteur, licence et URL source dans gems.json.
 *
 * Usage :
 *   node scripts/fetch-images.mjs            # gemmes sans image uniquement
 *   node scripts/fetch-images.mjs --force    # tout re-télécharger
 *   node scripts/fetch-images.mjs rubis opale  # seulement ces slugs
 *
 * L'API Wikimedia limite le débit : le script envoie un User-Agent explicite,
 * espace ses requêtes et respecte l'en-tête Retry-After en cas de réponse 429.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = path.join(ROOT, "src/data/gems.json");
const OUT_DIR = path.join(ROOT, "public/images/gems");
const API = "https://commons.wikimedia.org/w/api.php";
const WIDTH = 800;
const THUMB_WIDTH = 400;
const USER_AGENT =
  "GemmesReference/1.0 (site de référence sur les gemmes; https://github.com/arthurbuchet28-sudo/E-commerce-) node-fetch";

/** Délai minimal entre deux requêtes (ms) pour rester courtois envers l'API. */
const REQUEST_GAP = 1200;
const MAX_RETRIES = 6;

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = args.filter((a) => !a.startsWith("--"));

// Licences acceptées (comparées en minuscules au champ LicenseShortName).
const FREE_LICENSE = /^(cc0|cc[- ]by(-sa)?([- ]\d(\.\d)?)?|cc[- ]by(-sa)? ?\d\.\d.*|public domain|pd.*|gfdl.*|attribution|fal|free art license.*)$/i;
const NON_FREE = /\b(nc|nd|non-commercial|noderivs|fair use)\b/i;

// Mots qui disqualifient un fichier (bijoux portés, cartes, schémas, etc.).
const BANNED = [
  "ring", "necklace", "earring", "pendant", "bracelet", "brooch", "tiara", "crown", "jewel", "jewellery", "jewelry",
  "bague", "collier", "boucle", "broche", "bijou", "worn", "wearing", "woman", "girl", "man", "portrait",
  "map", "carte", "logo", "flag", "drawing", "diagram", "chart", "schema", "spectrum", "graph", "structure",
  "icon", "svg", "stamp", "coin", "statue", "mine", "mining", "miner", "building", "church", "street", "museum entrance",
  "painting", "illustration", "plate", "lithograph", "engraving", "book", "label", "simulant", "imitation", "synthetic",
  "plastic", "fake", "microscope", "thin section", "sem", "x ray", "uv", "ultraviolet", "fluorescence",
  "tool", "knife", "arrowhead", "artifact", "sculpture", "carving", "vase", "bowl", "bangle", "bead", "beads", "cameo",
  "diorama", "guitar", "butterfly", "moth", "wing", "chameleon", "lizard", "bird", "frog", "dancing", "system",
];
// Mots qui indiquent une photo de pierre (taillée ou brute) : bonus.
const BONUS = ["gem", "gemstone", "faceted", "cut", "crystal", "rough", "cabochon", "specimen", "mineral", "loose", "polished", "carat", "ct"];

let lastRequest = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Requête HTTP avec espacement, User-Agent et gestion des 429 / 5xx. */
async function politeFetch(url, { binary = false } = {}) {
  for (let attempt = 0; ; attempt++) {
    const wait = lastRequest + REQUEST_GAP - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequest = Date.now();
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT } });
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      await sleep(2000 * 2 ** attempt);
      continue;
    }
    if (res.ok) return binary ? Buffer.from(await res.arrayBuffer()) : res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const delay = (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0) + 2000 * 2 ** attempt;
      console.warn(`  ↻ HTTP ${res.status}, nouvel essai dans ${Math.round(delay / 1000)} s`);
      await sleep(delay);
      continue;
    }
    throw new Error(`HTTP ${res.status} pour ${url}`);
  }
}

/** Retire les balises HTML des métadonnées Commons (champ Artist notamment). */
const stripHtml = (s = "") =>
  s.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, " ").trim();

const IMAGE_PROPS = {
  prop: "imageinfo",
  iiprop: "url|size|mime|user|extmetadata",
  iiurlwidth: String(WIDTH),
  iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|UsageTerms|AttributionRequired|ImageDescription",
};

/** Recherche des fichiers sur Commons et renvoie leurs métadonnées. */
async function searchCommons(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "20",
    ...IMAGE_PROPS,
  });
  const data = await politeFetch(`${API}?${params}`);
  return (data.query?.pages ?? []).sort((a, b) => a.index - b.index);
}

/** Métadonnées d'un fichier précis (champ `imageFile` de gems.json). */
async function fileInfo(title) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    titles: title.startsWith("File:") ? title : `File:${title}`,
    ...IMAGE_PROPS,
  });
  const data = await politeFetch(`${API}?${params}`);
  return data.query?.pages ?? [];
}

/**
 * Nom d'auteur lisible : retire les URL et, si le champ Artist est vide ou
 * générique (« me », « own work »…), se rabat sur le compte qui a versé le fichier.
 */
function authorName(meta, info) {
  const artist = stripHtml(meta.Artist?.value)
    .replace(/\(?\s*https?:\/\/\S+\s*\)?/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!artist || /^(me|myself|self|i|own work|unknown|auteur inconnu)$/i.test(artist)) return info.user ?? "Auteur inconnu";
  return artist;
}

/** Normalise un texte pour comparaison (minuscules, sans accents). */
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Évalue un candidat. Renvoie null s'il est rejeté, sinon un score
 * (plus il est élevé, plus la photo est jugée pertinente).
 */
function scoreCandidate(page, gem, rank, { strict = true } = {}) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime)) return null;
  if (info.width < 500 || info.height < 350) return null;

  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value);
  if (!license || NON_FREE.test(license) || !FREE_LICENSE.test(license)) return null;

  const title = norm(page.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, "").replace(/[_-]/g, " "));
  const words = title.split(/\s+/);
  const banned = (w) => (w.includes(" ") ? ` ${title} `.includes(` ${w} `) : words.includes(w) || words.includes(`${w}s`));
  if (strict && BANNED.some(banned)) return null;

  // Le titre doit évoquer la gemme (nom anglais ou français, premier mot significatif).
  const names = [gem.nameEn, gem.name, ...(gem.imageKeywords ?? [])]
    .map((n) => norm(n).replace(/[()'’]/g, " ").split(/\s+/).filter((w) => w.length > 3))
    .flat();
  const nameHits = names.filter((w) => title.includes(w.replace(/s$/, ""))).length;
  if (strict && nameHits === 0) return null;

  let score = 100 - rank * 3 + nameHits * 15;
  score += BONUS.filter((w) => title.split(/\s+/).includes(w)).length * 8;
  const ratio = info.width / info.height;
  if (ratio > 0.75 && ratio < 1.6) score += 10; // cadrage proche du carré : idéal pour les cartes
  if (info.width >= 1200) score += 5;
  return { score, page, info, license, meta };
}

/** Choisit la meilleure image pour une gemme. */
async function findImage(gem) {
  if (gem.imageFile) {
    const pages = await fileInfo(gem.imageFile);
    const c = pages[0] && scoreCandidate(pages[0], gem, 0, { strict: false });
    if (c) return c;
    console.warn(`  ⚠ fichier imposé « ${gem.imageFile} » invalide ou non libre, recherche automatique`);
  }
  const queries = gem.imageQueries?.length ? gem.imageQueries : [`${gem.nameEn} gemstone`, gem.nameEn];
  const seen = new Set();
  let best = null;
  for (const q of queries) {
    const pages = await searchCommons(q);
    pages.forEach((p, i) => {
      if (seen.has(p.title)) return;
      seen.add(p.title);
      const c = scoreCandidate(p, gem, i);
      if (c && (!best || c.score > best.score)) best = c;
    });
    if (best && best.score >= 120) break; // résultat suffisamment bon, inutile de continuer
  }
  return best;
}

/** Génère la vignette 400 px utilisée par les cartes (srcset). */
const makeThumb = (src, dest) => sharp(src).resize({ width: THUMB_WIDTH }).webp({ quality: 75 }).toFile(dest);

async function main() {
  const gems = JSON.parse(await readFile(DATA_FILE, "utf8"));
  await mkdir(OUT_DIR, { recursive: true });

  let ok = 0, skipped = 0, missing = [];
  for (const gem of gems) {
    if (ONLY.length && !ONLY.includes(gem.slug)) continue;
    const localFile = path.join(OUT_DIR, `${gem.slug}.webp`);
    const thumbFile = path.join(OUT_DIR, `${gem.slug}-400.webp`);
    // Un fichier imposé (imageFile) différent de l'image actuelle force le re-téléchargement.
    const pinChanged = gem.imageFile && gem.image?.title !== gem.imageFile.replace(/^File:/, "");
    if (!FORCE && !pinChanged && gem.image?.src && existsSync(localFile)) {
      if (!existsSync(thumbFile)) await makeThumb(localFile, thumbFile);
      skipped++;
      continue;
    }
    console.log(`→ ${gem.name}`);
    try {
      const found = await findImage(gem);
      if (!found) {
        console.warn("  ✗ aucune image libre trouvée (image de remplacement utilisée)");
        gem.image = null;
        missing.push(gem.slug);
        continue;
      }
      const { page, info, license, meta } = found;
      const raw = await politeFetch(info.thumburl ?? info.url, { binary: true });
      const out = await sharp(raw).rotate().resize({ width: WIDTH }).webp({ quality: 80 }).toFile(localFile);
      await makeThumb(localFile, thumbFile);

      gem.image = {
        src: `/images/gems/${gem.slug}.webp`,
        width: out.width,
        height: out.height,
        title: page.title.replace(/^File:/, ""),
        author: authorName(meta, info),
        license,
        licenseUrl: meta.LicenseUrl?.value ?? null,
        sourceUrl: info.descriptionurl,
      };
      console.log(`  ✓ ${gem.image.title} — ${gem.image.author} (${license})`);
      ok++;
      // Sauvegarde au fil de l'eau : un arrêt du script ne fait rien perdre.
      await writeFile(DATA_FILE, JSON.stringify(gems, null, 2) + "\n");
    } catch (err) {
      console.error(`  ✗ erreur : ${err.message}`);
      missing.push(gem.slug);
    }
  }
  await writeFile(DATA_FILE, JSON.stringify(gems, null, 2) + "\n");
  console.log(`\nTerminé : ${ok} image(s) téléchargée(s), ${skipped} déjà présente(s), ${missing.length} manquante(s).`);
  if (missing.length) console.log("Sans image :", missing.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
