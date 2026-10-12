import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// L'animation porte sur le lien lui-même : un conteneur animé avec whileTap deviendrait un arrêt de tabulation vide.
const LienAnime = motion.create(Link);
import { LISTE_CATEGORIES_JEU } from '@/config/categories';
import { DEFI, MODES, ORDRE_MODES } from '@/config/modes';
import { cleJour, serieDeJours } from '@/engine/defi';
import { T } from '@/i18n/fr';
import { banqueLocale } from '@/providers/local';
import { Logo } from '@/components/Layout';
import { usePartie } from '@/store/partie';
import { useRecords } from '@/store/records';
import { useProfil } from '@/store/profil';
import { useRevision } from '@/store/revision';
import { Avatar } from '@/components/Avatar';
import { BarreXp } from '@/components/BarreXp';
import { niveauDepuisXp } from '@/engine/progression';

export function Accueil() {
  const navigate = useNavigate();
  const defis = useRecords((s) => s.defis);
  const { lancer, chargement } = usePartie();
  const jour = cleJour();
  const defiDuJour = defis[jour];
  const serie = serieDeJours(Object.keys(defis), jour);
  const { pseudo, avatar, xp, stats } = useProfil();
  const aRevoir = useRevision((s) => s.questions.length);

  const reviser = async () => {
    if (await lancer({ mode: 'revision', categorie: 'mix', difficulte: 'moyen', nombreQuestions: 10 })) navigate('/partie');
  };

  const jouerDefi = async () => {
    if (await lancer({ mode: 'defi', categorie: 'mix', difficulte: DEFI.difficulte, nombreQuestions: DEFI.nombre, jour })) navigate('/partie');
  };

  return (
    <div className="space-y-10">
      <section className="pt-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
          <h1>
            <Logo grand />
          </h1>
        </motion.div>
        <p className="mx-auto mt-3 max-w-md text-lg text-slate-700 dark:text-slate-300">{T.accueil.sousTitre}</p>
        <div className="mt-8">
          <LienAnime
            to="/jouer/classique"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 px-10 py-5 font-display text-3xl font-extrabold text-white shadow-xl shadow-fuchsia-600/30"
          >
            <span aria-hidden>▶</span> {T.accueil.jouer}
          </LienAnime>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{T.accueil.stats(banqueLocale().length)}</p>
      </section>

      <section aria-labelledby="titre-amis" className="rounded-3xl bg-gradient-to-br from-cyan-300 to-sky-400 p-5 text-slate-950 shadow-lg">
        <h2 id="titre-amis" className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <span aria-hidden>📱</span> {T.multi.titre}
        </h2>
        <p className="mt-1 font-semibold">{T.multi.accroche}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/jouer/multi" className="rounded-full bg-slate-950 px-6 py-3 font-display text-lg font-extrabold text-cyan-200 shadow-lg transition hover:-translate-y-0.5">
            {T.multi.creer}
          </Link>
          <Link to="/salon" className="rounded-full bg-white px-6 py-3 font-display text-lg font-extrabold text-sky-900 shadow-lg transition hover:-translate-y-0.5">
            {T.multi.rejoindreTitre}
          </Link>
        </div>
      </section>

      {stats.parties > 0 && (
        <Link to="/profil" className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-md transition hover:-translate-y-0.5 dark:bg-slate-800">
          <Avatar avatar={avatar} taille={56} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-extrabold">{T.profil.bonjour(pseudo)}</p>
            <BarreXp info={niveauDepuisXp(xp)} xp={xp} />
          </div>
        </Link>
      )}

      <section aria-labelledby="titre-defi" className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="titre-defi" className="flex items-center gap-2 font-display text-2xl font-extrabold">
              <span aria-hidden>📅</span> {T.accueil.defiTitre}
            </h2>
            <p className="mt-1 font-semibold">{defiDuJour ? T.accueil.defiFait(defiDuJour.bonnes, defiDuJour.total) : T.accueil.defiAJouer}</p>
            <p className="mt-1 text-sm font-bold text-emerald-50">{T.accueil.serieJours(serie)}</p>
            {defiDuJour && <p className="mt-2 text-xl tracking-widest" aria-label="Grille du défi">{defiDuJour.grille}</p>}
          </div>
          {!defiDuJour && (
            <button
              type="button"
              onClick={() => void jouerDefi()}
              disabled={chargement}
              className="shrink-0 rounded-full bg-white px-5 py-3 font-display text-lg font-extrabold text-emerald-800 shadow-lg transition hover:-translate-y-0.5"
            >
              {T.accueil.jouerDefi}
            </button>
          )}
        </div>
      </section>

      {aRevoir > 0 && (
        <section className="flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-yellow-200 to-amber-300 p-5 text-slate-950 shadow-lg sm:flex-row sm:items-center sm:justify-between" aria-labelledby="titre-revision">
          <div>
            <h2 id="titre-revision" className="flex items-center gap-2 font-display text-2xl font-extrabold">
              <span aria-hidden>🔁</span> {T.profil.revision}
            </h2>
            <p className="font-semibold">{T.profil.revisionCompte(aRevoir)}</p>
          </div>
          <button type="button" onClick={() => void reviser()} disabled={chargement} className="rounded-full bg-slate-950 px-6 py-3 font-display text-lg font-extrabold text-amber-200 shadow-lg">
            {T.profil.reviser}
          </button>
        </section>
      )}

      <section aria-labelledby="titre-modes">
        <h2 id="titre-modes" className="font-display text-2xl font-extrabold">
          {T.accueil.modes}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ORDRE_MODES.filter((m) => m !== 'defi' && m !== 'revision').map((id, i) => {
            const m = MODES[id];
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={id === 'classique' ? 'col-span-2 sm:col-span-1' : ''}>
                <Link to={`/jouer/${id}`} className={`flex h-full flex-col rounded-3xl bg-gradient-to-br p-4 text-slate-950 shadow-lg transition hover:-translate-y-1 ${m.degrade}`}>
                  <span className="text-3xl" aria-hidden>
                    {m.icone}
                  </span>
                  <span className="font-display text-xl font-extrabold">{m.nom}</span>
                  <span className="text-sm font-semibold">{m.description}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section aria-label="Thèmes">
        <div className="flex flex-wrap justify-center gap-2">
          {LISTE_CATEGORIES_JEU.map((c) => (
            <span key={c.id} className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold shadow-sm dark:bg-slate-800/70">
              <span aria-hidden>{c.icone}</span> {c.nom}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
