import { createAvatar } from '@dicebear/core';
import * as botttsNeutral from '@dicebear/bottts-neutral';
import * as lorelei from '@dicebear/lorelei';
import * as notionists from '@dicebear/notionists';
import * as thumbs from '@dicebear/thumbs';
import { useMemo } from 'react';
import type { Avatar as TypeAvatar, StyleAvatar } from '@/store/profil';

/** Styles DiceBear retenus : illustrations CC0 (thumbs, lorelei, notionists) et bottts (libre d'usage). */
export const STYLES_AVATAR: { id: StyleAvatar; nom: string; style: Parameters<typeof createAvatar>[0] }[] = [
  { id: 'thumbs', nom: 'Bonshommes', style: thumbs },
  { id: 'lorelei', nom: 'Portraits', style: lorelei },
  { id: 'notionists', nom: 'Croquis', style: notionists },
  { id: 'bottts-neutral', nom: 'Robots', style: botttsNeutral },
];

/** Avatar généré localement (aucune requête réseau), à partir d'un style et d'une graine. */
export function avatarDataUri(avatar: TypeAvatar): string {
  const style = STYLES_AVATAR.find((s) => s.id === avatar.style)?.style ?? thumbs;
  return createAvatar(style, { seed: avatar.graine, radius: 50 }).toDataUri();
}

export function Avatar({ avatar, taille = 40, alt = '' }: { avatar: TypeAvatar; taille?: number; alt?: string }) {
  const src = useMemo(() => avatarDataUri(avatar), [avatar]);
  return <img src={src} alt={alt} width={taille} height={taille} className="shrink-0 rounded-full bg-violet-100 dark:bg-slate-700" />;
}
