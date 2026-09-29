#!/usr/bin/env node
/**
 * Gives (or removes) the back-office role to an existing member.
 * Usage: node scripts/grant-admin.mjs email@example.fr [--remove]
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or
 * .env.local. The role can only be changed with the service role key (never from the site).
 */
import fs from "node:fs";

const env = { ...process.env };
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
}
const [email, flag] = process.argv.slice(2);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !url || !key) {
  console.error("Usage : node scripts/grant-admin.mjs email@example.fr [--remove]");
  console.error("Variables requises : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const users = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers }).then((r) =>
  r.json(),
);
const user = users.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(`Aucun compte pour ${email}. Créez d'abord le compte sur le site.`);
  process.exit(1);
}
const role = flag === "--remove" ? "member" : "admin";
const res = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ role }),
});
if (!res.ok) {
  console.error(`Échec : ${res.status} ${await res.text()}`);
  process.exit(1);
}
console.log(`${email} a maintenant le rôle « ${role} ».`);
