import { INFOS_CATEGORIES } from '@/config/categories';
import { MODES } from '@/config/modes';
import { T } from '@/i18n/fr';
import { useProfil } from '@/store/profil';
import { formaterDate, PageProgression, Vide } from './commun';

export function Historique() {
  const historique = useProfil((s) => s.historique);
  return (
    <PageProgression titre={T.profil.historique}>
      {historique.length === 0 ? (
        <Vide texte={T.profil.aucunePartie} />
      ) : (
        <ol className="space-y-2">
          {historique.map((e) => {
            const mode = MODES[e.mode];
            const cat = INFOS_CATEGORIES[e.categorie];
            return (
              <li key={e.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold">
                    {mode.icone} {mode.nom} · {cat.icone} {cat.nom}
                    {!['defi', 'blind_test', 'revision'].includes(e.mode) && <span className="text-slate-600 dark:text-slate-400"> · {T.difficultes[e.difficulte as keyof typeof T.difficultes] ?? e.difficulte}</span>}
                  </p>
                  <time dateTime={e.date} className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formaterDate(e.date, true)}
                  </time>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="break-all tracking-wider" aria-label="Grille des réponses">
                    {e.grille}
                  </p>
                  <p className="text-sm font-semibold">
                    {e.bonnes}/{e.total} · {Math.round(e.precision * 100)} %
                    {MODES[e.mode].score && <span className="font-display text-base font-extrabold text-violet-700 dark:text-amber-300"> · {e.score.toLocaleString('fr-FR')} pts</span>}
                  </p>
                </div>
                {e.mode === 'duel' && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {[...e.joueurs].sort((a, b) => b.score - a.score).map((j) => `${j.nom} ${j.score.toLocaleString('fr-FR')}`).join(' · ')}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </PageProgression>
  );
}
