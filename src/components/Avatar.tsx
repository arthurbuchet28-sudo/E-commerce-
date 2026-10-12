import { createAvatar } from '@dicebear/core';
import { useEffect, useState } from 'react';
import type { Avatar as TypeAvatar, StyleAvatar } from '@/store/profil';

type StyleDiceBear = Parameters<typeof createAvatar>[0];

/**
 * Styles DiceBear retenus : illustrations CC0 (thumbs, lorelei, notionists) et bottts (libre d'usage).
 * Chaque style est chargé à la demande pour ne pas alourdir le chargement initial.
 */
export const STYLES_AVATAR: { id: StyleAvatar; nom: string; charger: () => Promise<StyleDiceBear> }[] = [
  { id: 'thumbs', nom: 'Bonshommes', charger: () => import('@dicebear/thumbs') },
  { id: 'lorelei', nom: 'Portraits', charger: () => import('@dicebear/lorelei') },
  { id: 'notionists', nom: 'Croquis', charger: () => import('@dicebear/notionists') },
  { id: 'bottts-neutral', nom: 'Robots', charger: () => import('@dicebear/bottts-neutral') },
];

const styles = new Map<StyleAvatar, Promise<StyleDiceBear>>();
const images = new Map<string, string>();

/** Avatar généré localement (aucune requête réseau), à partir d'un style et d'une graine. */
export async function avatarDataUri(avatar: TypeAvatar): Promise<string> {
  const cle = `${avatar.style}:${avatar.graine}`;
  const deja = images.get(cle);
  if (deja) return deja;
  const def = STYLES_AVATAR.find((s) => s.id === avatar.style) ?? STYLES_AVATAR[0]!;
  if (!styles.has(def.id)) styles.set(def.id, def.charger());
  const style = await styles.get(def.id)!;
  const uri = createAvatar(style, { seed: avatar.graine, radius: 50 }).toDataUri();
  images.set(cle, uri);
  return uri;
}

export function Avatar({ avatar, taille = 40, alt = '' }: { avatar: TypeAvatar; taille?: number; alt?: string }) {
  const [src, setSrc] = useState(() => images.get(`${avatar.style}:${avatar.graine}`));
  useEffect(() => {
    let actif = true;
    void avatarDataUri(avatar).then((u) => actif && setSrc(u));
    return () => {
      actif = false;
    };
  }, [avatar]);
  if (!src) return <span className="inline-block shrink-0 animate-pulse rounded-full bg-violet-200 dark:bg-slate-700" style={{ width: taille, height: taille }} aria-hidden />;
  return <img src={src} alt={alt} width={taille} height={taille} className="shrink-0 rounded-full bg-violet-100 dark:bg-slate-700" />;
}
