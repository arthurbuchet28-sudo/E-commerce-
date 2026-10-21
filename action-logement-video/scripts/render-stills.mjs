// Contrôle qualité : une image fixe par scène, dans les deux formats → out/stills/
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';

// Images (globales) où chaque scène est en place
const frames = {
  '1-accroche': 72,
  '2-reponse': 196,
  '3-solutions': 312,
  '4-entreprises': 556,
  '5-signature': 640,
};

mkdirSync('out/stills', {recursive: true});
for (const format of ['16x9', '9x16']) {
  for (const [name, frame] of Object.entries(frames)) {
    execFileSync(
      'npx',
      ['remotion', 'still', `ActionLogement-${format}`, `out/stills/${format}-${name}.png`, `--frame=${frame}`, '--log=error'],
      {stdio: 'inherit'},
    );
    console.log(`out/stills/${format}-${name}.png`);
  }
}
