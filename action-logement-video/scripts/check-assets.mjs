// Détecte les fichiers fournis dans assets/ et génère src/assetsManifest.ts.
// La vidéo n'utilise un fichier (logo, musique, SFX, police) que s'il existe :
// sinon un emplacement réservé est affiché / le son est simplement omis.
import {existsSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'assets');
const has = (p) => existsSync(join(assets, p));

const sfxNames = ['whoosh', 'pop', 'reveal'];
const sfx = Object.fromEntries(sfxNames.map((n) => [n, has(`sfx/${n}.mp3`)]));

const fontFiles = existsSync(join(assets, 'fonts'))
  ? readdirSync(join(assets, 'fonts')).filter((f) => /\.(woff2?|otf|ttf)$/i.test(f))
  : [];

const manifest = {
  logoCouleur: has('logo-action-logement.svg'),
  logoBlanc: has('logo-action-logement-blanc.svg'),
  music: has('audio/music.mp3'),
  sfx,
  fonts: fontFiles,
};

writeFileSync(
  join(root, 'src/assetsManifest.ts'),
  `// Fichier généré par scripts/check-assets.mjs — ne pas modifier à la main.\n` +
    `export const assetsManifest = ${JSON.stringify(manifest, null, 2)} as const;\n`,
);

const status = (ok) => (ok ? 'OK      ' : 'MANQUANT');
console.log('Assets Action Logement :');
console.log(`  ${status(manifest.logoCouleur)} logo-action-logement.svg`);
console.log(`  ${status(manifest.logoBlanc)} logo-action-logement-blanc.svg`);
console.log(`  ${status(manifest.music)} audio/music.mp3`);
for (const n of sfxNames) console.log(`  ${status(sfx[n])} sfx/${n}.mp3`);
console.log(`  polices charte : ${fontFiles.length ? fontFiles.join(', ') : 'aucune (Montserrat utilisée)'}`);
