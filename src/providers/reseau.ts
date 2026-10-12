/** Outils réseau communs aux fournisseurs : délai maximal, JSON, JSONP. */

export const DELAI_RESEAU_MS = 4000;

export function enLigne(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/** fetch JSON avec délai maximal et annulation. */
export async function recupererJson<T>(url: string, init: RequestInit & { delaiMs?: number } = {}): Promise<T> {
  const controleur = new AbortController();
  const signalExterne = init.signal;
  signalExterne?.addEventListener('abort', () => controleur.abort(), { once: true });
  const minuteur = setTimeout(() => controleur.abort(), init.delaiMs ?? DELAI_RESEAU_MS);
  try {
    const reponse = await fetch(url, { ...init, signal: controleur.signal });
    if (!reponse.ok) throw new Error(`HTTP ${reponse.status} pour ${url}`);
    return (await reponse.json()) as T;
  } finally {
    clearTimeout(minuteur);
  }
}

let compteurJsonp = 0;

/**
 * JSONP : pour les API publiques qui n'autorisent pas les requêtes cross-origin (Deezer).
 * Le paramètre `output=jsonp&callback=…` est ajouté à l'URL.
 */
export function jsonp<T>(url: string, delaiMs = DELAI_RESEAU_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const nom = `__quizmania_jsonp_${Date.now()}_${compteurJsonp++}`;
    const script = document.createElement('script');
    const global = window as unknown as Record<string, unknown>;
    const nettoyer = () => {
      clearTimeout(minuteur);
      delete global[nom];
      script.remove();
    };
    const minuteur = setTimeout(() => {
      nettoyer();
      reject(new Error(`JSONP : délai dépassé pour ${url}`));
    }, delaiMs);
    global[nom] = (donnees: T) => {
      nettoyer();
      resolve(donnees);
    };
    script.onerror = () => {
      nettoyer();
      reject(new Error(`JSONP : échec du chargement de ${url}`));
    };
    script.src = `${url}${url.includes('?') ? '&' : '?'}output=jsonp&callback=${nom}`;
    document.head.appendChild(script);
  });
}
