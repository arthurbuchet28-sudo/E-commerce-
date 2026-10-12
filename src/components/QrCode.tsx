import qrcode from 'qrcode-generator';
import { useMemo } from 'react';

/** QR code dessiné en SVG (généré sur l'appareil, sans service externe). */
export function QrCode({ texte, taille = 240, titre }: { texte: string; taille?: number; titre: string }) {
  const { chemin, cote } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(texte);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + 4} ${y + 4}h1v1h-1z`;
    return { chemin: d, cote: n + 8 };
  }, [texte]);
  return (
    <svg role="img" aria-label={titre} viewBox={`0 0 ${cote} ${cote}`} width={taille} height={taille} shapeRendering="crispEdges" className="rounded-2xl bg-white">
      <rect width={cote} height={cote} fill="#fff" />
      <path d={chemin} fill="#0f172a" />
    </svg>
  );
}
