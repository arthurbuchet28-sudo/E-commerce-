#!/usr/bin/env node
/**
 * Pre-launch audit (docs/mise-en-production.md): what still blocks the production launch.
 *
 *   pnpm prelaunch                          content, legal pages, placeholders
 *   pnpm prelaunch --env .env.production    + production configuration (validated by src/lib/env.ts)
 *
 * Exit code 1 while a blocking item remains.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const envFile = args.includes("--env") ? args[args.indexOf("--env") + 1] : undefined;
const results = []; // { level: "ok" | "warn" | "block", text }
const add = (level, text) => results.push({ level, text });

function files(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p, ext) : ext.some((x) => p.endsWith(x)) ? [p] : [];
  });
}
const read = (p) => fs.readFileSync(p, "utf8");
const frontmatter = (text) => /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
const isDraft = (text) => !/^draft:\s*false\s*$/m.test(frontmatter(text));
const count = (text, re) => (text.match(re) ?? []).length;

const TODO = /\[À COMPLÉTER/g;
const CHECK = /\[À VÉRIFIER/g;
const REVIEW = /\[À VALIDER/g;

// 1. Publisher identity and legal pages.
for (const p of [
  "src/config/site.ts",
  "src/config/legal.ts",
  ...files("content/legal", [".mdx"]),
]) {
  const n = count(read(p), TODO);
  if (n) add("block", `${p} : ${n} information(s) [À COMPLÉTER]`);
}
const trames = files("content/legal", [".mdx"]).filter((p) => /^status:\s*trame/m.test(read(p)));
if (trames.length) {
  add(
    "block",
    `${trames.length} page(s) légale(s) encore en « trame » (validation juridique) : ${trames.map((p) => path.basename(p, ".mdx")).join(", ")}`,
  );
} else add("ok", "Pages légales validées");

// 2. Editorial content.
const content = ["content/guides", "content/glossaire", "content/veille"].flatMap((d) =>
  files(d, [".mdx"]),
);
const published = content.filter((p) => !isDraft(read(p)));
const guides = published.filter((p) => p.startsWith(path.join("content", "guides")));
add(
  guides.length ? "ok" : "warn",
  `${guides.length} guide(s) publié(s), ${content.length - published.length} contenu(s) en brouillon (non affichés en production)`,
);
for (const p of published) {
  const text = read(p);
  if (count(text, TODO)) add("block", `${p} : publié avec ${count(text, TODO)} [À COMPLÉTER]`);
  const n = count(text, CHECK) + count(text, REVIEW);
  if (n) add("warn", `${p} : publié avec ${n} point(s) [À VÉRIFIER] / [À VALIDER]`);
}

// 3. Newsletter welcome sequence.
const drafts = count(read("src/data/newsletter.ts"), /draft:\s*true/g);
add(
  drafts ? "warn" : "ok",
  drafts
    ? `${drafts} e-mail(s) de la séquence de bienvenue en brouillon (non envoyés)`
    : "Séquence de bienvenue validée",
);

// 4. Remaining markers in code and data (published figures come from here).
let codeChecks = 0;
for (const p of [...files("src", [".ts", ".tsx"]), ...files("docs", [".md"])]) {
  codeChecks += count(read(p), CHECK) + count(read(p), REVIEW) + count(read(p), TODO);
}
add(
  codeChecks ? "warn" : "ok",
  `${codeChecks} balise(s) [À COMPLÉTER] / [À VÉRIFIER] / [À VALIDER] dans src/ et docs/ (détail : TODO-CONTENU.md)`,
);

// 5. Production configuration, with the site's own validation rules.
if (envFile) {
  const env = { APP_ENV: "production" };
  for (const line of read(envFile).split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  env.APP_ENV = "production";
  const { parseServerEnv } = await import("../src/lib/env.ts");
  try {
    const parsed = parseServerEnv(env);
    add(
      parsed.NEXT_PUBLIC_SITE_URL.startsWith("https://") ? "ok" : "block",
      `Configuration de production valide (adresse du site : ${parsed.NEXT_PUBLIC_SITE_URL})`,
    );
    if (parsed.STRIPE_SECRET_KEY?.startsWith("sk_test_"))
      add("block", "Stripe est encore en mode test (clé sk_test_…)");
  } catch (e) {
    add(
      "block",
      `Configuration de production invalide :\n${e.message.split("\n").slice(1).join("\n")}`,
    );
  }
} else {
  add("warn", "Configuration de production non vérifiée : relancer avec --env FICHIER");
}

const icon = { ok: "✅", warn: "⚠️ ", block: "❌" };
for (const level of ["block", "warn", "ok"]) {
  for (const r of results.filter((x) => x.level === level)) console.log(`${icon[level]} ${r.text}`);
}
const blocking = results.filter((r) => r.level === "block").length;
console.log(
  blocking
    ? `\n${blocking} point(s) bloquant(s) avant la mise en production.`
    : "\nAucun point bloquant.",
);
process.exit(blocking ? 1 : 0);
