import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ResultatReponse } from '@/engine/partie';
import { T } from '@/i18n/fr';

type Props = {
  enQuestion: boolean;
  resultat?: ResultatReponse;
  onValider: (texte: string) => void;
};

/** Saisie libre, tolérante aux fautes (la tolérance dépend de la difficulté). */
export function ZoneSaisie({ enQuestion, resultat, onValider }: Props) {
  const [texte, setTexte] = useState('');
  const champ = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (enQuestion) champ.current?.focus({ preventScroll: true });
  }, [enQuestion]);

  const style = enQuestion
    ? 'border-violet-300 focus:border-violet-600 dark:border-slate-600'
    : resultat?.correct
      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
      : 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100';

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (enQuestion && texte.trim()) onValider(texte.trim());
      }}
    >
      <motion.input
        ref={champ}
        type="text"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        disabled={!enQuestion}
        placeholder={T.jeu.saisiePlaceholder}
        aria-label={T.jeu.saisieLibelle}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        animate={!enQuestion && resultat && !resultat.correct ? { x: [0, -10, 10, -6, 6, 0] } : {}}
        className={`min-h-16 flex-1 rounded-2xl border-2 bg-white px-4 text-lg font-bold outline-none transition dark:bg-slate-800 ${style}`}
      />
      {enQuestion && (
      <button
        type="submit"
        disabled={!texte.trim()}
        className="min-h-16 rounded-2xl bg-violet-700 px-6 font-display text-xl font-extrabold text-white shadow-lg transition hover:bg-violet-800 disabled:opacity-50"
      >
        {T.jeu.valider}
      </button>
      )}
    </form>
  );
}
