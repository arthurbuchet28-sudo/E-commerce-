import { useEffect, useState } from 'react';
import { useReglages } from '@/store/reglages';
import { animationsReduitesSysteme } from './effets';

/** true si l'utilisateur a demandé des animations réduites (réglage ou préférence système). */
export function useAnimationsReduites(): boolean {
  const reglage = useReglages((s) => s.animationsReduites);
  const [systeme, setSysteme] = useState(animationsReduitesSysteme);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const maj = () => setSysteme(mq.matches);
    mq.addEventListener('change', maj);
    return () => mq.removeEventListener('change', maj);
  }, []);
  return reglage || systeme;
}

/** Applique le thème clair / sombre sur <html>. */
export function useAppliquerTheme() {
  const theme = useReglages((s) => s.theme);
  const reduites = useReglages((s) => s.animationsReduites);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const appliquer = () => {
      const sombre = theme === 'sombre' || (theme === 'systeme' && mq?.matches === true);
      document.documentElement.classList.toggle('dark', sombre);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', sombre ? '#140c2e' : '#4c1d95');
    };
    appliquer();
    mq?.addEventListener('change', appliquer);
    return () => mq?.removeEventListener('change', appliquer);
  }, [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle('reduire-animations', reduites);
  }, [reduites]);
}
