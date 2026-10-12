import type { Question } from '@/types/question';

/** Précharge une image ; résout à false si elle échoue ou met trop de temps. */
export function prechargerImage(url: string, delaiMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    const minuteur = setTimeout(() => resolve(false), delaiMs);
    img.onload = () => {
      clearTimeout(minuteur);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(minuteur);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Garde `nombre` questions jouables : celles dont l'image ne se charge pas
 * sont remplacées par des questions de réserve (sans image de préférence).
 */
export async function garderQuestionsJouables(
  choisies: Question[],
  reserve: Question[],
  prechargement: (url: string) => Promise<boolean> = prechargerImage,
): Promise<Question[]> {
  const ok = await Promise.all(choisies.map((q) => (q.media?.image ? prechargement(q.media.image) : Promise.resolve(true))));
  const remplacantes = [...reserve.filter((q) => !q.media?.image), ...reserve.filter((q) => q.media?.image)];
  return choisies.flatMap((q, i) => {
    if (ok[i]) return [q];
    const r = remplacantes.shift();
    return r && !r.media?.image ? [r] : [];
  });
}
