import { useState } from 'react';
import { INFOS_CATEGORIES } from '@/config/categories';
import { MODES, ORDRE_MODES } from '@/config/modes';
import { forcesEtFaiblesses, type StatsCategorie } from '@/engine/progression';
import { T } from '@/i18n/fr';
import { useProfil } from '@/store/profil';
import type { Categorie } from '@/types/question';
import { PageProgression, Tuile, Vide } from './commun';

type Ligne = { categorie: Categorie; questions: number; bonnes: number; taux: number };

/**
 * Réussite par catégorie : une seule série (taux de bonnes réponses), en barres horizontales triées.
 * Teinte unique validée sur les deux surfaces (#7c3aed en clair, #8b5cf6 en sombre), valeur au bout de la barre
 * en couleur de texte, infobulle au survol / au focus, et vue tableau équivalente.
 */
function GraphiqueReussite({ lignes }: { lignes: Ligne[] }) {
  const [actif, setActif] = useState<Categorie | null>(null);
  return (
    <ul className="space-y-1" aria-label={T.profil.parCategorie}>
      {lignes.map((l) => {
        const info = INFOS_CATEGORIES[l.categorie];
        const pct = Math.round(l.taux * 100);
        return (
          <li
            key={l.categorie}
            tabIndex={0}
            onMouseEnter={() => setActif(l.categorie)}
            onMouseLeave={() => setActif(null)}
            onFocus={() => setActif(l.categorie)}
            onBlur={() => setActif(null)}
            className="relative grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3 rounded-xl px-2 py-1.5 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-amber-400 sm:grid-cols-[minmax(0,13rem)_1fr] dark:hover:bg-slate-700/40"
            aria-label={`${info.nom} : ${pct} % de réussite, ${l.bonnes} sur ${l.questions}`}
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span aria-hidden>{info.icone}</span>
              <span className="truncate">{info.nom}</span>
            </span>
            <span className="flex items-center gap-2" aria-hidden>
              {/* Ligne de base fine (1 px) d'où partent toutes les barres ; 0 % = pas de barre. */}
              <span className="relative h-3.5 flex-1 border-l border-slate-300 dark:border-slate-600">
                {pct > 0 && <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[#7c3aed] dark:bg-[#8b5cf6]" style={{ width: `${pct}%` }} />}
              </span>
              <span className="w-11 text-right text-sm font-bold tabular-nums text-slate-700 dark:text-slate-300">{pct} %</span>
            </span>
            {actif === l.categorie && (
              <span role="tooltip" className="pointer-events-none absolute -top-9 right-2 z-10 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg dark:bg-white dark:text-slate-900">
                {info.nom} : {l.bonnes} bonne{l.bonnes > 1 ? 's' : ''} sur {T.profil.nQuestions(l.questions)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function TableauReussite({ lignes }: { lignes: Ligne[] }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">{T.profil.parCategorie}</caption>
      <thead>
        <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400">
          <th scope="col" className="py-2 font-bold">Catégorie</th>
          <th scope="col" className="py-2 text-right font-bold">Bonnes</th>
          <th scope="col" className="py-2 text-right font-bold">Questions</th>
          <th scope="col" className="py-2 text-right font-bold">{T.profil.reussite}</th>
        </tr>
      </thead>
      <tbody>
        {lignes.map((l) => (
          <tr key={l.categorie} className="border-b border-slate-100 dark:border-slate-800">
            <th scope="row" className="py-2 font-semibold">
              {INFOS_CATEGORIES[l.categorie].icone} {INFOS_CATEGORIES[l.categorie].nom}
            </th>
            <td className="py-2 text-right tabular-nums">{l.bonnes}</td>
            <td className="py-2 text-right tabular-nums">{l.questions}</td>
            <td className="py-2 text-right font-bold tabular-nums">{Math.round(l.taux * 100)} %</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Statistiques() {
  const stats = useProfil((s) => s.stats);
  const [vueTableau, setVueTableau] = useState(false);
  if (!stats.parties) {
    return (
      <PageProgression titre={T.profil.statistiques}>
        <Vide texte={T.profil.aucunePartie} />
      </PageProgression>
    );
  }
  const lignes: Ligne[] = (Object.entries(stats.parCategorie) as [Categorie, StatsCategorie][])
    .filter(([, s]) => s.questions > 0)
    .map(([categorie, s]) => ({ categorie, ...s, taux: s.bonnes / s.questions }))
    .sort((a, b) => b.taux - a.taux || b.questions - a.questions);
  const { forte, aTravailler } = forcesEtFaiblesses(stats);

  return (
    <PageProgression titre={T.profil.statistiques}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tuile icone="🎮" libelle={T.profil.parties} valeur={String(stats.parties)} />
        <Tuile icone="❓" libelle={T.profil.questions} valeur={stats.questions.toLocaleString('fr-FR')} />
        <Tuile icone="🎯" libelle={T.profil.reussite} valeur={`${Math.round((stats.bonnes / Math.max(1, stats.questions)) * 100)} %`} />
        <Tuile icone="🔥" libelle={T.profil.meilleureSerie} valeur={String(stats.meilleureSerie)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {forte || aTravailler ? (
          <>
            {forte && (
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">💪 {T.profil.forte}</p>
                <p className="font-display text-xl font-extrabold">
                  {INFOS_CATEGORIES[forte].icone} {INFOS_CATEGORIES[forte].nom}
                </p>
              </div>
            )}
            {aTravailler && (
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">🛠️ {T.profil.aTravailler}</p>
                <p className="font-display text-xl font-extrabold">
                  {INFOS_CATEGORIES[aTravailler].icone} {INFOS_CATEGORIES[aTravailler].nom}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm font-semibold text-slate-600 sm:col-span-2 dark:text-slate-400">{T.profil.pasAssez}</p>
        )}
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-md dark:bg-slate-800" aria-labelledby="titre-reussite">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="titre-reussite" className="font-display text-xl font-extrabold">
            {T.profil.parCategorie}
          </h2>
          <button type="button" onClick={() => setVueTableau((v) => !v)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold dark:bg-slate-700" aria-pressed={vueTableau}>
            {vueTableau ? T.profil.voirGraphique : T.profil.voirTableau}
          </button>
        </div>
        {vueTableau ? <TableauReussite lignes={lignes} /> : <GraphiqueReussite lignes={lignes} />}
      </section>

      <section aria-labelledby="titre-modes-stats">
        <h2 id="titre-modes-stats" className="font-display text-xl font-extrabold">
          {T.profil.parMode}
        </h2>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[...ORDRE_MODES, 'revision' as const].map((m) => (
            <li key={m} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-slate-800">
              <span className="text-sm font-semibold">
                {MODES[m].icone} {MODES[m].nom}
              </span>
              <span className="font-display text-lg font-extrabold tabular-nums">{stats.parMode[m] ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageProgression>
  );
}
