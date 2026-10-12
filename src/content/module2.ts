import type { CourseModule } from './types';

export const module2: CourseModule = {
  id: 2,
  slug: 'strategie-de-base',
  title: 'La stratégie de base',
  subtitle: 'La façon mathématiquement optimale de jouer chaque main, sans compter',
  duration: '2 à 4 h (mémorisation)',
  objectives: [
    'Comprendre ce qu\'est la stratégie de base et pourquoi elle est optimale.',
    'Connaître par cœur les quatre tableaux : mains dures, mains soft, paires et abandon.',
    'Mémoriser par blocs logiques plutôt que case par case.',
    'Savoir quel avantage la maison conserve face à un joueur parfait.',
    'Viser 100 % de bonnes réponses aux flash cards, en moins de 2 secondes par décision.',
  ],
  sections: [
    {
      id: 'pourquoi',
      title: 'Pourquoi une stratégie de base ?',
      blocks: [
        {
          type: 'p',
          text: "Pour chaque combinaison « main du joueur / carte visible du croupier », il existe **une** décision qui maximise l'espérance de gain. Elle a été calculée par ordinateur en simulant ou en énumérant toutes les suites de cartes possibles. L'ensemble de ces décisions forme la **stratégie de base**.",
        },
        {
          type: 'p',
          text: "Les premiers à la publier furent Baldwin, Cantey, Maisel et McDermott en 1956 (les « Quatre Cavaliers d'Aberdeen »), à la main et avec des calculatrices mécaniques. Julian Braun l'a ensuite affinée sur ordinateur dans les années 1960.",
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Le socle de tout comptage',
          text: "Le comptage ne rapporte qu'**environ 1 %** de plus. Une seule erreur de stratégie de base toutes les quelques dizaines de mains suffit à annuler ce gain. **On ne commence pas à compter avant de maîtriser parfaitement la stratégie de base.**",
        },
        {
          type: 'table',
          headers: ['Façon de jouer', 'Avantage de la maison (≈)'],
          rows: [
            ['Imiter le croupier (tirer jusqu\'à 16)', '5,5 %'],
            ['Ne jamais risquer de sauter (rester dès 12)', '4 %'],
            ['Jouer « à l\'instinct » (joueur moyen)', '1,5 à 2 %'],
            ['**Stratégie de base parfaite** (6 jeux, S17, DAS, abandon, 3:2)', '**≈ 0,34 %**'],
            ['Compteur Hi-Lo compétent (bonne table)', '**+0,5 à +1,5 % pour le joueur**'],
          ],
        },
      ],
    },
    {
      id: 'reference',
      title: 'La configuration de référence',
      blocks: [
        {
          type: 'callout',
          tone: 'info',
          title: 'Tous les tableaux de cette formation sont valables pour :',
          text: "**6 jeux · le croupier reste sur soft 17 (S17) · double sur deux cartes quelconques · double après séparation (DAS) · abandon tardif · blackjack payé 3:2 · le croupier vérifie s'il a blackjack (peek).** Ils restent valables à quelques cases près pour 4 à 8 jeux. Les différences H17 sont indiquées ci-dessous.",
        },
        { type: 'h', text: 'Légende' },
        {
          type: 'table',
          headers: ['Code', 'Signification'],
          rows: [
            ['**H**', 'Tirer (Hit)'],
            ['**S**', 'Rester (Stand)'],
            ['**D**', 'Doubler si possible, sinon tirer'],
            ['**Ds**', 'Doubler si possible, sinon rester'],
            ['**P**', 'Séparer (sPlit)'],
            ['**R**', 'Abandonner si possible (suRrender), sinon jouer selon le tableau des mains dures'],
          ],
        },
        { type: 'widget', id: 'strategy-charts' },
        {
          type: 'p',
          text: "**Ordre de lecture** : 1) peut-on abandonner et le tableau d'abandon le recommande-t-il ? 2) est-ce une paire à séparer ? 3) est-ce une main soft ? 4) sinon, tableau des mains dures.",
        },
        { type: 'h', text: 'Différences en H17 (croupier tire sur soft 17)' },
        {
          type: 'list',
          items: [
            '11 contre As : **doubler** (au lieu de tirer).',
            'A,7 contre 2 : **doubler** (Ds) ; A,8 contre 6 : **doubler** (Ds).',
            'Abandon supplémentaire : 15 contre As, 17 contre As, 8,8 contre As.',
          ],
        },
        {
          type: 'p',
          text: "Sans double après séparation (pas de DAS) : 2,2 et 3,3 ne se séparent que contre 4 à 7 ; 4,4 ne se sépare jamais ; 6,6 se sépare contre 3 à 6.",
        },
      ],
    },
    {
      id: 'croupier',
      title: 'La logique : cartes faibles et cartes fortes du croupier',
      blocks: [
        {
          type: 'p',
          text: "Presque toute la stratégie se comprend avec une idée : **la carte visible du croupier prédit sa main finale**. Avec 2 à 6, il doit très souvent tirer sur une main « raide » (12 à 16) et saute fréquemment. Avec 7 à As, il finit le plus souvent entre 17 et 21.",
        },
        { type: 'widget', id: 'dealer-bust' },
        {
          type: 'list',
          items: [
            '**Croupier faible (2 à 6)** : on le laisse prendre le risque de sauter. On reste sur nos mains raides (13-16), on double et on sépare agressivement pour mettre plus d\'argent sur la table.',
            '**Croupier fort (7 à As)** : rester sur 12-16 revient à espérer qu\'il saute, ce qui arrive moins d\'une fois sur quatre. On tire jusqu\'à 17.',
            "**Le 4, 5, 6 sont les pires cartes** pour le croupier : c'est là qu'on double et sépare le plus.",
          ],
        },
      ],
    },
    {
      id: 'blocs',
      title: 'Mémoriser par blocs logiques',
      blocks: [
        {
          type: 'p',
          text: 'Ne mémorisez pas 290 cases une par une. Apprenez une dizaine de règles, puis les exceptions.',
        },
        { type: 'h', text: 'Mains dures' },
        {
          type: 'list',
          items: [
            '**8 ou moins** : toujours tirer.',
            '**9** : doubler contre 3 à 6, sinon tirer.',
            '**10** : doubler contre 2 à 9, sinon tirer.',
            '**11** : doubler contre 2 à 10 (tirer contre As en S17).',
            '**12** : rester contre 4 à 6, sinon tirer. (*Exception à retenir : on tire contre 2 et 3.*)',
            '**13 à 16** : rester contre 2 à 6, tirer contre 7 à As. (*Phrase-clé : « raide contre faible, je reste ; raide contre fort, je tire ».*)',
            '**17 et plus** : toujours rester.',
          ],
        },
        { type: 'h', text: 'Mains soft' },
        {
          type: 'list',
          items: [
            '**A,2 et A,3** : doubler contre 5 et 6.',
            '**A,4 et A,5** : doubler contre 4 à 6.',
            '**A,6** : doubler contre 3 à 6.',
            '**A,7** : doubler (sinon rester) contre 3 à 6 ; rester contre 2, 7, 8 ; **tirer contre 9, 10, As**.',
            '**A,8 et A,9** : rester.',
            "Astuce : la « fenêtre de double » s'élargit à mesure que la main grandit : 5-6, puis 4-6, puis 3-6.",
          ],
        },
        { type: 'h', text: 'Paires (avec DAS)' },
        {
          type: 'list',
          items: [
            '**Toujours** séparer As et 8. **Jamais** séparer 10 et 5 (5,5 se joue comme un 10).',
            '**2,2 / 3,3 / 7,7** : séparer contre 2 à 7.',
            '**6,6** : séparer contre 2 à 6.',
            '**4,4** : séparer contre 5 et 6 seulement.',
            '**9,9** : séparer contre 2 à 9 **sauf 7** ; rester contre 7, 10, As. (18 bat le 17 typique d\'un croupier avec 7.)',
          ],
        },
        { type: 'h', text: 'Abandon (tardif)' },
        {
          type: 'list',
          items: [
            '**16** (hors 8,8) contre 9, 10, As.',
            '**15** contre 10.',
            "Règle : on abandonne quand on perd en moyenne **plus de 50 %** de la mise en jouant la main. 16 contre 10 perd ≈ 54 % en tirant : l'abandon (−50 %) est moins cher.",
          ],
        },
      ],
    },
    {
      id: 'exemples',
      title: 'Exemples commentés',
      blocks: [
        {
          type: 'example',
          title: '12 contre 3 → tirer',
          lines: [
            "Le croupier saute ≈ 38 % du temps avec un 3, mais avec 12 seules les cartes de valeur 10 vous font sauter (≈ 31 %).",
            'Les simulations montrent que tirer perd un peu moins que rester : c\'est l\'une des décisions les plus « contre-intuitives » mais la différence est faible.',
          ],
        },
        {
          type: 'example',
          title: 'A,7 contre 9 → tirer',
          lines: [
            'Soft 18 paraît bon, mais le croupier avec un 9 finit souvent à 19.',
            'En tirant, vous ne pouvez pas sauter (l\'As redevient 1) : vous améliorez une main perdante en moyenne.',
          ],
        },
        {
          type: 'example',
          title: '11 contre 10 → doubler',
          lines: [
            '≈ 31 % des cartes valent 10 et vous donnent 21. Même contre un 10, votre espérance avec 11 est positive : on double pour la multiplier par deux.',
          ],
        },
        {
          type: 'example',
          title: '8,8 contre 10 → séparer',
          lines: [
            '16 contre 10 perd ≈ 54 % de la mise. Deux mains partant de 8 perdent moins au total, même si elles restent perdantes.',
            'Séparer ici ne gagne pas d\'argent : il en **perd moins**.',
          ],
        },
      ],
    },
    {
      id: 'methode',
      title: 'Méthode de mémorisation recommandée',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Jour 1 : mains dures uniquement (flash cards filtrées sur « dures »). Objectif 100 %.',
            'Jour 2 : mains soft. Jour 3 : paires et abandon.',
            'Jour 4 et suivants : tout mélangé, en visant la vitesse (moins de 2 secondes par décision).',
            'Révisez ensuite chaque jour les situations ratées (la répétition espacée les fait revenir plus souvent).',
            "Un bon test : jouez 200 mains au simulateur avec l'affichage de l'action recommandée désactivé, puis vérifiez le bilan : zéro erreur.",
          ],
        },
      ],
    },
  ],
  keyPoints: [
    'La stratégie de base est la décision optimale pour chaque main, calculée par ordinateur.',
    'Avec une stratégie parfaite et de bonnes règles, l\'avantage du casino tombe à ≈ 0,3-0,5 %.',
    'La carte du croupier est la clé : 2-6 = faible (on reste, on double, on sépare), 7-As = forte (on tire jusqu\'à 17).',
    'Toujours séparer As et 8 ; jamais 10 et 5.',
    'Toujours tirer sur 12-16 contre 7 à As (sauf abandon).',
    'Abandonner 16 contre 9-10-As et 15 contre 10 quand l\'abandon tardif est permis.',
    'Il faut connaître les tableaux parfaitement AVANT de compter.',
  ],
  mistakes: [
    { mistake: 'Rester sur 12 contre 2 ou 3 « pour ne pas sauter ».', fix: 'On tire : le croupier ne saute pas assez souvent avec 2 ou 3.' },
    { mistake: 'Rester sur soft 18 contre 9, 10 ou As.', fix: 'On tire : soft 18 est une main perdante face à ces cartes, et on ne peut pas sauter.' },
    { mistake: 'Séparer les 10 « pour faire deux mains gagnantes ».', fix: 'Jamais : 20 gagne environ 85 % des mains non nulles contre un 6. (Exception : déviation à fort compte, module 7.)' },
    { mistake: 'Ne pas doubler 11 contre 10 par peur de perdre deux mises.', fix: '11 contre 10 a une espérance positive : doubler la multiplie par deux.' },
    { mistake: 'Oublier que D devient « tirer » et Ds « rester » après trois cartes.', fix: 'On ne double que sur deux cartes ; A,2,5 (soft 18) contre 4 → rester (Ds).' },
    { mistake: 'Utiliser un tableau H17 sur une table S17 (ou l\'inverse).', fix: 'Lisez le tapis. Les différences sont peu nombreuses mais réelles (11 contre As, A,7 contre 2, abandons).' },
  ],
  exercises: [
    { id: 'flashcards', title: 'Flash cards de stratégie de base', goal: '100 % de réussite, moins de 2 s par réponse.' },
    { id: 'simulator', title: 'Simulateur (affichage de l\'action désactivé)', goal: '200 mains sans erreur.' },
  ],
  quiz: [
    {
      question: '16 dur contre 7 (abandon autorisé). Que faire ?',
      choices: ['Rester', 'Tirer', 'Abandonner', 'Doubler'],
      answer: 1,
      explanation: "Contre 7, on tire sur 12-16. L'abandon de 16 ne concerne que 9, 10 et As.",
    },
    {
      question: '12 contre 4 ?',
      choices: ['Tirer', 'Rester', 'Doubler', 'Abandonner'],
      answer: 1,
      explanation: '12 : rester contre 4, 5, 6 ; tirer contre tout le reste (y compris 2 et 3).',
    },
    {
      question: '11 contre 10 ?',
      choices: ['Tirer', 'Rester', 'Doubler', 'Abandonner'],
      answer: 2,
      explanation: '11 se double contre 2 à 10 (contre As : tirer en S17, doubler en H17).',
    },
    {
      question: 'A,7 (soft 18) contre 10 ?',
      choices: ['Rester', 'Tirer', 'Doubler', 'Abandonner'],
      answer: 1,
      explanation: 'Soft 18 contre 9, 10 ou As : on tire. On ne peut pas sauter et 18 perd en moyenne contre ces cartes.',
    },
    {
      question: 'A,7 contre 6 (deux cartes) ?',
      choices: ['Rester', 'Tirer', 'Doubler', 'Séparer'],
      answer: 2,
      explanation: 'A,7 se double contre 3 à 6 (Ds : on reste si on ne peut pas doubler).',
    },
    {
      question: '9,9 contre 7 ?',
      choices: ['Séparer', 'Rester', 'Tirer', 'Doubler'],
      answer: 1,
      explanation: 'Avec un 7, le croupier finit souvent à 17. Votre 18 le bat : on reste. On sépare 9,9 contre 2-6 et 8-9.',
    },
    {
      question: '8,8 contre As (S17, abandon autorisé) ?',
      choices: ['Séparer', 'Abandonner', 'Tirer', 'Rester'],
      answer: 0,
      explanation: 'En S17, on sépare toujours les 8. En H17 seulement, 8,8 contre As s\'abandonne.',
    },
    {
      question: '5,5 contre 9 ?',
      choices: ['Séparer', 'Doubler', 'Tirer', 'Rester'],
      answer: 1,
      explanation: '5,5 se joue comme un 10 dur : doubler contre 2 à 9.',
    },
    {
      question: '15 contre 10 (abandon tardif autorisé) ?',
      choices: ['Tirer', 'Rester', 'Abandonner', 'Doubler'],
      answer: 2,
      explanation: '15 contre 10 fait partie des abandons de la stratégie de base (avec 16 contre 9, 10, As).',
    },
    {
      question: 'Pourquoi reste-t-on sur 13 contre 5 ?',
      choices: [
        'Parce que 13 est une bonne main',
        'Parce que le croupier, avec un 5, saute ≈ 43 % du temps',
        'Parce qu\'il est interdit de tirer sur 13',
        'Parce que le croupier a forcément 15',
      ],
      answer: 1,
      explanation: 'Avec 2-6, le croupier saute souvent. Avec 13, tirer vous fait sauter une fois sur trois environ : on laisse le croupier prendre le risque.',
    },
    {
      question: 'A,2,4 (soft 17 en trois cartes) contre 4 ?',
      choices: ['Doubler', 'Rester', 'Tirer', 'Abandonner'],
      answer: 2,
      explanation: 'Soft 17 contre 4 = D (doubler sinon tirer). En trois cartes on ne peut plus doubler : on tire.',
    },
    {
      question: 'Quel est l\'avantage approximatif de la maison face à une stratégie de base parfaite (6 jeux, S17, DAS, abandon, 3:2) ?',
      choices: ['≈ 0,34 %', '≈ 2 %', '≈ 5 %', '0 %'],
      answer: 0,
      explanation: 'Environ 0,3 à 0,4 %. C\'est ce petit déficit que le comptage va transformer en avantage.',
    },
    {
      question: '4,4 contre 5 (avec DAS) ?',
      choices: ['Tirer', 'Séparer', 'Doubler', 'Rester'],
      answer: 1,
      explanation: 'Avec le double après séparation, 4,4 se sépare contre 5 et 6 (chaque main part de 4 et peut devenir un bon double).',
    },
  ],
};
