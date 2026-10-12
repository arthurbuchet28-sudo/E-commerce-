/**
 * Répétition espacée simplifiée (système de Leitner à 5 boîtes) pour les flash cards.
 * Une erreur renvoie la situation en boîte 1 ; une bonne réponse la fait monter d'une boîte.
 * Plus la boîte est haute, plus la situation revient rarement.
 */
export interface CardStat {
  seen: number;
  errors: number;
  box: number;
  /** Numéro de tirage à partir duquel la situation est « due ». */
  due: number;
}

export type StatsMap = Record<string, CardStat>;

/** Intervalle (en nombre de questions) avant de revoir une situation selon sa boîte. */
export const BOX_INTERVALS = [0, 3, 8, 20, 50, 120];

export function recordAnswer(stats: StatsMap, key: string, correct: boolean, tick: number): StatsMap {
  const prev = stats[key] ?? { seen: 0, errors: 0, box: 1, due: 0 };
  const box = correct ? Math.min(5, prev.box + 1) : 1;
  return {
    ...stats,
    [key]: {
      seen: prev.seen + 1,
      errors: prev.errors + (correct ? 0 : 1),
      box,
      due: tick + BOX_INTERVALS[box],
    },
  };
}

/** Situations dues à la révision (déjà vues, ratées au moins une fois), les plus urgentes d'abord. */
export function dueForReview(stats: StatsMap, tick: number): string[] {
  return Object.entries(stats)
    .filter(([, s]) => s.errors > 0 && s.due <= tick && s.box < 5)
    .sort((a, b) => a[1].box - b[1].box || b[1].errors / b[1].seen - a[1].errors / a[1].seen)
    .map(([k]) => k);
}

/** Situations classées par taux d'erreur décroissant. */
export function worstSituations(stats: StatsMap, limit = 10): { key: string; stat: CardStat; errorRate: number }[] {
  return Object.entries(stats)
    .filter(([, s]) => s.errors > 0)
    .map(([key, stat]) => ({ key, stat, errorRate: stat.errors / stat.seen }))
    .sort((a, b) => b.errorRate - a.errorRate || b.stat.errors - a.stat.errors)
    .slice(0, limit);
}
