import { create } from 'zustand';
import type { Joker } from '@/config/difficulte';
import { DIFFICULTES } from '@/config/difficulte';
import {
  creerPartie,
  questionSuivante,
  repondre,
  utiliserJoker,
  type ConfigPartie,
  type EtatPartie,
} from '@/engine/partie';
import { rngAleatoire } from '@/engine/random';
import { selectionnerQuestions } from '@/engine/selection';
import { recupererQuestions } from '@/providers/registre';
import { cleRecord, useRecords } from './records';

export type ResultatEnregistre = { nouveauRecord: boolean; ancienRecord: number | undefined };

type EtatStorePartie = {
  partie: EtatPartie | null;
  /** Horodatage (ms) du début de la question en cours. */
  debutQuestion: number;
  chargement: boolean;
  erreur: string | null;
  resultat: ResultatEnregistre | null;
  lancer: (config: ConfigPartie) => Promise<boolean>;
  rejouer: () => Promise<boolean>;
  repondre: (reponse: string | null) => void;
  joker: (joker: Joker) => void;
  suivante: () => void;
  quitter: () => void;
};

const rng = rngAleatoire();

function tempsEcoule(debut: number): number {
  return (performance.now() - debut) / 1000;
}

export const usePartie = create<EtatStorePartie>()((set, get) => ({
  partie: null,
  debutQuestion: 0,
  chargement: false,
  erreur: null,
  resultat: null,

  lancer: async (config) => {
    set({ chargement: true, erreur: null, resultat: null });
    try {
      const niveaux = DIFFICULTES[config.difficulte].niveaux;
      const banque = await recupererQuestions({ categorie: config.categorie, niveaux, nombre: config.nombreQuestions });
      const questions = selectionnerQuestions(banque, {
        categorie: config.categorie,
        niveaux,
        nombre: config.nombreQuestions,
        rng,
        vuesRecemment: new Set(useRecords.getState().vues),
      });
      if (questions.length === 0) throw new Error('Aucune question disponible');
      set({ partie: creerPartie(config, questions, rng), debutQuestion: performance.now(), chargement: false });
      return true;
    } catch (e) {
      set({ chargement: false, erreur: e instanceof Error ? e.message : String(e) });
      return false;
    }
  },

  rejouer: async () => {
    const partie = get().partie;
    return partie ? get().lancer(partie.config) : false;
  },

  repondre: (reponse) => {
    const { partie, debutQuestion } = get();
    if (!partie) return;
    set({ partie: repondre(partie, reponse, tempsEcoule(debutQuestion)) });
  },

  joker: (joker) => {
    const { partie, debutQuestion } = get();
    if (!partie) return;
    set({ partie: utiliserJoker(partie, joker, rng, tempsEcoule(debutQuestion)) });
  },

  suivante: () => {
    const partie = get().partie;
    if (!partie) return;
    const suivant = questionSuivante(partie);
    if (suivant.phase === 'terminee') {
      const records = useRecords.getState();
      const c = suivant.config;
      const cle = cleRecord(c.mode, c.categorie, c.difficulte, c.nombreQuestions);
      const ancienRecord = records.records[cle];
      const nouveauRecord = records.enregistrerScore(cle, suivant.score);
      records.marquerVues(suivant.questions.map((q) => q.question.id));
      set({ partie: suivant, resultat: { nouveauRecord, ancienRecord } });
      return;
    }
    set({ partie: suivant, debutQuestion: performance.now() });
  },

  quitter: () => set({ partie: null, resultat: null }),
}));
