import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BadgeCombo } from '@/components/BadgeCombo';
import { BarreJokers } from '@/components/BarreJokers';
import { CarteRevelation } from '@/components/CarteRevelation';
import { Chrono } from '@/components/Chrono';
import { CompteurScore } from '@/components/CompteurScore';
import { ImageQuestion, LecteurAudio } from '@/components/MediaQuestion';
import { PointsVolants, type Envol } from '@/components/PointsVolants';
import { ZoneChoix } from '@/components/zones/ZoneChoix';
import { ZoneChronologie } from '@/components/zones/ZoneChronologie';
import { ZoneEstimation } from '@/components/zones/ZoneEstimation';
import { ZoneSaisie } from '@/components/zones/ZoneSaisie';
import { infoCategorie } from '@/config/categories';
import type { Reponse } from '@/engine/evaluation';
import { jokerApplicable, questionCourante, tempsQuestion } from '@/engine/partie';
import { auHasard, T } from '@/i18n/fr';
import { celebrerBonneReponse, vibrer } from '@/lib/effets';
import { useAnimationsReduites } from '@/lib/hooks';
import { usePartie } from '@/store/partie';
import { useReglages } from '@/store/reglages';

function centre(el: Element | null | undefined) {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export function Partie() {
  const navigate = useNavigate();
  const { partie, debutQuestion, repondre, joker, suivante, quitter } = usePartie();
  const reduit = useAnimationsReduites();
  const vibrations = useReglages((s) => s.vibrations);

  const [restant, setRestant] = useState(0);
  const [reponseJoueur, setReponseJoueur] = useState<Reponse>(null);
  const [envols, setEnvols] = useState<Envol[]>([]);
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);
  const zoneRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const suivanteRef = useRef<HTMLButtonElement>(null);
  const idEnvol = useRef(0);

  const courante = partie ? questionCourante(partie) : undefined;
  const phase = partie?.phase;
  const enQuestion = phase === 'question';
  const total = partie ? tempsQuestion(partie) : 0;

  // Chrono : décompte et temps écoulé.
  useEffect(() => {
    if (phase !== 'question') return;
    const tick = () => {
      const r = total - (performance.now() - debutQuestion) / 1000;
      setRestant(Math.max(0, r));
      if (r <= 0) repondre(null);
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [phase, total, debutQuestion, repondre]);

  // Réinitialise la réponse à chaque nouvelle question.
  useEffect(() => {
    setReponseJoueur(null);
  }, [partie?.index]);

  const dernierResultat = phase === 'revelation' ? partie?.resultats.at(-1) : undefined;
  const titreRevelation = useMemo(() => {
    if (!dernierResultat) return '';
    if (dernierResultat.passee) return T.jeu.passee;
    if (dernierResultat.correct) return auHasard(T.jeu.bravo);
    if (dernierResultat.reponse === null) return T.jeu.tempsEcoule;
    return dernierResultat.fraction > 0 ? auHasard(T.jeu.partiel) : auHasard(T.jeu.rate);
  }, [dernierResultat]);

  // Effets à la révélation de la réponse.
  const resultatTraite = useRef<typeof dernierResultat>(undefined);
  useEffect(() => {
    if (!dernierResultat || resultatTraite.current === dernierResultat || !courante) return;
    resultatTraite.current = dernierResultat;
    if (dernierResultat.points.total > 0) {
      const cible = courante.mode === 'choix' ? boutons.current[courante.choix.indexOf(courante.bonne)] : zoneRef.current;
      const de = centre(cible);
      if (dernierResultat.correct) {
        celebrerBonneReponse({
          origine: { x: de.x / window.innerWidth, y: de.y / window.innerHeight },
          serie: dernierResultat.serie,
          rapidite: total > 0 ? 1 - dernierResultat.tempsMis / total : 0,
          reduit,
        });
        vibrer(30, vibrations);
      }
      if (!reduit) {
        setEnvols((e) => [...e, { id: ++idEnvol.current, points: dernierResultat.points.total, de, vers: centre(scoreRef.current) }]);
      }
    }
    if (!dernierResultat.correct && !dernierResultat.passee) vibrer([60, 40, 60], vibrations);
    // Focus sur « Question suivante » pour enchaîner au clavier.
    window.setTimeout(() => suivanteRef.current?.focus({ preventScroll: true }), 350);
  }, [dernierResultat, courante, total, reduit, vibrations]);

  const envoyer = useCallback(
    (r: Reponse) => {
      if (phase !== 'question') return;
      setReponseJoueur(r);
      repondre(r);
    },
    [phase, repondre],
  );

  const choisir = useCallback(
    (c: string) => {
      if (!partie?.choixMasques.includes(c)) envoyer(c);
    },
    [partie?.choixMasques, envoyer],
  );

  const continuer = useCallback(() => {
    suivante();
    if (usePartie.getState().partie?.phase === 'terminee') navigate('/resultats');
  }, [suivante, navigate]);

  // Clavier : 1 à 6 pour répondre (QCM), Entrée pour continuer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!courante || e.ctrlKey || e.metaKey || e.altKey) return;
      const dansChamp = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const n = Number.parseInt(e.key, 10);
      if (phase === 'question' && courante.mode === 'choix' && !dansChamp && n >= 1 && n <= courante.choix.length) {
        e.preventDefault();
        choisir(courante.choix[n - 1]!);
      } else if (phase === 'revelation' && e.key === 'Enter' && document.activeElement !== suivanteRef.current) {
        e.preventDefault();
        continuer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [courante, phase, choisir, continuer]);

  if (!partie) return <Navigate to="/jouer" replace />;
  if (partie.phase === 'terminee') return <Navigate to="/resultats" replace />;
  if (!courante) return null;

  const q = courante.question;
  const cat = infoCategorie(q.categorie);
  const abandonner = () => {
    if (window.confirm(T.jeu.confirmerAbandon)) {
      quitter();
      navigate('/');
    }
  };
  const n = partie.questions.length;
  const jokersInapplicables = (['cinquante', 'indice', 'passer', 'temps'] as const).filter((j) => !jokerApplicable(courante, j));

  return (
    <div className="space-y-5">
      <PointsVolants envols={envols} onFini={(id) => setEnvols((e) => e.filter((x) => x.id !== id))} />

      {/* Barre du haut : chrono, progression, combo, score */}
      <div className="flex items-center gap-4">
        <Chrono restant={restant} total={total} actif={enQuestion} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <span>{T.jeu.question(partie.index + 1, n)}</span>
            <BadgeCombo serie={partie.serie} />
          </div>
          <div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={partie.resultats.length} aria-label="Progression">
            {partie.questions.map((x, i) => {
              const r = partie.resultats[i];
              const couleur = r
                ? r.correct
                  ? 'bg-emerald-500'
                  : r.passee
                    ? 'bg-slate-400'
                    : r.fraction > 0
                      ? 'bg-amber-400'
                      : 'bg-red-500'
                : i === partie.index
                  ? 'bg-violet-500'
                  : 'bg-slate-200 dark:bg-slate-700';
              return <span key={x.question.id} className={`h-2 flex-1 rounded-full transition-colors ${couleur}`} />;
            })}
          </div>
        </div>
        <CompteurScore ref={scoreRef} score={partie.score} reduit={reduit} />
      </div>

      {/* Transition d'entrée uniquement : la question affichée est toujours celle à laquelle on répond. */}
      <motion.div key={q.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-lg shadow-violet-900/5 dark:bg-slate-800/80">
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white" style={{ backgroundColor: cat.couleur }}>
            <span aria-hidden>{cat.icone}</span>
            <span className="[text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">{cat.nom}</span>
          </span>
          <h1 className="mt-3 font-display text-2xl font-extrabold leading-snug sm:text-3xl">{q.enonce}</h1>
          {q.media?.image && <ImageQuestion question={q} />}
          {q.media?.audio && <LecteurAudio question={q} actif={enQuestion} />}
          {partie.indice && enQuestion && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-bold text-amber-700 dark:text-amber-300">
              💡 {partie.indice}
            </motion.p>
          )}
        </div>

        <div ref={zoneRef}>
          {courante.mode === 'choix' && (
            <ZoneChoix
              courante={courante}
              enQuestion={enQuestion}
              masques={partie.choixMasques}
              choixJoueur={typeof reponseJoueur === 'string' ? reponseJoueur : null}
              onChoisir={choisir}
              boutonsRef={boutons}
            />
          )}
          {courante.mode === 'saisie' && <ZoneSaisie enQuestion={enQuestion} resultat={dernierResultat} onValider={envoyer} />}
          {courante.mode === 'chronologie' && (
            <ZoneChronologie courante={courante} enQuestion={enQuestion} ordreJoueur={Array.isArray(reponseJoueur) ? reponseJoueur : null} onValider={envoyer} />
          )}
          {courante.mode === 'estimation' && <ZoneEstimation courante={courante} enQuestion={enQuestion} resultat={dernierResultat} onValider={envoyer} />}
        </div>
      </motion.div>

      {enQuestion ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BarreJokers restants={partie.jokersRestants} utilises={partie.jokersUtilises} inapplicables={jokersInapplicables} actif onJoker={joker} />
          {courante.mode === 'choix' && <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{T.jeu.raccourcis}</p>}
        </div>
      ) : (
        dernierResultat && (
          <CarteRevelation
            ref={suivanteRef}
            resultat={dernierResultat}
            bonne={courante.mode === 'chronologie' ? null : courante.bonne}
            anecdote={q.anecdote}
            titre={titreRevelation}
            derniere={partie.index + 1 >= n}
            onSuivante={continuer}
          />
        )
      )}

      <div className="pt-2 text-center">
        <button type="button" onClick={abandonner} className="text-sm font-semibold text-slate-500 underline-offset-4 hover:underline dark:text-slate-400">
          {T.jeu.abandonner}
        </button>
      </div>
    </div>
  );
}
