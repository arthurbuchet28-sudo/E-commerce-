import { MotionConfig } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { T } from '@/i18n/fr';
import { useAnimationsReduites, useAppliquerTheme } from '@/lib/hooks';
import { useProfil } from '@/store/profil';
import { Avatar } from './Avatar';
import { PanneauReglages } from './PanneauReglages';

export function Logo({ grand = false }: { grand?: boolean }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${grand ? 'text-5xl sm:text-6xl' : 'text-2xl'}`}>
      <span className="text-violet-700 dark:text-violet-300">Quiz</span>
      <span className="bg-gradient-to-r from-pink-500 to-amber-400 bg-clip-text text-transparent">Mania</span>
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  useAppliquerTheme();
  const reduit = useAnimationsReduites();
  const [reglagesOuverts, setReglagesOuverts] = useState(false);
  const { avatar, pseudo } = useProfil();
  return (
    <MotionConfig reducedMotion={reduit ? 'always' : 'never'}>
      <div className="fond-plateau flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-4">
          <Link to="/" aria-label={`${T.appNom} — accueil`} className="rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
          <Link to="/profil" className="rounded-full p-1 transition hover:bg-white/60 dark:hover:bg-white/10" aria-label={`${T.profil.titre} (${pseudo})`}>
            <Avatar avatar={avatar} taille={40} />
          </Link>
          <button
            type="button"
            onClick={() => setReglagesOuverts(true)}
            className="rounded-full p-2 text-2xl transition hover:rotate-45 hover:bg-white/60 dark:hover:bg-white/10"
            aria-label={T.reglages.titre}
          >
            <span aria-hidden>⚙️</span>
          </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-4">{children}</main>
      </div>
      <PanneauReglages ouvert={reglagesOuverts} onFermer={() => setReglagesOuverts(false)} />
    </MotionConfig>
  );
}
