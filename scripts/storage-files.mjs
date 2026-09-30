#!/usr/bin/env node
/**
 * Copies the private course files (bucket « ressources ») to a local folder, or uploads such a
 * folder back into a project. Supabase database backups do not contain the files themselves.
 *
 *   node scripts/storage-files.mjs download DOSSIER   (then encrypt it: docs/sauvegardes.md)
 *   node scripts/storage-files.mjs upload DOSSIER     (restoration into a new project)
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or
 * .env.local.
 */
import fs from "node:fs";
import path from "node:path";

const BUCKET = "ressources";
const env = { ...process.env };
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
}
const [mode, dir] = process.argv.slice(2);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!["download", "upload"].includes(mode) || !dir || !url || !key) {
  console.error("Usage : node scripts/storage-files.mjs download|upload DOSSIER");
  console.error("Variables requises : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const auth = { apikey: key, Authorization: `Bearer ${key}` };
const api = `${url}/storage/v1`;

/** Lists every object of the bucket (folders are walked recursively). */
async function list(prefix = "") {
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${api}/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 100, offset }),
    });
    if (!res.ok) throw new Error(`Listing failed: ${res.status} ${await res.text()}`);
    const items = await res.json();
    for (const item of items) {
      const name = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) out.push(name);
      else out.push(...(await list(name)));
    }
    if (items.length < 100) return out;
  }
}

function walk(root, rel = "") {
  return fs.readdirSync(path.join(root, rel), { withFileTypes: true }).flatMap((e) => {
    const r = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? walk(root, r) : [r];
  });
}

if (mode === "download") {
  const names = await list();
  for (const name of names) {
    const res = await fetch(`${api}/object/${BUCKET}/${name}`, { headers: auth });
    if (!res.ok) throw new Error(`Download failed for ${name}: ${res.status}`);
    const target = path.join(dir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  }
  console.log(`${names.length} fichier(s) copié(s) dans ${dir}`);
} else {
  const names = walk(dir);
  for (const name of names) {
    const res = await fetch(`${api}/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/pdf", "x-upsert": "true" },
      body: fs.readFileSync(path.join(dir, name)),
    });
    if (!res.ok) throw new Error(`Upload failed for ${name}: ${res.status} ${await res.text()}`);
  }
  console.log(`${names.length} fichier(s) envoyé(s) dans le bucket ${BUCKET}`);
}
