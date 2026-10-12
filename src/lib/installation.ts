import { useEffect, useState } from 'react';

type EvenementInstallation = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let invite: EvenementInstallation | null = null;
const abonnes = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    invite = e as EvenementInstallation;
    abonnes.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    invite = null;
    abonnes.forEach((f) => f());
  });
}

/** Proposition d'installation de la PWA (navigateurs compatibles uniquement). */
export function useInstallation(): { possible: boolean; installer: () => Promise<void> } {
  const [, rafraichir] = useState(0);
  useEffect(() => {
    const f = () => rafraichir((n) => n + 1);
    abonnes.add(f);
    return () => {
      abonnes.delete(f);
    };
  }, []);
  return {
    possible: invite !== null,
    installer: async () => {
      if (!invite) return;
      await invite.prompt();
      await invite.userChoice;
      invite = null;
      abonnes.forEach((f) => f());
    },
  };
}
