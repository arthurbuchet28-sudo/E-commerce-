import { Reorder, useDragControls } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { QuestionPreparee } from '@/engine/partie';
import { T } from '@/i18n/fr';

type Props = {
  courante: QuestionPreparee;
  enQuestion: boolean;
  /** Ordre proposé par le joueur (pour la révélation). */
  ordreJoueur: string[] | null;
  onValider: (ordre: string[]) => void;
};

/** Remettre des événements dans l'ordre : glisser-déposer, ou boutons ↑ ↓ au clavier. */
export function ZoneChronologie({ courante, enQuestion, ordreJoueur, onValider }: Props) {
  const [ordre, setOrdre] = useState(courante.choix);
  useEffect(() => setOrdre(courante.choix), [courante]);
  const bonOrdre = Array.isArray(courante.question.bonneReponse) ? courante.question.bonneReponse : [];
  const affiche = enQuestion ? ordre : (ordreJoueur ?? ordre);

  const deplacer = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= ordre.length) return;
    const copie = [...ordre];
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
    setOrdre(copie);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{T.jeu.chronologieAide}</p>
      <Reorder.Group axis="y" values={affiche} onReorder={enQuestion ? setOrdre : () => {}} className="space-y-2" aria-label={T.jeu.chronologieLibelle}>
        {affiche.map((e, i) => (
          <Element
            key={e}
            valeur={e}
            rang={i}
            total={affiche.length}
            enQuestion={enQuestion}
            bienPlace={!enQuestion && bonOrdre[i] === e}
            bonRang={bonOrdre.indexOf(e)}
            onMonter={() => deplacer(i, -1)}
            onDescendre={() => deplacer(i, 1)}
          />
        ))}
      </Reorder.Group>
      {enQuestion && (
        <button
          type="button"
          onClick={() => onValider(ordre)}
          className="min-h-14 w-full rounded-2xl bg-violet-700 font-display text-xl font-extrabold text-white shadow-lg transition hover:bg-violet-800"
        >
          {T.jeu.validerOrdre}
        </button>
      )}
    </div>
  );
}

type PropsElement = {
  valeur: string;
  rang: number;
  total: number;
  enQuestion: boolean;
  bienPlace: boolean;
  bonRang: number;
  onMonter: () => void;
  onDescendre: () => void;
};

function Element({ valeur, rang, total, enQuestion, bienPlace, bonRang, onMonter, onDescendre }: PropsElement) {
  const controles = useDragControls();
  const style = enQuestion
    ? 'bg-white border-violet-200 dark:bg-slate-800 dark:border-slate-600'
    : bienPlace
      ? 'bg-emerald-700 border-emerald-500 text-white'
      : 'bg-red-600 border-red-400 text-white';
  return (
    <Reorder.Item
      value={valeur}
      dragListener={false}
      dragControls={controles}
      className={`flex min-h-14 items-center gap-2 rounded-2xl border-2 px-3 py-2 font-bold shadow-sm ${style}`}
    >
      {enQuestion && (
        <span
          onPointerDown={(e) => controles.start(e)}
          className="cursor-grab touch-none select-none px-1 text-xl text-slate-400 active:cursor-grabbing"
          aria-hidden
        >
          ⠿
        </span>
      )}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm text-violet-800 dark:bg-violet-500/25 dark:text-violet-100" aria-hidden>
        {rang + 1}
      </span>
      <span className="flex-1">{valeur}</span>
      {enQuestion ? (
        <span className="flex gap-1">
          <button type="button" onClick={onMonter} disabled={rang === 0} className="rounded-lg px-2 py-1 hover:bg-violet-100 disabled:opacity-30 dark:hover:bg-slate-700" aria-label={`Monter « ${valeur} »`}>
            ↑
          </button>
          <button type="button" onClick={onDescendre} disabled={rang === total - 1} className="rounded-lg px-2 py-1 hover:bg-violet-100 disabled:opacity-30 dark:hover:bg-slate-700" aria-label={`Descendre « ${valeur} »`}>
            ↓
          </button>
        </span>
      ) : (
        <span className="text-sm" aria-label={bienPlace ? 'Bien placé' : `Position correcte : ${bonRang + 1}`}>
          {bienPlace ? '✓' : `→ ${bonRang + 1}`}
        </span>
      )}
    </Reorder.Item>
  );
}
