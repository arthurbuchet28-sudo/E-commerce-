/**
 * Drapeaux (paquet flag-icons, licence MIT) : fichiers SVG servis avec l'application,
 * donc disponibles hors ligne. Chaque fichier n'est téléchargé que lorsqu'il est affiché.
 */
const fichiers = import.meta.glob<string>('/node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const parCode = new Map(Object.entries(fichiers).map(([chemin, url]) => [chemin.split('/').pop()!.replace('.svg', ''), url]));

export function urlDrapeau(iso2: string): string | undefined {
  return parCode.get(iso2.toLowerCase());
}
