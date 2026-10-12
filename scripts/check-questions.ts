/**
 * Valide la banque locale : format, doublons, bonne réponse présente dans les choix,
 * catégories correctement orthographiées.
 * Usage : npm run questions:check
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { CATEGORIES, type Categorie, type Question } from '../src/types/question';
import { validerBanque, validerQuestion } from '../src/engine/validation';

const dossier = join(import.meta.dirname, '..', 'src', 'data', 'questions');
const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.json'));

let nbErreurs = 0;
const toutes: Partial<Question>[] = [];
const parNiveau = new Map<number, number>();

for (const fichier of fichiers) {
  const nomCategorie = basename(fichier, '.json');
  let contenu: { categorie?: string; questions?: Partial<Question>[] };
  try {
    contenu = JSON.parse(readFileSync(join(dossier, fichier), 'utf8'));
  } catch (e) {
    console.error(`✗ ${fichier} : JSON invalide (${(e as Error).message})`);
    nbErreurs++;
    continue;
  }
  if (!(CATEGORIES as readonly string[]).includes(nomCategorie) || contenu.categorie !== nomCategorie) {
    console.error(`✗ ${fichier} : le nom du fichier et le champ « categorie » doivent être une catégorie valide identique`);
    nbErreurs++;
  }
  for (const q of contenu.questions ?? []) {
    const complete = { ...q, source: 'local', categorie: contenu.categorie as Categorie };
    toutes.push(complete);
    parNiveau.set(q.difficulte ?? 0, (parNiveau.get(q.difficulte ?? 0) ?? 0) + 1);
    for (const message of validerQuestion(complete, nomCategorie as Categorie)) {
      console.error(`✗ ${fichier} › ${q.id} : ${message}`);
      nbErreurs++;
    }
  }
  console.log(`• ${nomCategorie.padEnd(22)} ${String(contenu.questions?.length ?? 0).padStart(4)} questions`);
}

// Doublons inter-fichiers (ids et énoncés).
for (const e of validerBanque(toutes).filter((e) => /double|utilisé/.test(e.message))) {
  console.error(`✗ ${e.id} : ${e.message}`);
  nbErreurs++;
}

const manquantes = CATEGORIES.filter((c) => !fichiers.includes(`${c}.json`));
for (const c of manquantes) console.warn(`⚠ aucune question pour la catégorie « ${c} »`);

console.log(`\nTotal : ${toutes.length} questions — niveaux ${[1, 2, 3, 4].map((n) => `${n}: ${parNiveau.get(n) ?? 0}`).join(', ')}`);
if (nbErreurs > 0) {
  console.error(`\n${nbErreurs} problème(s) détecté(s).`);
  process.exit(1);
}
console.log('✓ Banque locale valide.');
