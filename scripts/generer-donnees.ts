/**
 * Génère les jeux de données utilisés par les fournisseurs automatiques, à partir de Wikidata
 * (requêtes SPARQL) et de Wikimedia Commons (crédits des photos).
 *
 * Usage : npm run data:wikidata
 * (derrière un proxy : NODE_USE_ENV_PROXY=1 npm run data:wikidata)
 *
 * Sorties : src/data/generes/{personnalites,monuments,evenements,pays}.json
 * Ces instantanés permettent de jouer hors ligne ; l'application les rafraîchit en arrière-plan.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import {
  DOMAINES,
  requetePersonnes,
  requeteMonuments,
  requeteEvenements,
  requetePays,
  normaliserPersonnes,
  normaliserMonuments,
  normaliserEvenements,
  normaliserPays,
  type LigneSparql,
} from '../src/providers/wikidata/requetes';

const SPARQL = 'https://query.wikidata.org/sparql';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const AGENT = 'QuizMania/0.2 (https://github.com/arthurbuchet28-sudo/E-commerce-; jeu de quiz educatif)';
const SORTIE = join(import.meta.dirname, '..', 'src', 'data', 'generes');
const CACHE = join(import.meta.dirname, '..', 'node_modules', '.cache', 'quizmania-donnees');

const pause = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** GET JSON avec cache disque (relancer le script ne réinterroge pas les API) et nouvelles tentatives. */
async function getJson<T>(url: string, accept = 'application/json', essais = 5): Promise<T> {
  mkdirSync(CACHE, { recursive: true });
  const fichier = join(CACHE, createHash('sha1').update(url).digest('hex') + '.json');
  if (existsSync(fichier)) return JSON.parse(readFileSync(fichier, 'utf8')) as T;
  for (let essai = 1; essai <= essais; essai++) {
    const r = await fetch(url, { headers: { Accept: accept, 'User-Agent': AGENT } });
    const texte = await r.text();
    if (r.ok) {
      try {
        const json = JSON.parse(texte) as T;
        writeFileSync(fichier, texte);
        return json;
      } catch {
        /* réponse non JSON (limitation de débit) : on réessaie */
      }
    }
    console.warn(`  HTTP ${r.status}, nouvel essai dans ${10 * essai} s…`);
    await pause(10000 * essai);
  }
  throw new Error(`Échec après ${essais} essais : ${url.slice(0, 120)}`);
}

async function sparql(requete: string): Promise<LigneSparql[]> {
  const json = await getJson<{ results: { bindings: LigneSparql[] } }>(
    `${SPARQL}?query=${encodeURIComponent(requete)}`,
    'application/sparql-results+json',
  );
  return json.results.bindings;
}

type InfoImage = { url: string; credit: string };

function sansHtml(texte: string): string {
  return texte.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** Récupère miniature + auteur + licence des fichiers Commons, par paquets de 20. */
/** Coupe-circuit : après un échec, on n'insiste plus auprès de l'API Commons pendant ce lancement. */
let commonsBloque = false;

async function infosImages(fichiers: string[]): Promise<Map<string, InfoImage>> {
  const resultat = new Map<string, InfoImage>();
  const uniques = [...new Set(fichiers)];
  for (let i = 0; i < uniques.length; i += 20) {
    const paquet = uniques.slice(i, i + 20);
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '480',
      iiextmetadatafilter: 'Artist|LicenseShortName',
      titles: paquet.map((f) => `File:${f}`).join('|'),
    });
    await pause(4000);
    type ReponseCommons = {
      query?: {
        normalized?: { from: string; to: string }[];
        pages?: Record<string, { title: string; imageinfo?: { thumburl?: string; extmetadata?: Record<string, { value: string }> }[] }>;
      };
    };
    let json: ReponseCommons;
    try {
      if (commonsBloque) throw new Error('Commons bloqué');
      json = await getJson<ReponseCommons>(`${COMMONS}?${params}`, 'application/json', 3);
    } catch {
      commonsBloque = true;
      // API Commons indisponible (limitation de débit) : lien direct vers le fichier,
      // crédité par son nom ; relancer le script plus tard récupère auteur et licence.
      console.warn(`\n  ⚠ crédits Commons indisponibles pour ${paquet.length} fichiers (repli sur Special:FilePath)`);
      for (const f of paquet) {
        resultat.set(f, {
          url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=480`,
          credit: `Photo : Wikimedia Commons, fichier « ${f.replace(/_/g, ' ').slice(0, 80)} »`,
        });
      }
      continue;
    }
    const versOrigine = new Map((json.query?.normalized ?? []).map((n) => [n.to, n.from]));
    for (const page of Object.values(json.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl) continue;
      const titre = (versOrigine.get(page.title) ?? page.title).replace(/^File:/, '');
      const auteur = sansHtml(info.extmetadata?.Artist?.value ?? '') || 'Auteur inconnu';
      const licence = sansHtml(info.extmetadata?.LicenseShortName?.value ?? '');
      resultat.set(titre.replace(/ /g, '_'), {
        url: info.thumburl,
        credit: `Photo : ${auteur.slice(0, 80)}${licence ? `, ${licence}` : ''} — Wikimedia Commons`,
      });
    }
    process.stdout.write(`  images ${Math.min(i + 20, uniques.length)}/${uniques.length}\r`);
  }
  process.stdout.write('\n');
  return resultat;
}

function ecrire(nom: string, donnees: unknown[]) {
  writeFileSync(join(SORTIE, `${nom}.json`), JSON.stringify(donnees, null, 1) + '\n');
  console.log(`✓ ${nom}.json : ${donnees.length} entrées`);
}

async function main() {
  console.log('Personnalités…');
  const lignes: LigneSparql[] = [];
  for (const d of DOMAINES) {
    const r = await sparql(requetePersonnes(d.occupations, d.seuil, d.limite));
    console.log(`  ${d.id.padEnd(12)} ${r.length}`);
    lignes.push(...r.map((l) => ({ ...l, domaine: { type: 'literal', value: d.id } })));
  }
  const personnes = normaliserPersonnes(lignes);
  const imgP = await infosImages(personnes.map((p) => p.fichierImage));
  ecrire(
    'personnalites',
    personnes.flatMap(({ fichierImage, ...p }) => {
      const img = imgP.get(fichierImage);
      return img ? [{ ...p, image: img.url, credit: img.credit }] : [];
    }),
  );

  console.log('Monuments…');
  const monuments = normaliserMonuments(await sparql(requeteMonuments()));
  const imgM = await infosImages(monuments.map((m) => m.fichierImage));
  ecrire(
    'monuments',
    monuments.flatMap(({ fichierImage, ...m }) => {
      const img = imgM.get(fichierImage);
      return img ? [{ ...m, image: img.url, credit: img.credit }] : [];
    }),
  );

  console.log('Événements…');
  ecrire('evenements', normaliserEvenements(await sparql(requeteEvenements())));

  console.log('Pays…');
  ecrire('pays', normaliserPays(await sparql(requetePays())));
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
