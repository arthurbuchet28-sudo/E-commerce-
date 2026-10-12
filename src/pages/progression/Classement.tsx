import { useState } from 'react';
import { INFOS_CATEGORIES } from '@/config/categories';
import { ORDRE_DIFFICULTES } from '@/config/difficulte';
import { MODES, type ModeJeu } from '@/config/modes';
import { classement } from '@/engine/progression';
import { T } from '@/i18n/fr';
import { useProfil } from '@/store/profil';
import { formaterDate, PageProgression } from './commun';

const MODES_CLASSES: ModeJeu[] = ['classique', 'contre_la_montre', 'survie', 'blind_test', 'defi', 'duel'];
const MEDAILLES = ['🥇', '🥈', '🥉'];

/** Classement local : meilleurs scores de l'appareil, par mode et par difficulté. */
export function Classement() {
  const historique = useProfil((s) => s.historique);
  const [mode, setMode] = useState<ModeJeu>('classique');
  const [difficulte, setDifficulte] = useState<string>('');
  const avecDifficulte = mode !== 'defi' && mode !== 'blind_test';
  const lignes = classement(historique, mode, avecDifficulte ? difficulte || undefined : undefined);

  return (
    <PageProgression titre={T.profil.classement}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as ModeJeu)} className="mt-1 block min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-3 font-bold dark:border-slate-700 dark:bg-slate-800">
            {MODES_CLASSES.map((m) => (
              <option key={m} value={m}>
                {MODES[m].icone} {MODES[m].nom}
              </option>
            ))}
          </select>
        </label>
        {avecDifficulte && (
          <label className="flex-1">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{T.config.difficulte}</span>
            <select value={difficulte} onChange={(e) => setDifficulte(e.target.value)} className="mt-1 block min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-3 font-bold dark:border-slate-700 dark:bg-slate-800">
              <option value="">{T.profil.toutesDifficultes}</option>
              {[...ORDRE_DIFFICULTES, 'adaptatif' as const].map((d) => (
                <option key={d} value={d}>
                  {T.difficultes[d]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {lignes.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center font-semibold shadow-sm dark:bg-slate-800">{T.profil.classementVide}</p>
      ) : (
        <table className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm dark:bg-slate-800">
          <caption className="sr-only">
            {T.profil.classement} — {MODES[mode].nom}
          </caption>
          <thead>
            <tr className="text-sm text-slate-600 dark:text-slate-400">
              <th scope="col" className="px-3 py-2">{T.profil.rang}</th>
              <th scope="col" className="px-3 py-2">{T.profil.joueur}</th>
              <th scope="col" className="px-3 py-2 text-right">{T.profil.score}</th>
              <th scope="col" className="hidden px-3 py-2 sm:table-cell">{T.profil.date}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={`${l.entreeId}-${l.nom}`} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-3 py-2 font-display text-lg font-extrabold">{MEDAILLES[l.rang - 1] ?? l.rang}</td>
                <td className="px-3 py-2">
                  <span className="font-bold">{l.nom}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {INFOS_CATEGORIES[l.categorie].icone} {INFOS_CATEGORIES[l.categorie].nom}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-display text-lg font-extrabold tabular-nums">{l.score.toLocaleString('fr-FR')}</td>
                <td className="hidden px-3 py-2 text-sm text-slate-600 sm:table-cell dark:text-slate-400">{formaterDate(l.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PageProgression>
  );
}
