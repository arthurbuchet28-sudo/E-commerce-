import type { CourseModule } from './types';

export const module3: CourseModule = {
  id: 3,
  slug: 'principe-du-comptage',
  title: 'Le principe du comptage',
  subtitle: 'Pourquoi la composition du sabot change l\'avantage',
  duration: '30 min',
  objectives: [
    'Comprendre pourquoi les cartes hautes favorisent le joueur et les cartes basses le croupier.',
    'Comprendre l\'effet de retrait d\'une carte (EOR).',
    'Savoir que le Blackjack n\'est pas un jeu à tirages indépendants.',
    'Connaître les grandes étapes de l\'histoire du comptage (Thorp, Hi-Lo).',
  ],
  sections: [
    {
      id: 'memoire',
      title: 'Un jeu avec mémoire',
      blocks: [
        {
          type: 'p',
          text: "À la roulette, chaque tirage est indépendant : la bille n'a aucune mémoire. Au Blackjack, **les cartes sorties ne reviennent pas avant le mélange**. Chaque carte jouée modifie la composition de ce qui reste, et donc les probabilités des mains suivantes.",
        },
        {
          type: 'example',
          title: 'Exemple extrême',
          lines: [
            'Un jeu unique dont on a déjà vu sortir les 4 As.',
            'Probabilité d\'un blackjack sur la main suivante : **0 %** (au lieu de 4,8 %).',
            'Le joueur, qui aurait été payé 3:2, est clairement désavantagé.',
          ],
        },
        {
          type: 'p',
          text: "Le comptage de cartes consiste à **suivre l'équilibre entre cartes hautes et cartes basses restant dans le sabot**, pour miser plus quand il est favorable et moins (ou pas du tout) quand il est défavorable.",
        },
      ],
    },
    {
      id: 'hautes',
      title: 'Pourquoi les cartes hautes favorisent le joueur',
      blocks: [
        {
          type: 'p',
          text: 'Un sabot riche en 10 et en As profite au joueur pour plusieurs raisons, toutes liées à l\'asymétrie des règles :',
        },
        {
          type: 'list',
          items: [
            "**Les blackjacks sont plus fréquents** pour les deux camps, mais le joueur est payé **3:2** alors que le croupier ne gagne que la mise (1:1).",
            "**Le croupier doit tirer jusqu'à 16** : avec une main raide (12-16), il saute plus souvent quand il reste beaucoup de 10. Le joueur, lui, peut **rester**.",
            '**Les doubles réussissent mieux** : doubler sur 10 ou 11 et recevoir un 10 est le scénario idéal.',
            "**L'assurance devient rentable** quand plus d'un tiers des cartes restantes sont des 10.",
            '**Le joueur peut adapter son jeu** (rester sur 16 contre 10, etc.), le croupier non.',
          ],
        },
        {
          type: 'p',
          text: "À l'inverse, un sabot riche en petites cartes (2 à 6) **aide le croupier** à compléter ses mains raides sans sauter, et rend les doubles du joueur moins fructueux.",
        },
      ],
    },
    {
      id: 'eor',
      title: "L'effet de retrait (Effect of Removal)",
      blocks: [
        {
          type: 'p',
          text: "L'**effet de retrait** d'une carte mesure la variation de l'espérance du joueur quand on retire cette carte du jeu. Les valeurs ci-dessous (calculées par Peter Griffin pour un jeu unique et la stratégie de base) indiquent la variation en points de % quand **une** carte de ce rang est retirée d'un jeu de 52 :",
        },
        {
          type: 'table',
          headers: ['Carte retirée', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'As'],
          rows: [['Effet sur le joueur (%)', '+0,38', '+0,44', '+0,55', '+0,69', '+0,46', '+0,28', '0,00', '−0,18', '−0,51', '−0,61']],
          caption: 'Valeurs de référence (jeu unique). En sabot, les effets sont divisés à peu près par le nombre de jeux.',
        },
        { type: 'widget', id: 'eor-chart' },
        {
          type: 'list',
          items: [
            'Retirer une **petite carte** (2-6) **aide** le joueur. Le **5** est la carte la plus néfaste pour le joueur : son retrait est le plus bénéfique.',
            'Retirer un **10** ou un **As** **nuit** au joueur.',
            'Les 7, 8, 9 ont un effet faible : on les compte 0 dans le Hi-Lo.',
            'Le Hi-Lo approxime ces effets par +1 / 0 / −1 : c\'est grossier, mais ça capture l\'essentiel (corrélation de mise ≈ 0,97).',
          ],
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'De l\'EOR au comptage',
          text: "Si l'on additionne les effets de toutes les cartes sorties, on obtient une estimation de l'avantage du joueur sur les cartes restantes. Un système de comptage est une **simplification entière** de ces effets, assez simple pour être fait de tête à la vitesse du jeu.",
        },
      ],
    },
    {
      id: 'avantage',
      title: 'Ordres de grandeur',
      blocks: [
        {
          type: 'p',
          text: "Dans un sabot de 6 jeux, l'avantage du joueur oscille la plupart du temps entre −2 % et +2 %. Il est **négatif ou nul environ 2 mains sur 3**. Le compteur gagne parce qu'il mise beaucoup plus pendant la minorité de mains favorables.",
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Ce que le comptage ne fait PAS',
          text: "Le comptage ne prédit **pas** la prochaine carte. Avec un compte très positif, la prochaine carte peut parfaitement être un 5. Il donne seulement une **probabilité légèrement meilleure**, qui ne se manifeste qu'à long terme, sur des dizaines de milliers de mains.",
        },
      ],
    },
    {
      id: 'histoire',
      title: 'Petite histoire du comptage',
      blocks: [
        {
          type: 'table',
          headers: ['Année', 'Événement'],
          rows: [
            ['1956', 'Baldwin, Cantey, Maisel et McDermott publient une première stratégie de base quasi exacte.'],
            ['1962', 'Edward O. Thorp, mathématicien, publie *Beat the Dealer*. Il prouve par ordinateur (IBM 704) que le joueur peut obtenir un avantage en suivant les cartes. Son « Ten Count » compte la proportion de 10.'],
            ['1963', 'Harvey Dubner présente le système **Hi-Lo**, plus simple, que Thorp intègre à la 2e édition de son livre (1966).'],
            ['1975', 'Stanford Wong popularise le Hi-Lo et la technique du « Wonging » dans *Professional Blackjack*.'],
            ['Années 1970-80', 'Les casinos multiplient les sabots de 6-8 jeux, réduisent la pénétration, et commencent à expulser les compteurs.'],
            ['1986', 'Don Schlesinger publie les **Illustrious 18**, les déviations les plus rentables (module 7).'],
            ['1980-2000', 'Équipes de comptage (dont la célèbre équipe du MIT) : jeu en équipe, « Big Player ».'],
            ['Aujourd\'hui', 'Mélangeurs continus, 6:5, H17… Les bonnes tables existent encore mais se raréfient.'],
          ],
        },
        {
          type: 'p',
          text: 'Le **Hi-Lo** reste le système le plus enseigné : il est simple (niveau 1), équilibré, et sa performance est très proche des systèmes plus complexes en sabot.',
        },
      ],
    },
  ],
  keyPoints: [
    'Les cartes sorties ne reviennent pas avant le mélange : les probabilités évoluent au fil du sabot.',
    'Sabot riche en 10/As = favorable au joueur (blackjacks payés 3:2, croupier qui saute, doubles réussis, assurance).',
    'Sabot riche en petites cartes = favorable au croupier.',
    'L\'effet de retrait quantifie l\'impact de chaque carte ; le 5 est la carte la plus favorable au croupier, l\'As et le 10 les plus favorables au joueur.',
    'Le comptage ne prédit pas la prochaine carte : il mesure un léger avantage statistique.',
    'Thorp (1962) a prouvé que le jeu peut être battu ; le Hi-Lo (Dubner, 1963) est devenu le standard.',
  ],
  mistakes: [
    { mistake: 'Croire que le comptage permet de savoir quelle sera la prochaine carte.', fix: 'Il ne donne qu\'une tendance statistique. On mise plus, sans certitude.' },
    { mistake: 'Penser qu\'après plusieurs mains perdues, « ça va tourner ».', fix: 'C\'est l\'erreur du joueur (gambler\'s fallacy). Seule la composition du sabot compte, pas les résultats passés.' },
    { mistake: 'Croire que les petites cartes sont « bonnes » parce qu\'elles évitent de sauter.', fix: 'Elles aident surtout le croupier, obligé de tirer sur 12-16. Un sabot riche en petites cartes est défavorable.' },
    { mistake: 'Penser qu\'il faut mémoriser toutes les cartes sorties.', fix: 'Un seul nombre suffit : le running count, mis à jour carte par carte.' },
  ],
  exercises: [{ id: 'card-stream', title: 'Défilé de cartes (niveau 1)', goal: 'Commencez à associer chaque carte à sa catégorie : basse, neutre, haute.' }],
  quiz: [
    {
      question: 'Pourquoi un sabot riche en 10 et As favorise-t-il le joueur ?',
      choices: [
        'Parce que le joueur saute moins',
        'Parce que les blackjacks (payés 3:2 au joueur) sont plus fréquents et que le croupier, obligé de tirer, saute plus souvent',
        'Parce que le croupier ne peut plus faire de blackjack',
        'Parce que les cartes hautes sortent en premier',
      ],
      answer: 1,
      explanation: 'Le croupier fait aussi plus de blackjacks, mais il n\'est payé que 1:1 ; et il doit tirer sur 12-16 quand le joueur peut rester.',
    },
    {
      question: 'Quel retrait de carte est le plus favorable au joueur ?',
      choices: ['Un As', 'Un 10', 'Un 5', 'Un 9'],
      answer: 2,
      explanation: 'L\'effet de retrait du 5 est d\'environ +0,69 % (jeu unique) : c\'est la carte qui aide le plus le croupier.',
    },
    {
      question: 'Que mesure l\'effet de retrait (EOR) ?',
      choices: [
        'La probabilité de tirer une carte',
        'La variation de l\'espérance du joueur quand on retire une carte donnée du jeu',
        'Le nombre de cartes restant',
        'La vitesse du croupier',
      ],
      answer: 1,
      explanation: 'C\'est la base théorique des systèmes de comptage : chaque carte vue modifie l\'avantage.',
    },
    {
      question: 'Le Blackjack diffère de la roulette parce que…',
      choices: [
        'Les tirages sont indépendants',
        'Les cartes sorties ne reviennent pas avant le mélange',
        'Le casino n\'a aucun avantage',
        'On joue contre les autres joueurs',
      ],
      answer: 1,
      explanation: 'Sans remise, la composition du sabot change à chaque carte : c\'est ce qui rend le comptage possible.',
    },
    {
      question: 'Qui a publié « Beat the Dealer » en 1962 ?',
      choices: ['Stanford Wong', 'Edward O. Thorp', 'Don Schlesinger', 'Ken Uston'],
      answer: 1,
      explanation: 'Edward O. Thorp, mathématicien, a démontré par ordinateur que le Blackjack pouvait être battu.',
    },
    {
      question: 'Qui a présenté le système Hi-Lo ?',
      choices: ['Harvey Dubner', 'Julian Braun', 'Peter Griffin', 'Arnold Snyder'],
      answer: 0,
      explanation: 'Harvey Dubner l\'a présenté en 1963 ; Thorp l\'a intégré à la 2e édition de Beat the Dealer.',
    },
    {
      question: 'Un compte très positif signifie que la prochaine carte sera…',
      choices: ['Forcément un 10', 'Plus probablement une carte haute qu\'en moyenne', 'Forcément une petite carte', 'Un As'],
      answer: 1,
      explanation: 'Le compte modifie légèrement les probabilités, il ne donne aucune certitude.',
    },
    {
      question: 'Pourquoi les petites cartes favorisent-elles le croupier ?',
      choices: [
        'Parce qu\'il est payé 3:2',
        'Parce qu\'elles lui permettent de compléter ses mains de 12 à 16 sans sauter',
        'Parce qu\'il peut doubler',
        'Parce qu\'elles annulent les blackjacks du joueur',
      ],
      answer: 1,
      explanation: 'Obligé de tirer sur 12-16, le croupier profite des petites cartes pour atteindre 17-21.',
    },
    {
      question: 'Quelle proportion des mains est jouée avec un avantage négatif ou nul en sabot de 6 jeux, environ ?',
      choices: ['10 %', '33 %', '66 %', '95 %'],
      answer: 2,
      explanation: 'Environ deux tiers des mains se jouent à TC ≤ 0. Le compteur gagne en misant plus sur le tiers restant.',
    },
    {
      question: 'Les 7, 8 et 9 valent 0 en Hi-Lo parce que…',
      choices: [
        'Ils sont rares',
        'Leur effet de retrait est faible (proche de zéro)',
        'Ils ne sortent jamais',
        'Ils sont toujours favorables au joueur',
      ],
      answer: 1,
      explanation: 'L\'effet du 8 est nul, ceux du 7 et du 9 sont faibles et de signes opposés : on les ignore pour simplifier.',
    },
    {
      question: 'Après 5 mains perdues d\'affilée, que dit le comptage sur la main suivante ?',
      choices: [
        'Vous allez probablement gagner',
        'Rien : seule la composition des cartes restantes compte',
        'Vous allez probablement perdre',
        'Il faut doubler la mise',
      ],
      answer: 1,
      explanation: 'Les résultats passés n\'ont aucune influence en soi. Seules les cartes sorties, via le compte, renseignent sur la suite.',
    },
  ],
};
