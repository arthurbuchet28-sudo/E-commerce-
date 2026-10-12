import { Howl, Howler } from 'howler';
import { useReglages } from '@/store/reglages';

export type NomSon = 'bonne' | 'combo' | 'mauvaise' | 'tic' | 'fin' | 'record' | 'badge' | 'joker';

const sons = new Map<NomSon, Howl>();

function son(nom: NomSon): Howl {
  let h = sons.get(nom);
  if (!h) {
    h = new Howl({ src: [`${import.meta.env.BASE_URL}sons/${nom}.wav`], preload: true });
    sons.set(nom, h);
  }
  return h;
}

/** Joue un effet sonore, si le son est activé dans les réglages. */
export function jouerSon(nom: NomSon) {
  const { son: actif, volume } = useReglages.getState();
  if (!actif || volume <= 0) return;
  try {
    Howler.volume(volume);
    son(nom).play();
  } catch {
    /* audio indisponible : on continue sans son */
  }
}

/** Précharge les sons les plus fréquents (au début d'une partie). */
export function prechargerSons() {
  if (!useReglages.getState().son) return;
  (['bonne', 'combo', 'mauvaise', 'tic'] as NomSon[]).forEach(son);
}
