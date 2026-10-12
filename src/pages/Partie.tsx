import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BadgeCombo } from '@/components/BadgeCombo';
import { BarreJokers } from '@/components/BarreJokers';
import { BoutonReponse, type EtatBouton } from '@/components/BoutonReponse';
import { CarteRevelation } from '@/components/CarteRevelation';
import { Chrono } from '@/components/Chrono';
import { CompteurScore } from '@/components/CompteurScore';
import { PointsVolants, type Envol } from '@/components/PointsVolants';
import { infoCategorie } from '@/config/categories';
import { questionCourante, tempsQuestion } from '@/engine/partie';
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
  const [choixJoueur, setChoixJoueur] = useState<string | null>(null);
  const [envols, setEnvols] = useState<Envol[]>([]);
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);
  const scoreRef = useRef<HTMLDivElement>(null);
  const suivanteRef = useRef<HTMLButtonElement>(null);
  const idEnvol = useRef(0);

  const courante = partie ? questionCourante(partie) : undefined;
  const phase = partie?.phase;
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

  // Réinitialise la sélection à chaque nouvelle question.
  useEffect(() => {
    setChoixJoueur(null);
  }, [partie?.index]);

  // Effets à la révélation de la réponse.
  const dernierResultat = partie?.resultats.at(-1);
  const resultatTraite = useRef<typeof dernierResultat>(undefined);
  const titreRevelation = useMemo(() => {
    if (!dernierResultat) return '';
    if (dernierResultat.passee) return T.jeu.passee;
    if (dernierResultat.correct) return auHasard(T.jeu.bravo);
    return dernierResultat.reponse === null ? T.jeu.tempsEcoule : auHasard(T.jeu.rate);
  }, [dernierResultat]);
  useEffect(() => {
    if (phase !== 'revelation' || !dernierResultat || resultatTraite.current === dernierResultat || !courante) return;
    resultatTraite.current = dernierResultat;
    if (dernierResultat.correct) {
      const i = courante.choix.indexOf(courante.bonne);
      const de = centre(boutons.current[i]);
      celebrerBonneReponse({
        origine: { x: de.x / window.innerWidth, y: de.y / window.innerHeight },
        serie: dernierResultat.serie,
        rapidite: total > 0 ? 1 - dernierResultat.tempsMis / total : 0,
        reduit,
      });
      if (!reduit) {
        setEnvols((e) => [...e, { id: ++idEnvol.current, points: dernierResultat.points.total, de, vers: centre(scoreRef.current) }]);
      }
      vibrer(30, vibrations);
    } else if (!dernierResultat.passee) {
      vibrer([60, 40, 60], vibrations);
    }
    // Focus sur « Question suivante » pour enchaîner au clavier.
    window.setTimeout(() => suivanteRef.current?.focus({ preventScroll: true }), 350);
  }, [phase, dernierResultat, courante, total, reduit, vibrations]);

  const choisir = useCallback(
    (c: string) => {
      if (phase !== 'question' || partie?.choixMasques.includes(c)) return;
      setChoixJoueur(c);
      repondre(c);
    },
    [phase, partie?.choixMasques, repondre],
  );

  const continuer = useCallback(() => {
    suivante();
    if (usePartie.getState().partie?.phase === 'terminee') navigate('/resultats');
  }, [suivante, navigate]);

  // Clavier : 1 à 6 pour répondre, Entrée pour continuer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!courante || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number.parseInt(e.key, 10);
      if (phase === 'question' && n >= 1 && n <= courante.choix.length) {
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

  const cat = infoCategorie(courante.question.categorie);
  const etatBouton = (c: string): EtatBouton => {
    if (partie.choixMasques.includes(c)) return 'masque';
    if (phase === 'question') return 'neutre';
    if (c === courante.bonne) return c === choixJoueur ? 'correct' : 'revele';
    if (c === choixJoueur) return 'faux';
    return 'eteint';
  };

  const abandonner = () => {
    if (window.confirm(T.jeu.confirmerAbandon)) {
      quitter();
      navigate('/');
    }
  };

  const n = partie.questions.length;
  return (
    <div className="space-y-5">
      <PointsVolants envols={envols} onFini={(id) => setEnvols((e) => e.filter((x) => x.id !== id))} />

      {/* Barre du haut : progression, combo, score */}
      <div className="flex items-center gap-4">
        <Chrono restant={restant} total={total} actif={phase === 'question'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
            <span>{T.jeu.question(partie.index + 1, n)}</span>
            <BadgeCombo serie={partie.serie} />
          </div>
          <div
            className="mt-2 flex gap-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={n}
            aria-valuenow={partie.resultats.length}
            aria-label="Progression"
          >
            {partie.questions.map((q, i) => {
              const r = partie.resultats[i];
              return (
                <span
                  key={q.question.id}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    r ? (r.correct ? 'bg-emerald-500' : r.passee ? 'bg-slate-400' : 'bg-red-500') : i === partie.index ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
        <CompteurScore ref={scoreRef} score={partie.score} reduit={reduit} />
      </div>

      {/* Transition d'entrée uniquement : la question affichée est toujours celle à laquelle on répond. */}
      <motion.div
          key={courante.question.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="rounded-3xl bg-white p-5 shadow-lg shadow-violet-900/5 dark:bg-slate-800/80">
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white" style={{ backgroundColor: cat.couleur }}>
              <span aria-hidden>{cat.icone}</span>
              <span className="[text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">{cat.nom}</span>
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold leading-snug sm:text-3xl">{courante.question.enonce}</h1>
            {partie.indice && phase === 'question' && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-bold text-amber-700 dark:text-amber-300">
                💡 {partie.indice}
              </motion.p>
            )}
          </div>

          <div className={`grid gap-3 ${courante.choix.length > 4 ? 'sm:grid-cols-2' : courante.choix.length === 2 ? 'grid-cols-2' : ''}`}>
            {courante.choix.map((c, i) => (
              <BoutonReponse
                key={c}
                ref={(el) => {
                  boutons.current[i] = el;
                }}
                texte={c}
                index={i}
                etat={etatBouton(c)}
                desactive={phase !== 'question'}
                onChoisir={() => choisir(c)}
              />
            ))}
          </div>
      </motion.div>

      {phase === 'question' ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BarreJokers restants={partie.jokersRestants} utilises={partie.jokersUtilises} actif onJoker={joker} />
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{T.jeu.raccourcis}</p>
        </div>
      ) : (
        dernierResultat && (
          <CarteRevelation
            ref={suivanteRef}
            resultat={dernierResultat}
            bonne={courante.bonne}
            anecdote={courante.question.anecdote}
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
