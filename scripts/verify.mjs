#!/usr/bin/env node
/**
 * Vérifie la cohérence de src/data/gems.json et des images :
 *   - champs obligatoires présents, slugs uniques, valeurs dans des bornes plausibles ;
 *   - chaque gemme a une image locale (800 px + vignette 400 px) et un crédit complet ;
 *   - si le site a été construit (dist/), chaque fiche HTML référence bien son image.
 *
 * Usage : npm run verify   (code de sortie 1 en cas d'erreur)
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gems = JSON.parse(await readFile(path.join(ROOT, "src/data/gems.json"), "utf8"));

const COLORS = ["rouge", "rose", "orange", "jaune", "vert", "bleu", "violet", "brun", "noir", "blanc", "gris", "incolore", "multicolore"];
const errors = [];
const warnings = [];
const err = (slug, msg) => errors.push(`${slug}: ${msg}`);

const slugs = new Set();
for (const g of gems) {
  const s = g.slug ?? "(sans slug)";
  if (!/^[a-z0-9-]+$/.test(s)) err(s, "slug invalide");
  if (slugs.has(s)) err(s, "slug dupliqué");
  slugs.add(s);

  for (const f of ["name", "nameEn", "family", "formula", "symbolism", "description"]) if (!g[f]) err(s, `champ « ${f} » manquant`);
  if (!["precieuse", "fine", "organique"].includes(g.category)) err(s, "catégorie invalide");
  if (!["bas", "moyen", "eleve"].includes(g.priceRange)) err(s, "fourchette de prix invalide");
  if (!g.colors?.length || g.colors.some((c) => !COLORS.includes(c))) err(s, "couleurs invalides");
  if (!g.deposits?.length) err(s, "aucun gisement");
  if (g.birthMonths?.some((m) => !Number.isInteger(m) || m < 1 || m > 12)) err(s, "mois de naissance invalide");

  // Bornes physiques plausibles pour des gemmes.
  const checkRange = (key, lo, hi) => {
    const r = g[key];
    if (!r || typeof r.min !== "number" || typeof r.max !== "number" || r.min > r.max || r.min < lo || r.max > hi)
      err(s, `${key} hors bornes (${JSON.stringify(r)})`);
  };
  checkRange("hardness", 1, 10);
  checkRange("density", 1, 6);
  checkRange("refractiveIndex", 1.3, 3.3);

  const sentences = g.description?.split(/(?<=[a-zé»)]\.)\s+(?=[A-ZÀ-ÖØ-Þ«])/u).length ?? 0;
  if (sentences < 3 || sentences > 5) warnings.push(`${s}: description de ${sentences} phrases`);

  // Image et crédit.
  if (!g.image) {
    warnings.push(`${s}: pas d'image (image de remplacement)`);
    continue;
  }
  for (const f of ["src", "author", "license", "sourceUrl", "title"]) if (!g.image[f]) err(s, `image.${f} manquant`);
  const file = path.join(ROOT, "public", g.image.src ?? "");
  const thumb = file.replace(/\.webp$/, "-400.webp");
  if (!existsSync(file)) err(s, `fichier image absent : ${g.image.src}`);
  else {
    const meta = await sharp(file).metadata();
    if (meta.format !== "webp") err(s, "image non WebP");
    if (meta.width !== 800) err(s, `largeur ${meta.width}px au lieu de 800px`);
    if (meta.width !== g.image.width || meta.height !== g.image.height) err(s, "dimensions déclarées incorrectes");
  }
  if (!existsSync(thumb)) err(s, "vignette 400 px absente");
  if (!/^https:\/\/commons\.wikimedia\.org\//.test(g.image.sourceUrl ?? "")) err(s, "source hors Wikimedia Commons");
  if (/\b(NC|ND)\b/.test(g.image.license ?? "")) err(s, `licence non libre : ${g.image.license}`);
}

// Contrôle des pages construites, si dist/ existe.
const dist = path.join(ROOT, "dist");
if (existsSync(dist)) {
  for (const g of gems) {
    const html = path.join(dist, "gemmes", g.slug, "index.html");
    if (!existsSync(html)) {
      err(g.slug, "page détail non générée");
      continue;
    }
    const content = await readFile(html, "utf8");
    const expected = g.image?.src ?? "/images/gems/placeholder.svg";
    if (!content.includes(`src="${expected}"`)) err(g.slug, "la fiche ne référence pas son image");
    if (!content.includes(`<title>${g.name}`)) err(g.slug, "balise <title> inattendue");
    if (/<img(?![^>]*\balt=)[^>]*>/.test(content)) err(g.slug, "image sans attribut alt");
  }
}

console.log(`${gems.length} gemmes vérifiées — ${gems.filter((g) => g.image).length} avec photo.`);
const byCat = gems.reduce((a, g) => ((a[g.category] = (a[g.category] ?? 0) + 1), a), {});
console.log("Par catégorie :", byCat);
warnings.forEach((w) => console.warn("⚠", w));
errors.forEach((e) => console.error("✗", e));
if (errors.length) process.exit(1);
console.log("✓ Aucune erreur.");
