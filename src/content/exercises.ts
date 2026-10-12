import type { ExerciseId } from '../lib/progress';

export interface ExerciseInfo {
  id: ExerciseId;
  path: string;
  title: string;
  description: string;
  /** Module conseillé avant de commencer l'exercice. */
  module: number;
  goal: string;
}

export const EXERCISES: ExerciseInfo[] = [
  { id: 'flashcards', path: '/exercices/flash-cards', title: 'Flash cards de stratégie de base', description: "Une main, une carte du croupier : choisissez l'action. Les situations ratées reviennent plus souvent.", module: 2, goal: '100 % de réussite en moins de 2 s par réponse' },
  { id: 'card-stream', path: '/exercices/defile', title: 'Défilé de cartes', description: 'Les cartes défilent une par une à vitesse réglable ; donnez le running count à la fin.', module: 4, goal: 'Atteindre le niveau 8 sans erreur' },
  { id: 'deck-countdown', path: '/exercices/jeu-complet', title: "Compte à rebours d'un jeu", description: 'Comptez 51 cartes et retrouvez la catégorie de la carte manquante.', module: 4, goal: 'Moins de 25 secondes, sans erreur' },
  { id: 'groups', path: '/exercices/groupes', title: 'Paires et groupes', description: 'Comptez 2, 3 ou 4 cartes affichées en même temps.', module: 4, goal: 'Réponse juste en moins de 1,5 s par groupe' },
  { id: 'true-count', path: '/exercices/true-count', title: 'Conversion en true count', description: 'Running count + bac de défausse : calculez le true count.', module: 5, goal: 'Réponse juste en moins de 4 s' },
  { id: 'discard', path: '/exercices/defausse', title: 'Estimation de la défausse', description: 'Estimez le nombre de jeux dans le bac de défausse.', module: 5, goal: "Erreur d'un demi-jeu au plus" },
  { id: 'deviation-quiz', path: '/exercices/deviations', title: 'Quiz de déviations', description: 'Main, carte du croupier et true count : stratégie de base ou déviation ?', module: 7, goal: '100 % sur les I18 et Fab 4' },
  { id: 'simulator', path: '/simulateur', title: 'Simulateur de table', description: 'Une vraie table : sabot configurable, joueurs virtuels, modes entraînement et examen.', module: 1, goal: 'Sabot complet sans erreur en mode examen' },
];

export function getExercise(id: ExerciseId): ExerciseInfo {
  return EXERCISES.find((e) => e.id === id)!;
}
