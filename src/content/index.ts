import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { module5 } from './module5';
import { module6 } from './module6';
import { module7 } from './module7';
import { module8 } from './module8';
import { module9 } from './module9';
import type { CourseModule } from './types';

export const MODULES: CourseModule[] = [module1, module2, module3, module4, module5, module6, module7, module8, module9];

export function getModule(id: number): CourseModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export * from './types';
export * from './meta';
export { EXERCISES, getExercise } from './exercises';
