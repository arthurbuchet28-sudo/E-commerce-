import { create } from 'zustand';
import type { Joker } from '@/config/difficulte';
import { CONTRE_LA_MONTRE, MODES, REVISION, STOCK_ADAPTATIF, SURVIE } from '@/config/modes';
import { cleJour, questionsDuDefi, rngDuJour, serieDeJours } from '@/engine/defi';
import { questionsCorrigees, questionsRatees } from '@/engine/progression';
import type { Reponse } from '@/engine/evaluation';
import {
  creerPartie,
  estDynamique,
  grilleEmojis,
  niveauInitial,
  questionSuivante,
  repondre,
  resumerPartie,
  terminer,
  utiliserJoker,
  type ConfigPartie,
  type EtatPartie,
} from '@/engine/partie';
import { melanger, rngAleatoire } from '@/engine/random';
import { dedoublonner, selectionnerAvecReserve } from '@/engine/selection';
import { DIFFICULTES } from '@/config/difficulte';
import type { Question } from '@/types/question';
import { garderQuestionsJouables, prechargerImage } from '@/lib/prechargement';
import { recupererQuestions } from '@/providers';
import { banqueLocale } from '@/providers/local';
import { useProfil, type BilanProgression } from './profil';
import { cleRecord, useRecords } from './records';
import { useRevision } from './revision';

export type ResultatEnregistre = { nouveauRecord: boolean; ancienRecord: number | undefined };

type EtatStorePartie = {
  partie: EtatPartie | null;
  /** Horodatage (ms) du début de la question en cours. */
  debutQuestion: number;
  /** Contre-la-montre : horodatage (ms) de la fin de la partie. */
  finChrono: number | null;
  /** Duel : le joueur dont c'est le tour a-t-il pris l'appareil ? (écran de passage de relais) */
  pret: boolean;
  chargement: boolean;
  erreur: string | null;
  resultat: ResultatEnregistre | null;
  /** XP, niveau et badges gagnés sur la dernière partie. */
  bilan: BilanProgression | null;
  lancer: (config: ConfigPartie) => Promise<boolean>;
  rejouer: () => Promise<boolean>;
  repondre: (reponse: Reponse) => void;
  joker: (joker: Joker) => void;
  suivante: () => void;
  commencerTour: () => void;
  tempsEcoule: () => void;
  quitter: () => void;
};

const rng = rngAleatoire();

/** Types jouables rapidement au contre-la-montre. */
const TYPES_RAPIDES = new Set<Question['type']>(['qcm', 'vrai_faux', 'image']);

/** Garde les questions dont l'image se charge (les autres sont écartées du stock). */
async function sansImagesCassees(questions: Question[]): Promise<Question[]> {
  const ok = await Promise.all(questions.map((q) => (q.media?.image ? prechargerImage(q.media.image) : Promise.resolve(true))));
  return questions.filter((_, i) => ok[i]);
}

/** Prépare les questions selon le mode. */
async function questionsPour(config: ConfigPartie): Promise<Question[]> {
  const vues = new Set(useRecords.getState().vues);
  switch (config.mode) {
    case 'defi':
      return questionsDuDefi(banqueLocale(), config.jour ?? cleJour());
    case 'revision': {
      // Les plus anciennes questions ratées d'abord, dans un ordre mélangé.
      const aRevoir = useRevision.getState().questions.slice(0, REVISION.nombre);
      if (!aRevoir.length) throw new Error('revision-vide');
      return sansImagesCassees(melanger(aRevoir, rng));
    }
    case 'blind_test': {
      const { questionsBlindTest } = await import('@/providers/deezer');
      const [cle, valeur] = (config.filtre ?? '').split(':');
      const filtre = cle === 'epoque' ? { epoque: valeur as never } : cle === 'style' ? { style: valeur as never } : undefined;
      const qs = await questionsBlindTest(config.nombreQuestions, filtre);
      if (!qs.length) throw new Error('blind-test-indisponible');
      return qs;
    }
    default:
      break;
  }
  if (estDynamique(config)) {
    const stock = config.mode === 'survie' ? SURVIE.stock : config.mode === 'contre_la_montre' ? CONTRE_LA_MONTRE.stock : STOCK_ADAPTATIF;
    let pool = await recupererQuestions({ categorie: config.categorie, niveaux: [1, 2, 3, 4], nombre: stock });
    if (config.mode === 'contre_la_montre') pool = pool.filter((q) => TYPES_RAPIDES.has(q.type));
    // On évite les questions déjà vues, s'il en reste assez.
    const neuves = pool.filter((q) => !vues.has(q.id));
    pool = neuves.length >= Math.min(30, pool.length / 2) ? neuves : pool;
    return sansImagesCassees(dedoublonner(pool));
  }
  const niveaux = DIFFICULTES[niveauInitial(config)].niveaux;
  const banque = await recupererQuestions({ categorie: config.categorie, niveaux, nombre: config.nombreQuestions });
  const { choisies, reserve } = selectionnerAvecReserve(
    banque,
    { categorie: config.categorie, niveaux, nombre: config.nombreQuestions, rng, vuesRecemment: vues },
    8,
  );
  return garderQuestionsJouables(choisies, reserve);
}

function cleRecordPour(config: ConfigPartie): string | null {
  switch (config.mode) {
    case 'classique':
      return cleRecord('classique', config.categorie, config.difficulte, config.nombreQuestions);
    case 'contre_la_montre':
    case 'survie':
      return cleRecord(config.mode, config.categorie, config.difficulte);
    case 'blind_test':
      return cleRecord('blind_test', config.filtre ?? 'tout');
    default:
      return null;
  }
}

export const usePartie = create<EtatStorePartie>()((set, get) => ({
  partie: null,
  debutQuestion: 0,
  finChrono: null,
  pret: true,
  chargement: false,
  erreur: null,
  resultat: null,
  bilan: null,

  lancer: async (config) => {
    set({ chargement: true, erreur: null, resultat: null, bilan: null });
    try {
      const questions = await questionsPour(config);
      if (questions.length === 0) throw new Error('Aucune question disponible');
      // Défi du jour : même tirage pour tout le monde (choix compris).
      const alea = config.mode === 'defi' ? rngDuJour(config.jour ?? cleJour()) : rng;
      const partie = creerPartie(config, questions, alea);
      const maintenant = performance.now();
      set({
        partie,
        debutQuestion: maintenant,
        finChrono: config.mode === 'contre_la_montre' ? maintenant + CONTRE_LA_MONTRE.duree * 1000 : null,
        pret: config.mode !== 'duel',
        chargement: false,
      });
      return true;
    } catch (e) {
      set({ chargement: false, erreur: e instanceof Error ? e.message : String(e) });
      return false;
    }
  },

  rejouer: async () => {
    const partie = get().partie;
    return partie && partie.config.mode !== 'defi' ? get().lancer(partie.config) : false;
  },

  repondre: (reponse) => {
    const { partie, debutQuestion } = get();
    if (!partie) return;
    set({ partie: repondre(partie, reponse, (performance.now() - debutQuestion) / 1000) });
  },

  joker: (joker) => {
    const { partie, debutQuestion } = get();
    if (!partie) return;
    set({ partie: utiliserJoker(partie, joker, rng, (performance.now() - debutQuestion) / 1000) });
  },

  suivante: () => {
    const partie = get().partie;
    if (!partie) return;
    const suivant = questionSuivante(partie, partie.config.mode === 'defi' ? rngDuJour(partie.config.jour ?? cleJour()) : rng);
    if (suivant.phase === 'terminee') return finir(suivant);
    const changeJoueur = suivant.joueurCourant !== partie.joueurCourant;
    set({ partie: suivant, debutQuestion: performance.now(), pret: !changeJoueur });
  },

  commencerTour: () => set({ pret: true, debutQuestion: performance.now() }),

  tempsEcoule: () => {
    const partie = get().partie;
    if (partie && partie.phase !== 'terminee') finir(terminer(partie));
  },

  quitter: () => set({ partie: null, resultat: null, finChrono: null }),
}));

/** Fin de partie : records, défi du jour, questions vues. */
function finir(partie: EtatPartie) {
  const records = useRecords.getState();
  const c = partie.config;
  let resultat: ResultatEnregistre = { nouveauRecord: false, ancienRecord: undefined };
  const cle = MODES[c.mode].score ? cleRecordPour(c) : null;
  if (cle) {
    const ancienRecord = records.records[cle];
    resultat = { nouveauRecord: records.enregistrerScore(cle, partie.score), ancienRecord };
  }
  if (c.mode === 'defi') {
    const r = resumerPartie(partie);
    records.enregistrerDefi(c.jour ?? cleJour(), { score: r.score, bonnes: r.bonnes, total: r.total, grille: grilleEmojis(partie.resultats) });
  }
  if (c.mode !== 'defi') records.marquerVues(partie.questions.map((q) => q.question.id));
  // Révision : les questions ratées s'ajoutent à la liste, celles corrigées en révision en sortent.
  const revision = useRevision.getState();
  if (c.mode === 'revision') revision.retirer(questionsCorrigees(partie));
  else revision.ajouter(questionsRatees(partie));
  // Progression : XP, statistiques, badges, historique.
  const jour = cleJour();
  const bilan = useProfil.getState().enregistrerPartie(partie, serieDeJours(Object.keys(useRecords.getState().defis), jour));
  usePartie.setState({ partie, resultat, bilan, finChrono: null, pret: true });
}
