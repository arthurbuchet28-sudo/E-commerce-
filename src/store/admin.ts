import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from '@/types/question';
import { stockageJSON } from '@/lib/stockage';
import { definirCalqueAdmin } from '@/providers/local';

export type MotifSignalement = 'erreur' | 'discutable' | 'faute' | 'autre';

export type Signalement = {
  id: string;
  questionId: string;
  /** Copie de la question au moment du signalement (les questions générées ne sont pas rejouables). */
  question: Question;
  motif: MotifSignalement;
  commentaire: string;
  date: string;
  traite: boolean;
};

/**
 * Modifications de la banque locale faites depuis l'espace admin, conservées sur l'appareil
 * (calque appliqué par-dessus les fichiers JSON) ; l'export permet de les reporter dans le dépôt.
 */
type EtatAdmin = {
  ajoutees: Question[];
  modifiees: Record<string, Question>;
  supprimees: string[];
  signalements: Signalement[];
  enregistrer: (q: Question, estNouvelle: boolean) => void;
  supprimer: (id: string) => void;
  restaurer: (id: string) => void;
  importer: (qs: Question[], idsExistants: Set<string>) => { ajoutees: number; modifiees: number };
  signaler: (s: Omit<Signalement, 'id' | 'date' | 'traite'>) => void;
  traiterSignalement: (id: string, traite: boolean) => void;
  supprimerSignalement: (id: string) => void;
  toutAnnuler: () => void;
};

export const useAdmin = create<EtatAdmin>()(
  persist(
    (set, get) => ({
      ajoutees: [],
      modifiees: {},
      supprimees: [],
      signalements: [],
      enregistrer: (q, estNouvelle) => {
        const { ajoutees, modifiees, supprimees } = get();
        if (estNouvelle || ajoutees.some((a) => a.id === q.id)) {
          set({ ajoutees: [...ajoutees.filter((a) => a.id !== q.id), q] });
        } else {
          set({ modifiees: { ...modifiees, [q.id]: q } });
        }
        if (supprimees.includes(q.id)) set({ supprimees: supprimees.filter((id) => id !== q.id) });
      },
      supprimer: (id) => {
        const { ajoutees, supprimees } = get();
        if (ajoutees.some((a) => a.id === id)) set({ ajoutees: ajoutees.filter((a) => a.id !== id) });
        else if (!supprimees.includes(id)) set({ supprimees: [...supprimees, id] });
      },
      restaurer: (id) => {
        const { modifiees, supprimees } = get();
        const reste = { ...modifiees };
        delete reste[id];
        set({ modifiees: reste, supprimees: supprimees.filter((x) => x !== id) });
      },
      importer: (qs, idsExistants) => {
        let ajoutees = 0;
        let modifiees = 0;
        for (const q of qs) {
          const existe = idsExistants.has(q.id);
          get().enregistrer(q, !existe);
          if (existe) modifiees++;
          else ajoutees++;
        }
        return { ajoutees, modifiees };
      },
      signaler: (s) =>
        set({
          signalements: [{ ...s, id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, date: new Date().toISOString(), traite: false }, ...get().signalements].slice(0, 300),
        }),
      traiterSignalement: (id, traite) => set({ signalements: get().signalements.map((s) => (s.id === id ? { ...s, traite } : s)) }),
      supprimerSignalement: (id) => set({ signalements: get().signalements.filter((s) => s.id !== id) }),
      toutAnnuler: () => set({ ajoutees: [], modifiees: {}, supprimees: [] }),
    }),
    { name: 'quizmania-admin', storage: stockageJSON, version: 1 },
  ),
);

// La banque locale suit le calque de l'admin (au chargement et à chaque modification).
const synchroniser = (e: EtatAdmin) => definirCalqueAdmin({ ajoutees: e.ajoutees, modifiees: e.modifiees, supprimees: e.supprimees });
synchroniser(useAdmin.getState());
useAdmin.subscribe(synchroniser);
