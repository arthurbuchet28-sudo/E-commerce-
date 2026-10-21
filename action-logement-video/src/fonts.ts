import {continueRender, delayRender, staticFile} from 'remotion';
import montserrat500 from '@fontsource/montserrat/files/montserrat-latin-500-normal.woff2';
import montserrat700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2';
import montserrat800 from '@fontsource/montserrat/files/montserrat-latin-800-normal.woff2';
import {assetsManifest} from './assetsManifest';

// Polices embarquées dans le projet (aucun appel réseau au rendu).
// Si des fichiers sont déposés dans assets/fonts/, ils sont chargés sous le
// nom "Charte" ; la graisse est déduite du nom (…Medium…, …Bold…, …ExtraBold…).
const weightOf = (file: string) => {
  const f = file.toLowerCase();
  if (/(extra|ultra)bold|black|heavy/.test(f)) return '800';
  if (/semibold|demibold/.test(f)) return '600';
  if (/bold/.test(f)) return '700';
  if (/medium/.test(f)) return '500';
  if (/light/.test(f)) return '300';
  return '400';
};

export const loadFonts = () => {
  if (typeof document === 'undefined') return;
  const charte: readonly string[] = assetsManifest.fonts;
  const faces = [
    new FontFace('Montserrat', `url(${montserrat500})`, {weight: '500'}),
    new FontFace('Montserrat', `url(${montserrat700})`, {weight: '700'}),
    new FontFace('Montserrat', `url(${montserrat800})`, {weight: '800'}),
    ...charte.map((file) => new FontFace('Charte', `url(${staticFile(`fonts/${file}`)})`, {weight: weightOf(file)})),
  ];
  const handle = delayRender('Chargement des polices');
  Promise.all(faces.map((face) => face.load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
