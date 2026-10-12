import { useEffect, useRef, useState, type ReactNode } from 'react';
import { T } from '@/i18n/fr';

type Props = {
  children: ReactNode;
  /** Question posée avant d'agir. */
  question: string;
  onConfirmer: () => void;
  className?: string;
};

/**
 * Action à confirmer, sans boîte de dialogue du navigateur (window.confirm est bloqué
 * dans certains contextes intégrés) : le bouton laisse place à « Confirmer / Annuler ».
 */
export function BoutonConfirmation({ children, question, onConfirmer, className = '' }: Props) {
  const [demande, setDemande] = useState(false);
  const confirmer = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (demande) confirmer.current?.focus();
  }, [demande]);
  if (!demande) {
    return (
      <button type="button" onClick={() => setDemande(true)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label={question}>
      <span className="text-sm font-semibold">{question}</span>
      <button
        ref={confirmer}
        type="button"
        onClick={() => {
          setDemande(false);
          onConfirmer();
        }}
        className="rounded-full bg-red-700 px-3 py-1 text-sm font-bold text-white"
      >
        {T.confirmation.oui}
      </button>
      <button type="button" onClick={() => setDemande(false)} className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold text-slate-900 dark:bg-slate-700 dark:text-white">
        {T.confirmation.non}
      </button>
    </span>
  );
}
