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
import { AnnonceNiveau, BadgeNiveau, Coeurs, EcranRelais, TableauDuel } from '@/components/IndicateursMode';
import { infoCategorie } from '@/config/categories';
import { CONTRE_LA_MONTRE, DUEL, MODES } from '@/config/modes';
import type { Reponse } from '@/engine/evaluation';
import { estDynamique, jokerApplicable, questionCourante, tempsQuestion } from '@/engine/partie';
import { auHasard, T } from '@/i18n/fr';
import { celebrerBonneReponse, vibrer } from '@/lib/effets';
import { jouerSon, prechargerSons } from '@/lib/sons';
import { useAnimationsReduites } from '@/lib/hooks';
import { usePartie } from '@/store/partie';
import { useReglages } from '@/store/reglages';

function centre(el: Element | null | undefined) {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export function Partie() {
  const navigate = useNavigate();
  const { partie, debutQuestion, finChrono, pret, repondre, joker, suivante, quitter, commencerTour, tempsEcoule } = usePartie();
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

  const info = partie ? MODES[partie.config.mode] : undefined;
  useEffect(prechargerSons, []);
  const [restantGlobal, setRestantGlobal] = useState(CONTRE_LA_MONTRE.duree);

  // Chrono par question : décompte et temps écoulé (en duel, seulement une fois le joueur prêt).
  useEffect(() => {
    if (phase !== 'question' || total === null || !pret) return;
    const tick = () => {
      const r = total - (performance.now() - debutQuestion) / 1000;
      setRestant(Math.max(0, r));
      if (r <= 0) repondre(null);
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [phase, total, debutQuestion, repondre, pret]);

  // Tic-tac dans les 5 dernières secondes (une fois par seconde).
  const secondeTic = Math.ceil(partie?.config.mode === 'contre_la_montre' ? restantGlobal : restant);
  const modeJeu = partie?.config.mode;
  useEffect(() => {
    if (!modeJeu || phase !== 'question' || MODES[modeJeu].chrono === 'aucun' || !pret) return;
    if (secondeTic > 0 && secondeTic <= 5) jouerSon('tic');
  }, [secondeTic, phase, pret, modeJeu]);

  // Contre-la-montre : chrono global de la partie.
  useEffect(() => {
    if (finChrono === null) return;
    const tick = () => {
      const r = (finChrono - performance.now()) / 1000;
      setRestantGlobal(Math.max(0, r));
      if (r <= 0) {
        tempsEcoule();
        navigate('/resultats');
      }
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [finChrono, tempsEcoule, navigate]);

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
          rapidite: total ? 1 - dernierResultat.tempsMis / total : 0.5,
          reduit,
        });
        vibrer(30, vibrations);
      }
      if (!reduit) {
        setEnvols((e) => [...e, { id: ++idEnvol.current, points: dernierResultat.points.total, de, vers: centre(scoreRef.current) }]);
      }
    }
    if (!dernierResultat.correct && !dernierResultat.passee) vibrer([60, 40, 60], vibrations);
    if (dernierResultat.correct) jouerSon(dernierResultat.serie >= 3 ? 'combo' : 'bonne');
    else if (!dernierResultat.passee) jouerSon('mauvaise');
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

  // Contre-la-montre : on enchaîne automatiquement, sans s'arrêter sur l'anecdote.
  const enchainementAuto = partie?.config.mode === 'contre_la_montre';
  useEffect(() => {
    if (!enchainementAuto || !dernierResultat) return;
    const id = window.setTimeout(continuer, dernierResultat.correct ? CONTRE_LA_MONTRE.delaiBonne : CONTRE_LA_MONTRE.delaiMauvaise);
    return () => window.clearTimeout(id);
  }, [enchainementAuto, dernierResultat, continuer]);

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

  if (!partie || !info) return <Navigate to="/jouer" replace />;
  if (partie.phase === 'terminee') return <Navigate to="/resultats" replace />;
  if (!courante) return null;
  if (!pret && partie.joueurs) {
    const j = partie.joueurCourant;
    return <EcranRelais nom={partie.joueurs[j]!.nom} couleur={DUEL.couleurs[j]!} onPret={commencerTour} />;
  }
  const dynamique = estDynamique(partie.config) && partie.config.mode !== 'classique' && partie.config.mode !== 'entrainement';
  const adaptatif = partie.config.difficulte === 'adaptatif' || partie.config.mode === 'survie';

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

      {partie.joueurs && <TableauDuel joueurs={partie.joueurs} courant={partie.joueurCourant} scoreCourant={partie.score} />}

      {/* Barre du haut : chrono, progression, combo, score */}
      <div className="flex items-center gap-4">
        {info.chrono === 'question' && total !== null && <Chrono restant={restant} total={total} actif={enQuestion} />}
        {info.chrono === 'global' && <Chrono restant={restantGlobal} total={CONTRE_LA_MONTRE.duree} actif libelle={T.jeu.tempsGlobal(Math.ceil(restantGlobal))} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2">
              {dynamique ? T.jeu.questionSeule(partie.index + 1) : T.jeu.question(partie.index + 1, partie.config.difficulte === 'adaptatif' ? partie.config.nombreQuestions : n)}
              {adaptatif && <BadgeNiveau niveau={partie.niveau} />}
            </span>
            {partie.vies !== null && <Coeurs vies={partie.vies} />}
            {info.score && <BadgeCombo serie={partie.serie} />}
          </div>
          {!dynamique && (
          <div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={partie.resultats.length} aria-label="Progression">
            {Array.from({ length: Math.max(n, partie.config.difficulte === 'adaptatif' ? partie.config.nombreQuestions : 0) }, (_, i) => {
              const x = partie.questions[i];
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
              return <span key={x?.question.id ?? `a-venir-${i}`} className={`h-2 flex-1 rounded-full transition-colors ${couleur}`} />;
            })}
          </div>
          )}
        </div>
        {info.score && <CompteurScore ref={scoreRef} score={partie.score} reduit={reduit} />}
      </div>

      <AnnonceNiveau changement={dernierResultat?.changementNiveau} niveau={partie.niveau} />

      {/* Transition d'entrée uniquement : la question affichée est toujours celle à laquelle on répond. */}
      <motion.div key={q.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-lg shadow-violet-900/5 dark:bg-slate-800/80">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.couleur }} aria-hidden />
            <span aria-hidden>{cat.icone}</span>
            <span>{cat.nom}</span>
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
          <BarreJokers restants={partie.jokersRestants} utilises={partie.jokersUtilises} inapplicables={jokersInapplicables} actif onJoker={(j) => {
              jouerSon('joker');
              joker(j);
            }} />
          {courante.mode === 'choix' && <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{T.jeu.raccourcis}</p>}
        </div>
      ) : enchainementAuto ? null : (
        dernierResultat && (
          <CarteRevelation
            ref={suivanteRef}
            resultat={dernierResultat}
            bonne={courante.mode === 'chronologie' ? null : courante.bonne}
            anecdote={q.anecdote}
            titre={titreRevelation}
            derniere={
              partie.vies === 0 ||
              (!estDynamique(partie.config) && partie.index + 1 >= n) ||
              (partie.config.difficulte === 'adaptatif' && !dynamique && partie.index + 1 >= partie.config.nombreQuestions)
            }
            avecPoints={info.score}
            question={q}
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
