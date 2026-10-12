import type { CourseModule } from './types';

export const module7: CourseModule = {
  id: 7,
  slug: 'deviations',
  title: 'Les déviations de stratégie',
  subtitle: 'Illustrious 18 et Fab 4 : adapter son jeu au true count',
  duration: '2 h + révisions',
  objectives: [
    'Comprendre pourquoi la stratégie optimale change avec la composition du sabot.',
    'Connaître l\'indice d\'assurance (TC +3) et savoir l\'appliquer.',
    'Mémoriser les Illustrious 18 et les Fab 4 avec leurs indices.',
    'Savoir pour quelles règles de table ces indices sont valables.',
  ],
  sections: [
    {
      id: 'principe',
      title: 'Qu\'est-ce qu\'une déviation ?',
      blocks: [
        {
          type: 'p',
          text: "La stratégie de base est optimale pour un sabot **neutre**. Quand le sabot est riche en 10, certaines décisions s'inversent : par exemple, rester sur 16 contre 10 devient meilleur que tirer, car le risque de sauter augmente et le croupier, lui aussi, saute plus souvent.",
        },
        {
          type: 'p',
          text: "Pour chaque décision, il existe un **indice** : le true count à partir duquel il faut changer d'action. On note par exemple « 16 contre 10 : rester à TC ≥ 0 ».",
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Règles de validité des indices de cette formation',
          text: "Indices Hi-Lo pour un **sabot de 4 à 8 jeux**, croupier **S17**, **DAS**, **abandon tardif**, true count **arrondi à l'entier inférieur**. Une déviation « positive » s'applique quand **TC ≥ indice** ; une déviation « négative » (on passe de rester à tirer) s'applique quand **TC < indice**. En H17 ou en jeu simple/double, plusieurs indices changent d'environ un point.",
        },
      ],
    },
    {
      id: 'assurance',
      title: 'La déviation n°1 : l\'assurance à TC +3',
      blocks: [
        {
          type: 'p',
          text: "Rappel (module 1) : l'assurance paie 2:1 et devient rentable quand plus d'**un tiers** des cartes restantes sont des 10. En Hi-Lo, cela correspond à un true count d'environ **+3**.",
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Pourquoi +3 ?',
          text: "Un jeu neutre contient 16 dix sur 52 (30,8 %). Un TC de +3 signifie que, par jeu restant, il y a 3 cartes hautes de plus que de basses : en gros 1,5 haute de plus et 1,5 basse de moins qu'un jeu neutre. Or 80 % des cartes hautes sont des 10 (16 sur 20). On obtient ≈ 16 + 1,5 × 0,8 = 17,2 dix sur 52 cartes, soit ≈ 33 % : le seuil de rentabilité de 1/3. Les simulations confirment l'indice +3 en sabot.",
        },
        {
          type: 'p',
          text: "**Prenez l'assurance quand TC ≥ +3**, refusez-la sinon. C'est la déviation la plus rentable de toutes, car elle concerne toutes les mains où le croupier montre un As, et la mise d'assurance est souvent élevée (on mise gros à fort compte). L'**even money** suit exactement la même règle.",
        },
      ],
    },
    {
      id: 'i18',
      title: 'Les Illustrious 18 et les Fab 4',
      blocks: [
        {
          type: 'p',
          text: "Don Schlesinger a classé les déviations par rentabilité. Les **18 premières** (dont l'assurance) capturent l'essentiel (de l'ordre de 80 à 85 %) du gain de **toutes** les déviations possibles. Les **Fab 4** sont les quatre abandons les plus rentables.",
        },
        { type: 'widget', id: 'deviation-table' },
        {
          type: 'p',
          text: "Les déviations de 15 et 16 contre 10 et 9 dans les I18 (« rester ») ne s'appliquent que **si l'abandon n'est pas disponible** (table sans abandon, ou main de 3 cartes, ou main issue d'une séparation). Avec abandon tardif, on applique d'abord les Fab 4 : abandonner prime sur rester.",
        },
      ],
    },
    {
      id: 'memoriser',
      title: 'Mémoriser les indices par familles',
      blocks: [
        { type: 'h', text: 'Les « rester » sur mains raides contre 10 et 9' },
        {
          type: 'list',
          items: [
            '16 contre 10 : rester à **0** (dès que le compte est positif).',
            '15 contre 10 : rester à **+4**.',
            '16 contre 9 : rester à **+5**.',
          ],
        },
        { type: 'h', text: 'Les 12 contre petites cartes (escalier)' },
        {
          type: 'list',
          items: [
            '12 contre 2 : rester à **+3** ; 12 contre 3 : rester à **+2**.',
            '12 contre 4 : tirer si **< 0** ; 12 contre 5 : tirer si **< −2** ; 12 contre 6 : tirer si **< −1**.',
            '13 contre 2 : tirer si **< −1** ; 13 contre 3 : tirer si **< −2**.',
            'Moyen mnémotechnique : « 12 contre 2-3-4 → +3, +2, 0 » (l\'indice baisse quand la carte du croupier monte).',
          ],
        },
        { type: 'h', text: 'Les doubles' },
        {
          type: 'list',
          items: [
            '11 contre As : doubler à **+1** ; 9 contre 2 : doubler à **+1**.',
            '9 contre 7 : doubler à **+3**.',
            '10 contre 10 et 10 contre As : doubler à **+4**.',
          ],
        },
        { type: 'h', text: 'Les séparations de 10' },
        {
          type: 'list',
          items: [
            '10,10 contre 6 : séparer à **+4** ; 10,10 contre 5 : séparer à **+5**.',
            '⚠️ Ce sont les déviations **les plus voyantes** : séparer un 20 avec une grosse mise alerte immédiatement le personnel. Beaucoup de compteurs y renoncent pour préserver leur couverture.',
          ],
        },
        { type: 'h', text: 'Les Fab 4 (abandon tardif)' },
        {
          type: 'list',
          items: [
            '14 contre 10 : abandonner à **+3**.',
            '15 contre 10 : abandonner à **0** (sinon tirer).',
            '15 contre 9 : abandonner à **+2**.',
            '15 contre As : abandonner à **+1** (en S17 ; en H17 la stratégie de base abandonne déjà).',
          ],
        },
      ],
    },
    {
      id: 'pratique',
      title: 'En pratique',
      blocks: [
        {
          type: 'list',
          items: [
            'Apprenez d\'abord l\'**assurance**, puis **16 contre 10**, **15 contre 10**, et les **12** : ce sont les plus fréquentes.',
            'Une déviation n\'est utile que si votre **true count est juste**. Une mauvaise estimation des jeux restants fait plus de dégâts qu\'un indice oublié.',
            'Quand le TC est exactement à l\'indice, appliquez la déviation (convention « ≥ »).',
            'Toutes les déviations ont un poids modeste comparé à l\'écart de mise : ne laissez jamais leur apprentissage dégrader votre comptage.',
          ],
        },
      ],
    },
  ],
  keyPoints: [
    'Une déviation remplace l\'action de base quand le true count franchit un indice.',
    'Assurance (et even money) : uniquement si TC ≥ +3.',
    '16 contre 10 : rester à TC ≥ 0 (si l\'abandon est impossible).',
    'Les I18 capturent la majeure partie du gain de toutes les déviations ; les Fab 4 ajoutent les abandons.',
    'Indices valables en sabot, S17, DAS, abandon tardif, TC arrondi à l\'entier inférieur.',
    'Abandonner prime sur rester quand l\'abandon est disponible.',
  ],
  mistakes: [
    { mistake: 'Prendre l\'assurance « parce que j\'ai un bon jeu ».', fix: 'L\'assurance ne dépend que du TC (≥ +3), jamais de votre main.' },
    { mistake: 'Appliquer « rester sur 16 contre 10 » alors que l\'abandon est disponible.', fix: 'Avec abandon tardif et deux cartes, on abandonne 16 contre 10.' },
    { mistake: 'Appliquer les déviations au running count au lieu du true count.', fix: 'Les indices sont exprimés en true count.' },
    { mistake: 'Séparer des 10 avec une grosse mise sans penser à la couverture.', fix: 'C\'est rentable mais très voyant. Évaluez le risque de vous faire repérer.' },
    { mistake: 'Utiliser ces indices sur une table H17 ou à un jeu sans ajustement.', fix: 'Les indices dépendent des règles ; vérifiez-les pour chaque configuration.' },
  ],
  exercises: [
    { id: 'deviation-quiz', title: 'Quiz de déviations', goal: '100 % de réussite sur les I18 et Fab 4.' },
    { id: 'simulator', title: 'Simulateur (affichage de l\'action recommandée)', goal: 'Observez les déviations recommandées en situation.' },
  ],
  quiz: [
    { question: 'À partir de quel true count prend-on l\'assurance ?', choices: ['TC ≥ 0', 'TC ≥ +1', 'TC ≥ +3', 'Jamais'], answer: 2, explanation: 'L\'indice d\'assurance Hi-Lo en sabot est +3.' },
    {
      question: '16 contre 10, sans abandon possible, TC = +1. Que faire ?',
      choices: ['Tirer', 'Rester', 'Doubler', 'Séparer'],
      answer: 1,
      explanation: 'Indice 0 : on reste dès que TC ≥ 0.',
    },
    {
      question: '16 (10,6) contre 10, abandon tardif autorisé, TC = +2. Que faire ?',
      choices: ['Tirer', 'Rester', 'Abandonner', 'Doubler'],
      answer: 2,
      explanation: 'L\'abandon est prioritaire sur la déviation « rester ».',
    },
    {
      question: '12 contre 3, TC = +2. Que faire ?',
      choices: ['Tirer', 'Rester', 'Doubler', 'Abandonner'],
      answer: 1,
      explanation: 'Indice +2 : on reste à TC ≥ +2.',
    },
    {
      question: '12 contre 4, TC = −1. Que faire ?',
      choices: ['Rester', 'Tirer', 'Doubler', 'Abandonner'],
      answer: 1,
      explanation: 'La stratégie de base reste, mais on tire quand TC < 0.',
    },
    {
      question: '10 contre 10, TC = +4. Que faire ?',
      choices: ['Tirer', 'Doubler', 'Rester', 'Abandonner'],
      answer: 1,
      explanation: 'Indice +4 : on double.',
    },
    {
      question: '10,10 contre 6, TC = +5. Que faire ?',
      choices: ['Rester', 'Séparer', 'Doubler', 'Tirer'],
      answer: 1,
      explanation: 'Indice +4 : on sépare (attention à la discrétion).',
    },
    {
      question: '11 contre As (S17), TC = +1. Que faire ?',
      choices: ['Tirer', 'Doubler', 'Rester', 'Abandonner'],
      answer: 1,
      explanation: 'Indice +1 : on double.',
    },
    {
      question: '14 contre 10, abandon autorisé, TC = +3. Que faire ?',
      choices: ['Tirer', 'Rester', 'Abandonner', 'Doubler'],
      answer: 2,
      explanation: 'Fab 4 : 14 contre 10 s\'abandonne à TC ≥ +3.',
    },
    {
      question: '15 contre 10, abandon autorisé, TC = −1. Que faire ?',
      choices: ['Abandonner', 'Tirer', 'Rester', 'Doubler'],
      answer: 1,
      explanation: 'Fab 4 : on n\'abandonne 15 contre 10 qu\'à TC ≥ 0 ; en dessous, on tire.',
    },
    {
      question: 'Pour quelles règles les indices de cette formation sont-ils valables ?',
      choices: [
        'Jeu simple, H17',
        'Sabot de 4-8 jeux, S17, DAS, abandon tardif, TC arrondi à l\'entier inférieur',
        'Toutes les règles',
        'Uniquement 8 jeux sans abandon',
      ],
      answer: 1,
      explanation: 'Les indices dépendent des règles et de la convention d\'arrondi.',
    },
    {
      question: '13 contre 2, TC = −2. Que faire ?',
      choices: ['Rester', 'Tirer', 'Doubler', 'Abandonner'],
      answer: 1,
      explanation: 'Indice −1 : on tire quand TC < −1.',
    },
    {
      question: 'Vous avez un blackjack, le croupier montre un As, TC = +4. Even money ?',
      choices: ['Oui', 'Non'],
      answer: 0,
      explanation: 'Even money = assurance. À TC ≥ +3, on l\'accepte.',
    },
  ],
};
