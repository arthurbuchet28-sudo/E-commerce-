import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { T } from '@/i18n/fr';
import { useInstallation } from '@/lib/installation';
import { jouerSon } from '@/lib/sons';
import { useReglages, type Theme } from '@/store/reglages';

type Props = { ouvert: boolean; onFermer: () => void };

export function PanneauReglages({ ouvert, onFermer }: Props) {
  const { theme, animationsReduites, vibrations, son, volume, modifier } = useReglages();
  const fermerRef = useRef<HTMLButtonElement>(null);
  const installation = useInstallation();
  useEffect(() => {
    if (!ouvert) return;
    fermerRef.current?.focus();
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [ouvert, onFermer]);

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFermer}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-reglages"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titre-reglages" className="font-display text-2xl font-extrabold">
              {T.reglages.titre}
            </h2>
            <fieldset className="mt-4">
              <legend className="text-sm font-bold text-slate-600 dark:text-slate-300">{T.reglages.theme}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(Object.keys(T.reglages.themes) as Theme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={theme === t}
                    onClick={() => modifier({ theme: t })}
                    className={`rounded-xl border-2 px-3 py-2 font-bold ${
                      theme === t ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {T.reglages.themes[t]}
                  </button>
                ))}
              </div>
            </fieldset>
            <Interrupteur libelle={T.reglages.son} actif={son} onChange={(v) => modifier({ son: v })} />
            <label className="mt-3 block font-bold">
              {T.reglages.volume} <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">({Math.round(volume * 100)} %)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                disabled={!son}
                onChange={(e) => modifier({ volume: Number(e.target.value) })}
                onPointerUp={() => jouerSon('bonne')}
                onKeyUp={() => jouerSon('bonne')}
                className="mt-1 w-full accent-violet-700 disabled:opacity-40"
              />
            </label>
            <Interrupteur libelle={T.reglages.animations} actif={animationsReduites} onChange={(v) => modifier({ animationsReduites: v })} />
            <Interrupteur libelle={T.reglages.vibrations} actif={vibrations} onChange={(v) => modifier({ vibrations: v })} />
            {installation.possible && (
              <button type="button" onClick={() => void installation.installer()} className="mt-6 w-full rounded-2xl border-2 border-violet-700 py-3 font-bold text-violet-800 dark:border-violet-300 dark:text-violet-200">
                📲 {T.reglages.installer}
              </button>
            )}
            <button
              ref={fermerRef}
              type="button"
              onClick={onFermer}
              className="mt-6 w-full rounded-2xl bg-violet-700 py-3 font-bold text-white hover:bg-violet-800"
            >
              {T.reglages.fermer}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Interrupteur({ libelle, actif, onChange }: { libelle: string; actif: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 font-bold">
      {libelle}
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        onClick={() => onChange(!actif)}
        className={`relative h-8 w-14 rounded-full transition ${actif ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${actif ? 'left-7' : 'left-1'}`} />
      </button>
    </label>
  );
}
