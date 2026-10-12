import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { T } from '@/i18n/fr';
import { useAdmin, type MotifSignalement } from '@/store/admin';
import type { Question } from '@/types/question';

/** Bouton « Signaler cette question » (erreur, réponse discutable…), enregistré localement et visible dans l'admin. */
export function SignalerQuestion({ question }: { question: Question }) {
  const signaler = useAdmin((s) => s.signaler);
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState<MotifSignalement>('erreur');
  const [commentaire, setCommentaire] = useState('');
  const [envoye, setEnvoye] = useState(false);

  if (envoye) return <p className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300" role="status">✓ {T.signalement.merci}</p>;
  return (
    <div className="mt-3">
      {!ouvert ? (
        <button type="button" onClick={() => setOuvert(true)} className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-400">
          ⚑ {T.signalement.bouton}
        </button>
      ) : (
        <AnimatePresence>
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 rounded-2xl bg-white/80 p-3 text-left dark:bg-slate-900/60"
            onSubmit={(e) => {
              e.preventDefault();
              signaler({ questionId: question.id, question, motif, commentaire: commentaire.trim() });
              setEnvoye(true);
            }}
          >
            <fieldset>
              <legend className="font-bold">{T.signalement.titre}</legend>
              <div className="mt-1 grid gap-1">
                {(Object.keys(T.signalement.motifs) as MotifSignalement[]).map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="motif" value={m} checked={motif === m} onChange={() => setMotif(m)} className="accent-violet-700" />
                    {T.signalement.motifs[m]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              <span className="font-semibold">{T.signalement.commentaire}</span>
              <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={2} maxLength={500} className="mt-1 block w-full rounded-xl border-2 border-slate-200 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded-full bg-violet-700 px-4 py-2 text-sm font-bold text-white">
                {T.signalement.envoyer}
              </button>
              <button type="button" onClick={() => setOuvert(false)} className="rounded-full px-4 py-2 text-sm font-bold">
                {T.signalement.annuler}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  );
}
