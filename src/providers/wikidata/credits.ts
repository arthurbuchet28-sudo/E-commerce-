import { avecCache, UN_JOUR } from '../cache';
import { recupererJson } from '../reseau';

/** Nom du fichier Commons d'une URL Special:FilePath (crédit encore incomplet dans l'instantané). */
export function fichierDepuisFilePath(url: string): string | null {
  const m = url.match(/Special:FilePath\/([^?]+)/);
  return m ? decodeURIComponent(m[1]!) : null;
}

function sansHtml(texte: string) {
  return texte.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Récupère auteur et licence d'une photo auprès de l'API Wikimedia Commons (CORS : origin=*),
 * pour les photos dont l'instantané n'a pas pu obtenir le crédit complet. Résultat mis en cache 30 jours.
 */
export async function creditCommons(fichier: string): Promise<string | null> {
  return avecCache(`commons-credit:${fichier}`, 30 * UN_JOUR, async () => {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      prop: 'imageinfo',
      iiprop: 'extmetadata',
      iiextmetadatafilter: 'Artist|LicenseShortName',
      titles: `File:${fichier}`,
    });
    try {
      const json = await recupererJson<{ query?: { pages?: Record<string, { imageinfo?: { extmetadata?: Record<string, { value: string }> }[] }> } }>(
        `https://commons.wikimedia.org/w/api.php?${params}`,
      );
      const meta = Object.values(json.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata;
      if (!meta) return null;
      const auteur = sansHtml(meta.Artist?.value ?? '') || 'Auteur inconnu';
      const licence = sansHtml(meta.LicenseShortName?.value ?? '');
      return `Photo : ${auteur.slice(0, 80)}${licence ? `, ${licence}` : ''} — Wikimedia Commons`;
    } catch {
      return null;
    }
  });
}
