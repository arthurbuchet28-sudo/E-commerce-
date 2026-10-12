import { useEffect, useRef, useState } from 'react';
import { formaterNombre } from '@/engine/evaluation';
import type { QuestionPreparee, ResultatReponse } from '@/engine/partie';
import { T } from '@/i18n/fr';

type Props = {
  courante: QuestionPreparee;
  enQuestion: boolean;
  resultat?: ResultatReponse;
  onValider: (valeur: number) => void;
};

/** Estimation (« En quelle année… ? », « Combien… ? ») : points dégressifs selon l'écart. */
export function ZoneEstimation({ courante, enQuestion, resultat, onValider }: Props) {
  const { min, max, unite } = courante.question.estimation ?? {};
  const avecCurseur = min !== undefined && max !== undefined;
  const milieu = avecCurseur ? Math.round((min + max) / 2) : undefined;
  const [texte, setTexte] = useState(milieu !== undefined ? String(milieu) : '');
  const champ = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (enQuestion) champ.current?.focus({ preventScroll: true });
  }, [enQuestion]);
  const valeur = Number.parseFloat(texte.replace(/\s/g, '').replace(',', '.'));
  const valide = Number.isFinite(valeur);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (enQuestion && valide) onValider(valeur);
      }}
    >
      {avecCurseur && (
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={valide ? valeur : milieu}
          disabled={!enQuestion}
          onChange={(e) => setTexte(e.target.value)}
          className="w-full accent-violet-700"
          aria-label={T.jeu.estimationCurseur}
        />
      )}
      <div className="flex items-center gap-3">
        <input
          ref={champ}
          type="text"
          inputMode="decimal"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          disabled={!enQuestion}
          aria-label={T.jeu.estimationLibelle}
          className="min-h-16 w-full flex-1 rounded-2xl border-2 border-violet-300 bg-white px-4 text-center font-display text-3xl font-extrabold tabular-nums outline-none focus:border-violet-600 dark:border-slate-600 dark:bg-slate-800"
        />
        {unite && <span className="font-bold text-slate-600 dark:text-slate-300">{unite}</span>}
      </div>
      {enQuestion ? (
        <button
          type="submit"
          disabled={!valide}
          className="min-h-14 w-full rounded-2xl bg-violet-700 font-display text-xl font-extrabold text-white shadow-lg transition hover:bg-violet-800 disabled:opacity-50"
        >
          {T.jeu.valider}
        </button>
      ) : (
        resultat &&
        resultat.ecart !== undefined && (
          <p className="rounded-2xl bg-white p-3 text-center font-bold dark:bg-slate-800">
            {T.jeu.estimationResultat(formaterNombre(resultat.ecart), Math.round(resultat.fraction * 100))}
          </p>
        )
      )}
    </form>
  );
}
