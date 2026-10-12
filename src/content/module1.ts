import type { CourseModule } from './types';

export const module1: CourseModule = {
  id: 1,
  slug: 'regles',
  title: 'Les règles du Blackjack',
  subtitle: "Déroulé d'une main, actions, paiements et variantes de règles",
  duration: '45 min',
  objectives: [
    "Connaître le déroulé complet d'une main, de la mise au paiement.",
    'Calculer instantanément la valeur de n’importe quelle main, dure ou soft.',
    'Savoir quand et comment tirer, rester, doubler, séparer, abandonner ou prendre l’assurance.',
    'Comprendre pourquoi un blackjack payé 6:5 est à fuir.',
    'Lire une table : S17/H17, DAS, nombre de jeux, pénétration, et leur effet sur l’avantage de la maison.',
  ],
  sections: [
    {
      id: 'objectif',
      title: 'Le but du jeu',
      blocks: [
        {
          type: 'p',
          text: "Au Blackjack, vous ne jouez **pas** contre les autres joueurs : chacun joue uniquement contre le **croupier**. Le but est de finir avec un total plus proche de 21 que celui du croupier, **sans dépasser 21**. Dépasser 21, c'est « sauter » (*bust*) : la mise est perdue immédiatement, même si le croupier saute ensuite.",
        },
        {
          type: 'callout',
          tone: 'info',
          title: "D'où vient l'avantage du casino ?",
          text: "Le joueur joue **avant** le croupier. Si vous sautez, vous perdez, quoi que fasse le croupier ensuite. Quand les deux sautent (environ 8 % des mains si le joueur imite le croupier), c'est le casino qui gagne. Un joueur qui jouerait « comme le croupier » (tirer jusqu'à 16, ne jamais doubler ni séparer) perdrait environ 5,5 % de ses mises, malgré le blackjack payé 3:2. Les choix offerts au joueur (rester sur un petit total, doubler, séparer, abandonner) ramènent cet avantage sous 0,5 % avec la stratégie de base.",
        },
      ],
    },
    {
      id: 'valeurs',
      title: 'Valeur des cartes et des mains',
      blocks: [
        {
          type: 'table',
          headers: ['Carte', 'Valeur'],
          rows: [
            ['2 à 9', 'Leur valeur faciale'],
            ['10, Valet (J), Dame (Q), Roi (K)', '10'],
            ['As', '1 ou 11, au choix le plus favorable'],
          ],
          caption: 'Les couleurs (♠ ♥ ♦ ♣) ne jouent aucun rôle.',
        },
        {
          type: 'p',
          text: "Il y a donc **16 cartes de valeur 10 par jeu de 52** (10, J, Q, K dans 4 couleurs), soit 30,8 % des cartes. C'est la carte la plus fréquente, et elle jouera un rôle central dans tout le comptage.",
        },
        { type: 'h', text: 'Mains dures et mains soft' },
        {
          type: 'p',
          text: "Une main est **soft** (souple) lorsqu'elle contient un As compté pour 11 sans dépasser 21. Elle ne peut pas sauter en tirant une carte : si la carte fait dépasser 21, l'As repasse simplement à 1. Toutes les autres mains sont **dures** (*hard*).",
        },
        {
          type: 'example',
          title: 'Exemples',
          lines: [
            'A + 6 = **soft 17** (ou 7). Une carte de plus ne peut pas vous faire sauter.',
            'A + 6 + 9 = **16 dur** : compter l\'As 11 ferait 26, il vaut donc 1.',
            '10 + 6 = **16 dur** : la pire main du jeu, une carte de 6 à 10/As fait sauter.',
            'A + A = **soft 12** (un As à 11, l\'autre à 1 ; deux As à 11 feraient 22).',
            'A + K (en deux cartes) = **Blackjack**, et non un simple « 21 ».',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Blackjack ≠ 21',
          text: "Un **blackjack** (ou « naturel ») est un As accompagné d'une carte de valeur 10 **dans les deux premières cartes**. Il bat tous les 21 en trois cartes ou plus. Après une séparation, As + 10 compte comme un simple 21.",
        },
      ],
    },
    {
      id: 'deroule',
      title: "Déroulé d'une main",
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            '**Mise** : chaque joueur place sa mise dans son cercle, entre le minimum et le maximum de la table.',
            "**Distribution** : le croupier donne une carte face visible à chaque joueur, une carte visible pour lui, une deuxième carte visible à chaque joueur, puis sa **carte cachée** (*hole card*). Dans de nombreux casinos européens, il ne prend sa deuxième carte qu'après les joueurs (pas de carte cachée, règle dite *ENHC*) ; cette formation suppose la variante américaine avec carte cachée et *peek*.",
            "**Assurance** : si la carte visible du croupier est un As, il propose l'assurance (voir plus bas).",
            "**Vérification (peek)** : avec un As ou une carte de 10 visible, le croupier regarde discrètement s'il a blackjack. Si oui, il le révèle immédiatement et ramasse les mises (sauf blackjack du joueur : égalité).",
            '**Les joueurs jouent**, un par un, de la gauche du croupier (« première base ») à sa droite (« troisième base »).',
            '**Le croupier joue** selon une règle fixe : il tire jusqu\'à 16 et reste à partir de 17. Il n\'a **aucun choix**.',
            '**Paiement** : une main gagnante est payée 1:1, un blackjack 3:2 (ou 6:5 sur les mauvaises tables), une égalité (*push*) rend la mise.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Pourquoi c\'est important pour le compteur',
          text: "Chaque carte retournée doit être comptée **au moment où elle apparaît**. La carte cachée du croupier n'est comptée qu'au moment où il la retourne. Pendant le jeu des autres joueurs, vous comptez leurs cartes aussi : **toutes les cartes visibles comptent**.",
        },
      ],
    },
    {
      id: 'actions',
      title: 'Les actions du joueur',
      blocks: [
        {
          type: 'table',
          headers: ['Action', 'Geste à la table', 'Quand est-ce possible ?'],
          rows: [
            ['**Tirer** (*hit*)', 'Tapoter la table', 'Tant que le total est inférieur à 21.'],
            ['**Rester** (*stand*)', 'Geste horizontal de la main au-dessus des cartes', 'À tout moment.'],
            ['**Doubler** (*double down*)', 'Ajouter une mise égale à côté de la première', 'Sur les deux premières cartes uniquement. On reçoit exactement **une** carte.'],
            ['**Séparer** (*split*)', 'Ajouter une mise égale, le croupier écarte les cartes', 'Sur une paire (deux cartes de même valeur). Chaque carte devient une main séparée.'],
            ['**Abandonner** (*surrender*)', 'Le dire à voix haute (« abandon »)', 'Sur les deux premières cartes, si la table l\'autorise. On récupère la moitié de la mise.'],
            ['**Assurance**', 'Placer la moitié de la mise sur la ligne « insurance »', 'Uniquement quand le croupier montre un As.'],
          ],
        },
        { type: 'h', text: 'Détails importants' },
        {
          type: 'list',
          items: [
            '**Séparation d\'As** : en général, chaque As ne reçoit qu\'**une seule carte**, et As + 10 ne vaut que 21 (pas blackjack).',
            '**Double après séparation (DAS)** : certaines tables autorisent à doubler une main issue d\'une séparation. C\'est favorable au joueur.',
            '**Re-séparation** : souvent autorisée jusqu\'à 3 ou 4 mains, rarement pour les As.',
            '**Abandon tardif** (*late surrender*) : on peut abandonner après que le croupier a vérifié qu\'il n\'a pas blackjack. C\'est la forme courante aujourd\'hui.',
            "Les gestes servent aux caméras : au casino, on ne touche pas les cartes dans un sabot, et les gestes font foi plus que la parole.",
          ],
        },
        { type: 'h', text: "L'assurance : un pari à part" },
        {
          type: 'p',
          text: "L'assurance est un **pari séparé** : vous misez au plus la moitié de votre mise que le croupier a blackjack. Si c'est le cas, l'assurance paie **2:1** (vous récupérez ce que la main principale perd). Sinon, vous perdez l'assurance et la main continue normalement.",
        },
        {
          type: 'callout',
          tone: 'math',
          title: "Le calcul qui condamne l'assurance (sans comptage)",
          text: "Dans un sabot de 6 jeux, vous voyez l'As du croupier et vos deux cartes (disons 2 cartes qui ne sont pas des 10). Il reste 309 cartes inconnues dont 96 de valeur 10, soit p = 96 / 309 ≈ **31,1 %**. L'assurance paie 2:1, donc son espérance pour 1 € misé vaut 2 × p − 1 × (1 − p) = 3p − 1 ≈ **−6,8 %**. Elle ne devient rentable que si p > 1/3, c'est-à-dire quand le sabot est riche en 10 : c'est exactement ce que le comptage permet de détecter (module 7).",
        },
        {
          type: 'p',
          text: "« **Even money** » (paiement immédiat 1:1 proposé quand vous avez blackjack et que le croupier montre un As) est **exactement** la même chose que prendre l'assurance sur votre blackjack. Même verdict : à refuser, sauf quand le compte le justifie.",
        },
      ],
    },
    {
      id: 'croupier',
      title: 'Les règles du croupier : S17 ou H17',
      blocks: [
        {
          type: 'p',
          text: 'Le croupier tire obligatoirement jusqu\'à 16 et reste sur 17 dur ou plus. La seule variante concerne le **soft 17** (par exemple A + 6) :',
        },
        {
          type: 'table',
          headers: ['Règle', 'Signification', 'Effet sur la maison'],
          rows: [
            ['**S17** (*stands on soft 17*)', 'Le croupier reste sur soft 17', 'Référence'],
            ['**H17** (*hits soft 17*)', 'Le croupier tire sur soft 17', '≈ **+0,22 %** pour le casino'],
          ],
        },
        {
          type: 'p',
          text: 'Tirer sur soft 17 permet au croupier d\'améliorer une main médiocre (17 ne bat que les mains de 16 ou moins) sans risque de sauter immédiatement. La règle est écrite sur le tapis : « Dealer must stand on all 17s » (S17) ou « Dealer must hit soft 17 » (H17).',
        },
      ],
    },
    {
      id: 'paiement',
      title: 'Blackjack payé 3:2 ou 6:5',
      blocks: [
        {
          type: 'p',
          text: 'Un blackjack payé **3:2** rapporte 1,5 fois la mise (15 € pour 10 €). Payé **6:5**, il ne rapporte que 1,2 fois la mise (12 € pour 10 €). La différence semble faible ; elle est énorme.',
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Combien coûte le 6:5 ?',
          text: "Probabilité d'un blackjack en sabot de 6 jeux : 2 × (24/312) × (96/311) ≈ **4,75 %**. À chaque blackjack, le 6:5 vous retire 0,3 mise. Coût moyen : 4,75 % × 0,3 ≈ **1,4 % de chaque mise** (un peu moins, car un blackjack contre un blackjack du croupier est une égalité). C'est **4 fois** l'avantage de la maison d'une bonne table, et plus que l'avantage moyen qu'un bon compteur obtient. **Un compteur ne joue jamais sur une table 6:5.**",
        },
      ],
    },
    {
      id: 'variantes',
      title: 'Variantes de règles et avantage de la maison',
      blocks: [
        {
          type: 'p',
          text: "L'**avantage de la maison** (*house edge*) est la perte moyenne d'un joueur jouant parfaitement la stratégie de base, en pourcentage de sa mise initiale. Chaque règle le modifie. Les valeurs ci-dessous sont des ordres de grandeur pour un sabot, avec un joueur appliquant la stratégie de base :",
        },
        {
          type: 'table',
          headers: ['Règle', 'Effet (en points de %)', 'Commentaire'],
          rows: [
            ['1 jeu au lieu de 6', '≈ −0,48 (favorable)', 'Moins de jeux = plus de blackjacks et de bons doubles'],
            ['2 jeux au lieu de 6', '≈ −0,19', ''],
            ['8 jeux au lieu de 6', '≈ +0,02', 'Quasi neutre pour la stratégie de base'],
            ['H17 au lieu de S17', '≈ +0,22', 'Défavorable'],
            ['Pas de double après séparation', '≈ +0,14', 'Défavorable'],
            ['Abandon tardif autorisé', '≈ −0,08', 'Favorable'],
            ['Blackjack payé 6:5', '≈ +1,39', 'Catastrophique'],
            ['Re-séparation des As', '≈ −0,08', 'Favorable, rare'],
          ],
          caption: "Exemple : 6 jeux, S17, DAS, abandon tardif, 3:2 → environ 0,34 % pour le casino. Le même jeu en H17 et 6:5 → environ 1,95 %.",
        },
        { type: 'widget', id: 'house-edge' },
        { type: 'h', text: 'La pénétration' },
        {
          type: 'p',
          text: "La **pénétration** est la proportion du sabot distribuée avant le mélange, matérialisée par la **carte de coupe** (*cut card*). Avec 6 jeux et une pénétration de 75 %, on distribue 4,5 jeux, puis on mélange.",
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Point clé pour le compteur',
          text: "La pénétration ne change **rien** à l'avantage de la maison pour un joueur non compteur. Pour un compteur, c'est la règle **la plus importante** : plus on va loin dans le sabot, plus le true count peut atteindre des valeurs élevées. Une pénétration de 65 % rend souvent le comptage non rentable, 80 % ou plus le rend intéressant. Les **mélangeurs automatiques continus** (CSM) rendent le comptage impossible.",
        },
      ],
    },
  ],
  keyPoints: [
    'On joue uniquement contre le croupier ; si vous sautez, vous perdez même si le croupier saute ensuite.',
    'Il y a 16 cartes de valeur 10 par jeu : c\'est la carte la plus fréquente (≈ 31 %).',
    'Une main soft contient un As compté 11 : elle ne peut pas sauter avec une carte de plus.',
    'Le croupier n\'a aucun choix : il tire jusqu\'à 16, reste à 17 (ou tire sur soft 17 en H17).',
    'Blackjack 3:2 obligatoire : le 6:5 coûte environ 1,4 % de chaque mise.',
    'L\'assurance coûte ≈ 6,8 % de la somme assurée sans comptage ; elle devient rentable quand plus d\'1/3 des cartes restantes sont des 10.',
    'La pénétration ne change pas l\'avantage de la maison mais conditionne la rentabilité du comptage.',
  ],
  mistakes: [
    { mistake: 'Confondre un 21 en trois cartes avec un blackjack.', fix: 'Le blackjack n\'existe qu\'en deux cartes, hors séparation. Il est payé 3:2, un 21 est payé 1:1.' },
    { mistake: 'Compter A + 6 comme un 17 « fixe » et rester.', fix: 'A + 6 est un soft 17 : on peut tirer sans risque (on le joue même en doublant contre 3 à 6).' },
    { mistake: '« Assurer un bon jeu » (prendre l\'assurance ou even money avec un 20 ou un blackjack).', fix: 'L\'assurance est un pari indépendant de votre main. Sans comptage, c\'est un pari perdant.' },
    { mistake: 'Jouer sur une table 6:5 parce que le minimum est plus bas.', fix: 'Le coût du 6:5 (≈ 1,4 %) dépasse tout ce qu\'un compteur peut gagner. Changez de table.' },
    { mistake: 'Croire que les autres joueurs « volent vos cartes » ou font perdre la table.', fix: 'Statistiquement, leurs décisions n\'ont aucun effet sur votre espérance. Pour le compteur, ils ajoutent même des cartes à observer.' },
  ],
  exercises: [
    { id: 'flashcards', title: 'Flash cards (lecture des mains)', goal: 'Habituez-vous à lire instantanément les totaux durs et soft.' },
    { id: 'simulator', title: 'Simulateur de table', goal: 'Jouez quelques mains pour vous familiariser avec le déroulé.' },
  ],
  quiz: [
    {
      question: 'Que vaut la main As + 5 + 10 ?',
      choices: ['Soft 16', '16 dur', '26', 'Soft 26'],
      answer: 1,
      explanation: "Compter l'As 11 ferait 26 (> 21) : l'As vaut donc 1, et la main vaut 16 dur.",
    },
    {
      question: 'Vous avez As + 7 en deux cartes. Comment appelle-t-on cette main ?',
      choices: ['18 dur', 'Soft 18', 'Blackjack', 'Une paire'],
      answer: 1,
      explanation: "L'As est compté 11 sans dépasser 21 : c'est un soft 18 (ou 8).",
    },
    {
      question: 'Vous misez 20 € et obtenez un blackjack sur une table 3:2. Combien gagnez-vous ?',
      choices: ['20 €', '24 €', '30 €', '40 €'],
      answer: 2,
      explanation: '3:2 signifie 3 pour 2 misés : 20 × 1,5 = 30 € de gain (vous récupérez aussi votre mise).',
    },
    {
      question: 'Même situation (20 € misés, blackjack) sur une table 6:5. Combien gagnez-vous ?',
      choices: ['20 €', '24 €', '30 €', '12 €'],
      answer: 1,
      explanation: '6:5 signifie 6 pour 5 misés : 20 × 1,2 = 24 €. Vous perdez 6 € par blackjack par rapport au 3:2.',
    },
    {
      question: 'Pourquoi le blackjack payé 6:5 est-il à fuir ?',
      choices: [
        'Parce que le croupier tire sur soft 17',
        'Parce qu\'il augmente l\'avantage de la maison d\'environ 1,4 %',
        'Parce qu\'on ne peut plus doubler',
        'Parce qu\'il est interdit de compter les cartes',
      ],
      answer: 1,
      explanation: 'Un blackjack survient ≈ 4,75 % du temps ; le 6:5 retire 0,3 mise à chaque fois : 4,75 % × 0,3 ≈ 1,4 % de chaque mise.',
    },
    {
      question: 'Le croupier montre un As. Quelle est l\'espérance de l\'assurance sans comptage dans un sabot de 6 jeux ?',
      choices: ['Environ +4 %', 'Exactement 0', 'Environ −7 %', 'Environ −50 %'],
      answer: 2,
      explanation: 'Environ 31 % des cartes restantes sont des 10. EV = 3p − 1 ≈ 3 × 0,311 − 1 ≈ −6,8 % de la somme assurée.',
    },
    {
      question: 'À partir de quelle proportion de 10 dans les cartes restantes l\'assurance devient-elle rentable ?',
      choices: ['Plus de 25 %', 'Plus de 1/3', 'Plus de 50 %', 'Jamais'],
      answer: 1,
      explanation: 'L\'assurance paie 2:1 : elle est rentable si 2p > 1 − p, soit p > 1/3.',
    },
    {
      question: 'Que signifie « H17 » ?',
      choices: [
        'Le joueur doit tirer jusqu\'à 17',
        'Le croupier tire sur soft 17',
        'Le croupier reste sur tous les 17',
        'On peut doubler jusqu\'à 17',
      ],
      answer: 1,
      explanation: 'H17 = « Hit soft 17 » : le croupier tire sur A + 6. C\'est défavorable au joueur (≈ +0,22 % pour le casino).',
    },
    {
      question: 'Que se passe-t-il quand le joueur et le croupier sautent tous les deux ?',
      choices: ['Égalité', 'Le joueur gagne', 'Le joueur perd', 'La main est rejouée'],
      answer: 2,
      explanation: 'Le joueur joue en premier : dès qu\'il saute, sa mise est perdue, avant même que le croupier joue. C\'est la source principale de l\'avantage du casino.',
    },
    {
      question: 'Quelle règle n\'a aucun effet sur l\'avantage de la maison face à un joueur de stratégie de base, mais est cruciale pour le compteur ?',
      choices: ['Le DAS', 'La pénétration', 'Le paiement 3:2', 'L\'abandon tardif'],
      answer: 1,
      explanation: 'La pénétration ne change pas l\'espérance d\'un joueur non compteur. Mais plus elle est profonde, plus le true count prend des valeurs extrêmes, ce qui permet au compteur de miser gros au bon moment.',
    },
    {
      question: 'Vous séparez une paire d\'As et recevez un Roi sur le premier As. Que vaut cette main ?',
      choices: ['Blackjack payé 3:2', '21, payé 1:1', 'Soft 11', 'La main est annulée'],
      answer: 1,
      explanation: 'Après séparation, As + 10 n\'est pas un blackjack : c\'est un 21 ordinaire, payé 1:1.',
    },
    {
      question: 'Combien de cartes de valeur 10 compte un jeu de 52 cartes ?',
      choices: ['4', '12', '16', '20'],
      answer: 2,
      explanation: '10, Valet, Dame, Roi dans 4 couleurs : 4 × 4 = 16 cartes, soit environ 30,8 % du jeu.',
    },
    {
      question: 'Que fait l\'abandon tardif (late surrender) ?',
      choices: [
        'Il permet de récupérer toute sa mise',
        'Il permet de récupérer la moitié de sa mise après la vérification du blackjack du croupier',
        'Il permet d\'abandonner après avoir tiré une carte',
        'Il annule l\'assurance',
      ],
      answer: 1,
      explanation: 'Sur ses deux premières cartes, le joueur renonce à la main et récupère la moitié de sa mise. « Tardif » : uniquement après que le croupier a vérifié qu\'il n\'a pas blackjack.',
    },
  ],
};
