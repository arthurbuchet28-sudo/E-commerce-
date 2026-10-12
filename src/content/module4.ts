import type { CourseModule } from './types';

export const module4: CourseModule = {
  id: 4,
  slug: 'hi-lo',
  title: 'Le système Hi-Lo',
  subtitle: 'Compter vite et juste : le running count',
  duration: '1 h de cours + plusieurs semaines d\'entraînement',
  objectives: [
    'Connaître par cœur les valeurs Hi-Lo des 13 rangs.',
    'Tenir un running count exact pendant tout un sabot.',
    'Compter par paires et par groupes de cartes qui s\'annulent.',
    'Compter un jeu complet de 52 cartes en moins de 25 secondes, sans erreur.',
  ],
  sections: [
    {
      id: 'valeurs',
      title: 'Les valeurs Hi-Lo',
      blocks: [
        {
          type: 'table',
          headers: ['Cartes', 'Valeur', 'Catégorie', 'Par jeu'],
          rows: [
            ['2, 3, 4, 5, 6', '**+1**', 'Basses (favorables au croupier)', '20 cartes'],
            ['7, 8, 9', '**0**', 'Neutres', '12 cartes'],
            ['10, V, D, R, As', '**−1**', 'Hautes (favorables au joueur)', '20 cartes'],
          ],
        },
        {
          type: 'cards',
          cards: ['2♥', '3♣', '4♦', '5♠', '6♥', '7♣', '8♦', '9♠', '10♥', 'J♣', 'Q♦', 'K♠', 'A♥'],
          caption: '+1 +1 +1 +1 +1 | 0 0 0 | −1 −1 −1 −1 −1',
        },
        {
          type: 'p',
          text: "Logique : quand une **petite carte sort**, le sabot restant s'enrichit en grosses cartes, ce qui est bon pour vous : **+1**. Quand une **grosse carte sort**, le sabot s'appauvrit : **−1**.",
        },
      ],
    },
    {
      id: 'equilibre',
      title: 'Un système équilibré',
      blocks: [
        {
          type: 'p',
          text: 'Un jeu contient 20 cartes à +1 et 20 cartes à −1 : la somme d\'un jeu complet vaut **0**. On dit que le Hi-Lo est **équilibré**. Conséquences :',
        },
        {
          type: 'list',
          items: [
            'On démarre chaque sabot à **0** après le mélange.',
            'Si vous comptez tout un sabot sans erreur, vous finissez à 0 : c\'est un excellent auto-contrôle.',
            'Un compte positif signifie qu\'il reste plus de cartes hautes que basses ; un compte négatif, l\'inverse.',
            'Le Hi-Lo est un système de **niveau 1** : toutes les valeurs valent −1, 0 ou +1.',
          ],
        },
      ],
    },
    {
      id: 'running',
      title: 'Le running count',
      blocks: [
        {
          type: 'p',
          text: "Le **running count** (RC, « compte courant ») est la somme des valeurs de toutes les cartes vues depuis le mélange. Vous le mettez à jour à chaque carte retournée : les vôtres, celles des autres joueurs, et celles du croupier (sa carte cachée dès qu'il la retourne).",
        },
        {
          type: 'example',
          title: 'Exemple pas à pas',
          lines: [
            'Cartes vues : 5, K, 2, 9, 3, A, 6, 8, Q',
            '5 → +1 · K → 0 · 2 → +1 · 9 → +1 · 3 → +2 · A → +1 · 6 → +2 · 8 → +2 · Q → **+1**',
            'Running count final : **+1**.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Dites le compte, pas les cartes',
          text: "Ne vous dites pas « cinq, plus un ». Voyez la carte et mettez à jour **un seul nombre** dans votre tête. Avec l'entraînement, les cartes neutres deviennent invisibles et les autres font « monter » ou « descendre » le compte sans verbalisation.",
        },
      ],
    },
    {
      id: 'paires',
      title: 'Compter par paires qui s\'annulent',
      blocks: [
        {
          type: 'p',
          text: "Les joueurs expérimentés ne comptent pas carte par carte. Ils regardent les cartes **deux par deux** (ou par mains entières) et **annulent** une carte haute avec une carte basse.",
        },
        {
          type: 'table',
          headers: ['Combinaison', 'Valeur', 'Réflexe'],
          rows: [
            ['Haute + basse (ex. K + 5)', '0', 'Annulation : on ignore'],
            ['Haute + neutre (ex. 10 + 8)', '−1', 'Une haute'],
            ['Basse + neutre (ex. 4 + 9)', '+1', 'Une basse'],
            ['Deux basses (ex. 3 + 6)', '+2', ''],
            ['Deux hautes (ex. A + Q)', '−2', ''],
            ['Deux neutres (ex. 7 + 9)', '0', 'Invisible'],
          ],
        },
        {
          type: 'example',
          title: 'Lire une main entière',
          lines: [
            'Main du joueur : 10, 6 → annulation → **0**.',
            'Main du joueur : 4, 3, 10 → 4 et 10 s\'annulent, reste le 3 → **+1**.',
            'Main du croupier : K, 7, A → **−2**.',
            'Total de la table : 0 + 1 − 2 = **−1** à ajouter au running count.',
          ],
        },
        {
          type: 'p',
          text: "Repérez aussi les **totaux fréquents** : une main de 20 en deux cartes (deux hautes) vaut toujours −2 ; un blackjack vaut −2 ; une main sautée « 10 + 6 + 10 » vaut −1.",
        },
      ],
    },
    {
      id: 'entrainement',
      title: 'Programme d\'entraînement',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            '**Défilé lent** (1 carte/s) : visez 100 % de justesse.',
            "**Compte à rebours d'un jeu** : retirez une carte au hasard, comptez les 51 autres. Le compte final indique la catégorie de la carte manquante (+1 si une haute manque, −1 si une basse manque, 0 si neutre). Objectif : **moins de 25 secondes**, sans erreur.",
            '**Paires et groupes** : comptez 2, puis 3, puis 4 cartes à la fois.',
            '**Défilé rapide** (2-3 cartes/s) : la vitesse d\'une vraie table avec plusieurs joueurs.',
            '**Simulateur avec 3-5 joueurs virtuels** et le compte masqué.',
          ],
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Pourquoi le jeu à rebours fonctionne',
          text: 'Un jeu complet vaut 0. Si une carte de valeur v manque, les 51 autres totalisent −v. Exemple : un 10 manque (v = −1) → les 51 cartes totalisent **+1**. Une erreur de comptage se voit donc immédiatement.',
        },
        {
          type: 'p',
          text: "Entraînez-vous **tous les jours**, par séances courtes (10 à 15 minutes). La régularité compte plus que la durée. La précision passe toujours avant la vitesse.",
        },
      ],
    },
  ],
  keyPoints: [
    '2 à 6 = +1 ; 7, 8, 9 = 0 ; 10, figures et As = −1.',
    'Le Hi-Lo est équilibré : un jeu complet totalise 0, on démarre chaque sabot à 0.',
    'Le running count est la somme de toutes les cartes vues depuis le mélange.',
    'On compte toutes les cartes visibles, y compris celles des autres joueurs et la carte cachée du croupier quand elle est retournée.',
    'Compter par paires : une haute et une basse s\'annulent.',
    'Objectif : un jeu complet en moins de 25 secondes, sans erreur.',
  ],
  mistakes: [
    { mistake: 'Compter la carte cachée du croupier avant qu\'elle ne soit retournée.', fix: 'On ne compte que ce que l\'on voit, au moment où on le voit.' },
    { mistake: 'Oublier les cartes des joueurs qui sautent ou abandonnent (ramassées vite par le croupier).', fix: 'Comptez les cartes dès qu\'elles sont distribuées, pas au moment du paiement.' },
    { mistake: 'Oublier de remettre le compte à 0 au mélange.', fix: 'Chaque nouveau sabot démarre à 0.' },
    { mistake: 'Vouloir aller vite avant d\'être juste.', fix: 'Une erreur de compte coûte plus cher qu\'un compte lent. Gagnez la précision, la vitesse suit.' },
    { mistake: 'Compter l\'As comme neutre (par confusion avec d\'autres systèmes).', fix: 'En Hi-Lo, l\'As vaut −1.' },
  ],
  exercises: [
    { id: 'card-stream', title: 'Défilé de cartes', goal: 'Running count exact à vitesse croissante.' },
    { id: 'deck-countdown', title: 'Compte à rebours d\'un jeu complet', goal: 'Moins de 25 secondes, catégorie correcte.' },
    { id: 'groups', title: 'Paires et groupes', goal: 'Compter 2, 3 puis 4 cartes d\'un coup d\'œil.' },
  ],
  quiz: [
    { question: 'Quelle est la valeur Hi-Lo d\'un 7 ?', choices: ['+1', '0', '−1', '+2'], answer: 1, explanation: '7, 8 et 9 sont neutres : 0.' },
    { question: 'Quelle est la valeur Hi-Lo d\'un As ?', choices: ['+1', '0', '−1', '−2'], answer: 2, explanation: 'L\'As est une carte haute : −1.' },
    { question: 'Quelle est la valeur Hi-Lo d\'un 6 ?', choices: ['+1', '0', '−1', '+2'], answer: 0, explanation: '2 à 6 valent +1.' },
    {
      question: 'Cartes vues : 2, K, 5, 8, 4, A. Running count ?',
      choices: ['+1', '0', '+2', '−1'],
      answer: 0,
      explanation: '2 (+1), K (−1), 5 (+1), 8 (0), 4 (+1), A (−1) : +1.',
    },
    {
      question: 'Cartes vues : 10, J, 3, 9, Q, 6, A. Running count ?',
      choices: ['−1', '−2', '+1', '−3'],
      answer: 1,
      explanation: '10 (−1), J (−2), 3 (−1), 9 (−1), Q (−2), 6 (−1), A (−2).',
    },
    {
      question: 'Que vaut un jeu complet de 52 cartes en Hi-Lo ?',
      choices: ['+4', '0', '−4', '+20'],
      answer: 1,
      explanation: '20 cartes à +1, 20 à −1, 12 à 0 : le système est équilibré.',
    },
    {
      question: 'Dans l\'exercice du jeu à rebours, vos 51 cartes totalisent −1. Quelle catégorie de carte manque ?',
      choices: ['Une carte haute', 'Une carte neutre', 'Une carte basse', 'Impossible à savoir'],
      answer: 2,
      explanation: 'Le jeu complet vaut 0. Si les 51 cartes valent −1, la carte manquante vaut +1 : c\'est une basse (2 à 6).',
    },
    {
      question: 'La main K + 5 vaut :',
      choices: ['+1', '0', '−1', '+2'],
      answer: 1,
      explanation: 'Une haute et une basse s\'annulent.',
    },
    {
      question: 'Le running count est de +4. Il sort : 3, 3, 10, 7. Nouveau running count ?',
      choices: ['+5', '+4', '+6', '+3'],
      answer: 0,
      explanation: '+4 + 1 + 1 − 1 + 0 = +5.',
    },
    {
      question: 'Que fait-on du running count au mélange ?',
      choices: ['On le garde', 'On le remet à 0', 'On le divise par 2', 'On le remet à +4'],
      answer: 1,
      explanation: 'Après le mélange, toutes les cartes sont de retour : on repart de 0.',
    },
    {
      question: 'Un blackjack (As + Dame) vaut en Hi-Lo :',
      choices: ['0', '−1', '−2', '+2'],
      answer: 2,
      explanation: 'Deux cartes hautes : −2.',
    },
    {
      question: 'Quand compte-t-on la carte cachée du croupier ?',
      choices: [
        'Jamais',
        'Dès la distribution',
        'Au moment où le croupier la retourne',
        'Seulement si c\'est un As',
      ],
      answer: 2,
      explanation: 'On ne compte que les cartes visibles ; la carte cachée l\'est au moment où elle est révélée.',
    },
  ],
};
