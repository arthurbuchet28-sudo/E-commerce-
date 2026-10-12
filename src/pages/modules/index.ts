import type { ComponentType } from 'react';
import { Module1Page } from './Module1Page';
import { Module2Page } from './Module2Page';
import { Module3Page } from './Module3Page';
import { Module4Page } from './Module4Page';
import { Module5Page } from './Module5Page';
import { Module6Page } from './Module6Page';
import { Module7Page } from './Module7Page';
import { Module8Page } from './Module8Page';
import { Module9Page } from './Module9Page';

/** Une page par module (chacune fournit ses composants interactifs propres). */
export const MODULE_PAGES: { id: number; Page: ComponentType }[] = [
  { id: 1, Page: Module1Page },
  { id: 2, Page: Module2Page },
  { id: 3, Page: Module3Page },
  { id: 4, Page: Module4Page },
  { id: 5, Page: Module5Page },
  { id: 6, Page: Module6Page },
  { id: 7, Page: Module7Page },
  { id: 8, Page: Module8Page },
  { id: 9, Page: Module9Page },
];
