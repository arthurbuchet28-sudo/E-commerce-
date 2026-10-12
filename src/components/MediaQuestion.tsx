import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Question } from '@/types/question';
import { T } from '@/i18n/fr';
import { rafraichirMedia } from '@/providers';
import { creditCommons, fichierDepuisFilePath } from '@/providers/wikidata/credits';
import { Squelette } from './Squelette';

/** Image de la question (photo, drapeau, monument), avec son crédit. */
export function ImageQuestion({ question }: { question: Question }) {
  const [etat, setEtat] = useState<'chargement' | 'ok' | 'erreur'>('chargement');
  const media = question.media;
  const [credit, setCredit] = useState(media?.credit);
  useEffect(() => {
    setEtat('chargement');
    setCredit(media?.credit);
    // Crédit incomplet dans l'instantané : on demande auteur et licence à Wikimedia Commons.
    const fichier = media?.image ? fichierDepuisFilePath(media.image) : null;
    if (!fichier) return;
    let actif = true;
    void creditCommons(fichier).then((c) => actif && c && setCredit(c));
    return () => {
      actif = false;
    };
  }, [media?.image, media?.credit]);
  if (!media?.image) return null;
  return (
    <figure className="mt-3">
      <div className="relative mx-auto flex h-56 max-w-md items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:h-64 dark:bg-slate-900">
        {etat === 'chargement' && <Squelette className="absolute inset-0" />}
        {etat === 'erreur' ? (
          <p className="p-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">{T.jeu.imageIndisponible}</p>
        ) : (
          <img
            src={media.image}
            alt={media.alt ?? ''}
            onLoad={() => setEtat('ok')}
            onError={() => setEtat('erreur')}
            className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${etat === 'ok' ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      {credit && <figcaption className="mt-1 text-center text-[11px] text-slate-500 dark:text-slate-400">{credit}</figcaption>}
    </figure>
  );
}

/** Lecteur d'extrait (blind test) : lecture automatique, égaliseur animé, relance si l'extrait a expiré. */
export function LecteurAudio({ question, actif }: { question: Question; actif: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState(question.media?.audio);
  const [lecture, setLecture] = useState(false);
  const [erreur, setErreur] = useState(false);
  const relance = useRef(false);

  useEffect(() => {
    setSrc(question.media?.audio);
    setErreur(false);
    relance.current = false;
  }, [question]);

  useEffect(() => {
    const a = audio.current;
    if (!a || !src) return;
    a.volume = 0.8;
    void a.play().catch(() => setLecture(false));
  }, [src]);

  const surErreur = async () => {
    // Les liens d'extraits expirent : on en redemande un frais, une seule fois.
    if (relance.current) return setErreur(true);
    relance.current = true;
    const frais = await rafraichirMedia(question);
    if (frais?.audio) setSrc(frais.audio);
    else setErreur(true);
  };

  const basculer = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setErreur(true));
    else a.pause();
  };

  if (!src) return null;
  return (
    <div className="mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-700 p-4 text-white">
      <audio ref={audio} src={src} preload="auto" onPlay={() => setLecture(true)} onPause={() => setLecture(false)} onEnded={() => setLecture(false)} onError={() => void surErreur()} />
      <button
        type="button"
        onClick={basculer}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-rose-700 shadow-lg"
        aria-label={lecture ? T.jeu.pause : T.jeu.ecouter}
      >
        <span aria-hidden>{lecture ? '❚❚' : '▶'}</span>
      </button>
      <div className="flex h-10 flex-1 items-end gap-1" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <motion.span
            key={i}
            className="w-full rounded-full bg-white/80"
            animate={lecture && actif ? { height: ['20%', `${30 + ((i * 37) % 70)}%`, '35%', `${50 + ((i * 53) % 50)}%`, '20%'] } : { height: '15%' }}
            transition={{ duration: 1.1 + (i % 4) * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {erreur && <span className="text-sm font-bold">{T.jeu.audioIndisponible}</span>}
      {question.media?.credit && <span className="sr-only">{question.media.credit}</span>}
    </div>
  );
}
