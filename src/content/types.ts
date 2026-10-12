import type { ExerciseId } from '../lib/progress';

/**
 * Blocs de contenu d'une leçon. Le texte accepte une mise en forme légère :
 * **gras**, *italique* et `code`.
 */
export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success' | 'math'; title?: string; text: string }
  | { type: 'example'; title: string; lines: string[] }
  | { type: 'cards'; cards: string[]; caption?: string }
  /** Composant interactif propre à la page du module (fourni par la page). */
  | { type: 'widget'; id: string };

export interface LessonSection {
  id: string;
  title: string;
  blocks: Block[];
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  /** Index de la bonne réponse dans `choices`. */
  answer: number;
  explanation: string;
}

export interface ExerciseLink {
  id: ExerciseId;
  title: string;
  goal: string;
}

export interface CourseModule {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  /** Durée indicative de travail. */
  duration: string;
  optional?: boolean;
  objectives: string[];
  sections: LessonSection[];
  keyPoints: string[];
  mistakes: { mistake: string; fix: string }[];
  exercises: ExerciseLink[];
  quiz: QuizQuestion[];
}
