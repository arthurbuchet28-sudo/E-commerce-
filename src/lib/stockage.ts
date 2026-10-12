import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/** localStorage protégé : ne plante jamais (navigation privée, stockage bloqué…). */
const localStorageSur: StateStorage = {
  getItem: (cle) => {
    try {
      return localStorage.getItem(cle);
    } catch {
      return null;
    }
  },
  setItem: (cle, valeur) => {
    try {
      localStorage.setItem(cle, valeur);
    } catch {
      /* stockage indisponible : on continue sans sauvegarder */
    }
  },
  removeItem: (cle) => {
    try {
      localStorage.removeItem(cle);
    } catch {
      /* idem */
    }
  },
};

export const stockageJSON = createJSONStorage(() => localStorageSur);
