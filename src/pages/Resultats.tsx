import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BilanProgression } from '@/components/BilanProgression';
import { Etoiles } from '@/components/Etoiles';
import { Podium } from '@/components/Podium';
import { ResultatsSalon } from '@/components/SalonDirect';
import { infoCategorie } from '@/config/categories';
import { CONTRE_LA_MONTRE, MODES } from '@/config/modes';
import { cleJour, serieDeJours } from '@/engine/defi';
import { grilleEmojis, resumerPartie } from '@/engine/partie';
import { T } from '@/i18n/fr';
import { celebrerFinDePartie } from '@/lib/effets';
import { jouerSon } from '@/lib/sons';
import { useAnimationsReduites } from '@/lib/hooks';
import { LIBELLES_EPOQUES, LIBELLES_STYLES } from '@/providers/generateurs/blindtest';
import { usePartie } from '@/store/partie';
import { useRecords } from '@/store/records';
import { useRevision } from '@/store/revision';

function formaterPourcent(x: number) {
  return `${Math.round(x * 100)} %`;
}
function formaterSecondes(x: number) {
  return `${x.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} s`;
}

/** Libellé du thème joué (catégorie, ou playlist du blind test). */
function libelleTheme(categorie: Parameters<typeof infoCategorie>[0], filtre?: string) {
  if (filtre) {
    const [cle, v] = filtre.split(':');
    const l = cle === 'epoque' ? LIBELLES_EPOQUES[v as keyof typeof LIBELLES_EPOQUES] : LIBELLES_STYLES[v as keyof typeof LIBELLES_STYLES];
    if (l) return `🎧 ${l}`;
  }
  const c = infoCategorie(categorie);
  return `${c.icone} ${c.nom}`;
}

export function Resultats() {
  const navigate = useNavigate();
  const { partie, resultat, rejouer, bilan } = usePartie();
  const resteARevoir = useRevision((s) => s.questions.length);
  const defis = useRecords((s) => s.defis);
  const reduit = useAnimationsReduites();
  const [copie, setCopie] = useState(false);
  /** Presse-papiers refusé : le texte s'affiche, prêt à être sélectionné et copié. */
  const [texteAPartager, setTexteAPartager] = useState<string | null>(null);

  const fini = partie?.phase === 'terminee';
  const record = resultat?.nouveauRecord ?? false;
  const avecScore = partie ? MODES[partie.config.mode].score : false;
  useEffect(() => {
    if (!fini) return;
    return celebrerFinDePartie(record || partie?.config.mode === 'duel', reduit);
  }, [fini, record, reduit, partie?.config.mode]);

  // Fanfare de fin (plus longue en cas de record), puis scintillement si un badge est débloqué.
  const nbBadges = bilan?.badges.length ?? 0;
  useEffect(() => {
    if (!fini) return;
    jouerSon(record ? 'record' : 'fin');
    if (!nbBadges) return;
    const id = window.setTimeout(() => jouerSon('badge'), 1900);
    return () => window.clearTimeout(id);
  }, [fini, record, nbBadges]);

  const score = useMotionValue(0);
  const scoreAffiche = useTransform(score, (v) => Math.round(v).toLocaleString('fr-FR'));
  useEffect(() => {
    if (!partie) return;
    const cible = resumerPartie(partie).score;
    if (reduit) return score.set(cible);
    const c = animate(score, cible, { duration: 1.6, ease: 'easeOut', delay: 0.3 });
    return () => c.stop();
  }, [partie, reduit, score]);

  if (!partie || !fini) return <Navigate to="/jouer" replace />;

  const c = partie.config;
  const mode = MODES[c.mode];
  const r = resumerPartie(partie);
  const theme = libelleTheme(c.categorie, c.filtre);
  const texteDifficulte = T.difficultes[c.difficulte];
  const jour = c.jour ?? cleJour();

  const partager = async () => {
    const texte = T.resultats.partage(mode.nom, r.score, r.bonnes, r.total, grilleEmojis(partie.resultats), theme, texteDifficulte);
    // Le presse-papiers d'abord (dans le geste du clic) ; le partage natif du mobile en complément.
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2500);
    } catch {
      setTexteAPartager(texte);
    }
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ text: texte }).catch(() => {});
    }
  };

  const relancer = async () => {
    if (await rejouer()) navigate('/partie');
  };

  const titre =
    c.mode === 'entrainement'
      ? T.resultats.entrainementTitre
      : c.mode === 'revision'
        ? T.resultats.revisionTitre
        : c.mode === 'defi'
          ? T.resultats.defiTermine
          : T.resultats.titre;
  const sousTitre =
    c.mode === 'contre_la_montre'
      ? T.resultats.chrono(r.bonnes, CONTRE_LA_MONTRE.duree)
      : c.mode === 'survie'
        ? T.resultats.survie(partie.resultats.length)
        : `${r.bonnes} / ${r.total} bonnes réponses`;

  const stats = [
    { libelle: T.resultats.precision, valeur: formaterPourcent(r.precision), icone: '🎯' },
    { libelle: T.resultats.tempsMoyen, valeur: formaterSecondes(r.tempsMoyen), icone: '⏱️' },
    { libelle: T.resultats.meilleureSerie, valeur: String(r.meilleureSerie), icone: '🔥' },
    resultat?.ancienRecord !== undefined || record
      ? { libelle: T.resultats.record, valeur: (record ? r.score : Math.max(resultat?.ancienRecord ?? 0, r.score)).toLocaleString('fr-FR'), icone: '🏆' }
      : c.mode === 'defi'
        ? { libelle: 'Série', valeur: `${serieDeJours(Object.keys(defis), jour)} j`, icone: '📅' }
        : { libelle: 'Questions', valeur: String(r.total), icone: '❓' },
  ];

  return (
    <div className="space-y-6 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
          {mode.icone} {mode.nom} · {theme}
          {!['blind_test', 'defi', 'revision'].includes(c.mode) ? ` · ${texteDifficulte}` : ''}
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold">{titre}</h1>
      </motion.div>

      {record && (
        <motion.p
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: [0, 1.2, 1], rotate: [-8, 4, 0] }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mx-auto inline-block rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-2 font-display text-xl font-extrabold text-slate-950 shadow-lg"
        >
          🏆 {T.resultats.nouveauRecord}
        </motion.p>
      )}

      {c.mode === 'multi' && <ResultatsSalon graine={c.salon ?? ''} />}

      {r.classement ? (
        <Podium classement={r.classement} noms={partie.joueurs!.map((j) => j.nom)} />
      ) : (
        <>
          <Etoiles nombre={r.etoiles} />
          <div>
            {avecScore && (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">{T.resultats.score}</p>
                <motion.p className="font-display text-6xl font-extrabold tabular-nums text-violet-700 dark:text-amber-300" aria-label={`${r.score} points`}>
                  {scoreAffiche}
                </motion.p>
              </>
            )}
            <p className="mt-1 font-bold">{sousTitre}</p>
            <p className="mx-auto mt-2 max-w-sm text-slate-700 dark:text-slate-300">
              {c.mode === 'defi' ? T.resultats.revenirDemain : c.mode === 'revision' ? T.resultats.revisionReste(resteARevoir) : T.resultats.messages[r.etoiles]}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.libelle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }} className="rounded-2xl bg-white p-3 shadow-md dark:bg-slate-800">
                <span className="text-2xl" aria-hidden>
                  {s.icone}
                </span>
                <p className="font-display text-2xl font-extrabold tabular-nums">{s.valeur}</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.libelle}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {bilan && <BilanProgression bilan={bilan} />}

      <p className="break-all text-2xl tracking-widest" aria-label="Grille des réponses">
        {grilleEmojis(partie.resultats)}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {c.mode !== 'defi' && c.mode !== 'multi' && !(c.mode === 'revision' && resteARevoir === 0) && (
          <button type="button" onClick={() => void relancer()} className="rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 px-8 py-4 font-display text-xl font-extrabold text-white shadow-lg">
            🔁 {T.resultats.rejouer}
          </button>
        )}
        {avecScore && (
          <button type="button" onClick={() => void partager()} className="rounded-full bg-amber-400 px-8 py-4 font-display text-xl font-extrabold text-slate-950 shadow-lg">
            {copie ? `✓ ${T.resultats.copie}` : `📤 ${T.resultats.partager}`}
          </button>
        )}
      </div>
      {texteAPartager && (
        <textarea readOnly value={texteAPartager} rows={5} onFocus={(e) => e.target.select()} aria-label={T.resultats.partager} className="w-full rounded-2xl border-2 border-violet-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
      )}
      <div className="flex justify-center gap-6 font-bold">
        {c.mode !== 'defi' && c.mode !== 'revision' && c.mode !== 'multi' && (
          <Link to={`/jouer/${c.mode}`} className="text-violet-700 underline-offset-4 hover:underline dark:text-violet-300">
            {T.resultats.changer}
          </Link>
        )}
        <Link to="/" className="text-violet-700 underline-offset-4 hover:underline dark:text-violet-300">
          {T.resultats.accueil}
        </Link>
      </div>

      <section className="text-left" aria-labelledby="titre-recap">
        <h2 id="titre-recap" className="font-display text-2xl font-extrabold">
          {c.mode === 'entrainement' || c.mode === 'revision' ? T.resultats.anecdotes : T.resultats.recap}
        </h2>
        <ol className="mt-3 space-y-2">
          {partie.questions.map((q, i) => {
            const res = partie.resultats[i];
            const nom = partie.joueurs?.[q.joueur]?.nom;
            return (
              <li key={q.question.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-800">
                <span className="text-xl" aria-label={res?.correct ? 'Bonne réponse' : res?.passee ? 'Passée' : 'Mauvaise réponse'}>
                  {res?.correct ? '✅' : res?.passee ? '⏭️' : res && res.fraction > 0 ? '🟨' : '❌'}
                </span>
                <div className="min-w-0">
                  {nom && <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{nom}</p>}
                  <p className="font-bold">{q.question.enonce}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">{q.bonne}</span>
                    {res && !res.correct && res.reponse && <span> · ta réponse : {res.reponse}</span>}
                  </p>
                  {(c.mode === 'entrainement' || c.mode === 'revision') && q.question.anecdote && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">💡 {q.question.anecdote}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
