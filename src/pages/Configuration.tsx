import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LISTE_CATEGORIES_JEU } from '@/config/categories';
import { NOMBRES_QUESTIONS } from '@/config/difficulte';
import { BLIND_TEST, CONTRE_LA_MONTRE, DUEL, MODES, type ModeJeu } from '@/config/modes';
import { T } from '@/i18n/fr';
import { LIBELLES_EPOQUES, LIBELLES_STYLES } from '@/providers/generateurs/blindtest';
import { usePartie } from '@/store/partie';
import { useReglages } from '@/store/reglages';
import { SelecteurDifficulte } from '@/components/SelecteurDifficulte';

const MODES_CONFIGURABLES: ModeJeu[] = ['classique', 'contre_la_montre', 'survie', 'blind_test', 'duel', 'entrainement'];

function Pastille({ nom, valeur, choisi, onChange, children }: { nom: string; valeur: string; choisi: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label>
      <input type="radio" name={nom} value={valeur} checked={choisi} onChange={onChange} className="peer sr-only" />
      <span className="block cursor-pointer rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 font-bold transition peer-checked:border-violet-700 peer-checked:bg-violet-700 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-amber-400 dark:border-slate-700 dark:bg-slate-800">
        {children}
      </span>
    </label>
  );
}

function ChoixCategorie() {
  const { derniereCategorie: categorie, modifier } = useReglages();
  return (
    <fieldset>
      <legend className="font-display text-xl font-extrabold">{T.config.categorie}</legend>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LISTE_CATEGORIES_JEU.map((c, i) => {
          const choisi = c.id === categorie;
          return (
            <motion.label
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className={`relative cursor-pointer ${c.id === 'mix' ? 'col-span-2 sm:col-span-3' : ''}`}
            >
              <input type="radio" name="categorie" value={c.id} checked={choisi} onChange={() => modifier({ derniereCategorie: c.id })} className="peer sr-only" />
              <span
                className={`flex h-full min-h-24 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-3 text-white shadow-md transition peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-400 ${c.degrade} ${
                  choisi ? 'scale-[1.02] ring-4 ring-violet-900 ring-offset-2 ring-offset-violet-50 dark:ring-white dark:ring-offset-[#140c2e]' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <span className="text-3xl drop-shadow" aria-hidden>
                  {c.icone}
                </span>
                <span className="font-display text-lg font-extrabold leading-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.45)]">{c.nom}</span>
                <span className="text-xs font-bold [text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">{c.accroche}</span>
                {choisi && (
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2 text-sm font-extrabold text-violet-800" aria-hidden>
                    ✓
                  </span>
                )}
              </span>
            </motion.label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ChoixNombre({ titre, valeurs, valeur, onChange }: { titre: string; valeurs: readonly number[]; valeur: number; onChange: (n: number) => void }) {
  return (
    <fieldset>
      <legend className="font-display text-xl font-extrabold">{titre}</legend>
      <div className="mt-2 flex gap-2">
        {valeurs.map((n) => (
          <Pastille key={n} nom={titre} valeur={String(n)} choisi={valeur === n} onChange={() => onChange(n)}>
            <span className="font-display text-xl">{n}</span>
          </Pastille>
        ))}
      </div>
    </fieldset>
  );
}

function ChoixPlaylist() {
  const { dernierFiltre, modifier } = useReglages();
  const groupe = (titre: string, entrees: [string, string][]) => (
    <div>
      <p className="mb-1 text-sm font-bold text-slate-600 dark:text-slate-400">{titre}</p>
      <div className="flex flex-wrap gap-2">
        {entrees.map(([v, l]) => (
          <Pastille key={v} nom="playlist" valeur={v} choisi={dernierFiltre === v} onChange={() => modifier({ dernierFiltre: v })}>
            {l}
          </Pastille>
        ))}
      </div>
    </div>
  );
  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-xl font-extrabold">{T.config.musique}</legend>
      {groupe('', [['', `🎶 ${T.config.toutes}`]])}
      {groupe(T.config.parEpoque, Object.entries(LIBELLES_EPOQUES).map(([k, l]) => [`epoque:${k}`, l]))}
      {groupe(T.config.parStyle, Object.entries(LIBELLES_STYLES).map(([k, l]) => [`style:${k}`, l]))}
    </fieldset>
  );
}

function ChoixJoueurs() {
  const { derniersJoueurs: joueurs, modifier } = useReglages();
  const maj = (liste: string[]) => modifier({ derniersJoueurs: liste });
  return (
    <fieldset>
      <legend className="font-display text-xl font-extrabold">{T.config.joueurs}</legend>
      <div className="mt-2 space-y-2">
        {joueurs.map((nom, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: DUEL.couleurs[i] }} aria-hidden />
            <input
              type="text"
              value={nom}
              maxLength={16}
              onChange={(e) => maj(joueurs.map((n, j) => (j === i ? e.target.value : n)))}
              aria-label={T.config.nomJoueur(i + 1)}
              className="min-h-12 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 font-bold outline-none focus:border-violet-600 dark:border-slate-700 dark:bg-slate-800"
            />
            {joueurs.length > DUEL.minJoueurs && (
              <button type="button" onClick={() => maj(joueurs.filter((_, j) => j !== i))} className="rounded-xl px-3 py-2 text-xl hover:bg-red-100 dark:hover:bg-red-950" aria-label={T.config.retirerJoueur(nom || T.config.nomJoueur(i + 1))}>
                ✕
              </button>
            )}
          </div>
        ))}
        {joueurs.length < DUEL.maxJoueurs && (
          <button type="button" onClick={() => maj([...joueurs, T.config.nomJoueur(joueurs.length + 1)])} className="rounded-2xl border-2 border-dashed border-violet-300 px-4 py-2 font-bold text-violet-700 dark:border-slate-600 dark:text-violet-300">
            {T.config.ajouterJoueur}
          </button>
        )}
      </div>
    </fieldset>
  );
}

export function Configuration() {
  const navigate = useNavigate();
  const { mode: modeParam } = useParams();
  const reglages = useReglages();
  const { lancer, chargement, erreur } = usePartie();
  const mode = modeParam as ModeJeu;
  if (!MODES_CONFIGURABLES.includes(mode)) return <Navigate to="/jouer/classique" replace />;
  const info = MODES[mode];

  const difficulte = mode === 'survie' && reglages.derniereDifficulte === 'adaptatif' ? 'facile' : reglages.derniereDifficulte;
  const joueurs = reglages.derniersJoueurs.map((n, i) => n.trim() || T.config.nomJoueur(i + 1));

  const demarrer = async () => {
    const nombre =
      mode === 'duel' ? reglages.dernierParJoueur * joueurs.length : mode === 'blind_test' ? BLIND_TEST.nombre : reglages.dernierNombre;
    const ok = await lancer({
      mode,
      categorie: mode === 'blind_test' ? 'chansons_francaises' : reglages.derniereCategorie,
      difficulte,
      nombreQuestions: nombre,
      joueurs: mode === 'duel' ? joueurs : undefined,
      filtre: mode === 'blind_test' ? reglages.dernierFiltre || undefined : undefined,
    });
    if (ok) navigate('/partie');
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-3xl bg-gradient-to-br p-5 text-slate-950 shadow-lg ${info.degrade}`}>
        <p className="text-4xl" aria-hidden>
          {info.icone}
        </p>
        <h1 className="font-display text-3xl font-extrabold">{info.nom}</h1>
        <p className="font-semibold">
          {mode === 'contre_la_montre' ? T.config.chronoAide(CONTRE_LA_MONTRE.duree) : mode === 'entrainement' ? T.config.entrainementAide : info.description}
        </p>
      </div>

      {mode === 'duel' && <ChoixJoueurs />}
      {mode === 'blind_test' ? <ChoixPlaylist /> : <ChoixCategorie />}
      {mode !== 'blind_test' && (
        <SelecteurDifficulte
          valeur={difficulte}
          onChange={(d) => reglages.modifier({ derniereDifficulte: d })}
          avecAdaptatif={mode !== 'survie' && mode !== 'duel'}
          titre={mode === 'survie' ? T.config.survieDepart : T.config.difficulte}
        />
      )}
      {mode === 'blind_test' && (
        <SelecteurDifficulte valeur={difficulte === 'adaptatif' ? 'moyen' : difficulte} onChange={(d) => reglages.modifier({ derniereDifficulte: d })} avecAdaptatif={false} />
      )}
      {(mode === 'classique' || mode === 'entrainement') && (
        <ChoixNombre titre={T.config.nombre} valeurs={NOMBRES_QUESTIONS} valeur={reglages.dernierNombre} onChange={(n) => reglages.modifier({ dernierNombre: n })} />
      )}
      {mode === 'duel' && (
        <ChoixNombre titre={T.config.parJoueur} valeurs={DUEL.questionsParJoueur} valeur={reglages.dernierParJoueur} onChange={(n) => reglages.modifier({ dernierParJoueur: n })} />
      )}

      {erreur && (
        <p role="alert" className="rounded-2xl bg-red-100 p-4 font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
          {erreur === 'blind-test-indisponible' ? T.config.blindTestIndisponible : T.config.erreur}
        </p>
      )}

      <div className="sticky bottom-4">
        <motion.button
          type="button"
          onClick={() => void demarrer()}
          disabled={chargement}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 py-5 font-display text-2xl font-extrabold text-white shadow-xl shadow-fuchsia-600/30 disabled:opacity-70"
        >
          {chargement ? T.config.chargement : `${T.config.lancer} 🚀`}
        </motion.button>
      </div>
    </div>
  );
}
