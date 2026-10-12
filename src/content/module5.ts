import type { CourseModule } from './types';

export const module5: CourseModule = {
  id: 5,
  slug: 'true-count',
  title: 'Le true count',
  subtitle: 'Convertir le running count en mesure de l\'avantage',
  duration: '1 h + entraînement',
  objectives: [
    'Comprendre pourquoi le running count seul ne suffit pas en sabot.',
    'Calculer le true count : running count ÷ jeux restants.',
    'Estimer visuellement les jeux joués dans le bac de défausse, au demi-jeu près.',
    'Connaître les conventions d\'arrondi (plancher, troncature).',
    'Relier le true count à l\'avantage du joueur (≈ +0,5 % par point).',
  ],
  sections: [
    {
      id: 'pourquoi',
      title: 'Pourquoi le running count ne suffit pas',
      blocks: [
        {
          type: 'p',
          text: "Un running count de +6 signifie qu'il reste 6 cartes hautes « en trop » dans le sabot. Mais leur **effet dépend du nombre de cartes restantes** :",
        },
        {
          type: 'example',
          title: 'Même running count, situations très différentes',
          lines: [
            'RC = +6 avec **6 jeux** restants : 6 cartes hautes de trop noyées dans 312 cartes → effet faible (+1 par jeu).',
            'RC = +6 avec **1 jeu** restant : 6 cartes hautes de trop dans 52 cartes → sabot très riche (+6 par jeu).',
          ],
        },
        {
          type: 'p',
          text: "Le **true count** (TC, « compte réel ») mesure la richesse **par jeu restant** : c'est la densité des cartes hautes en excès.",
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'La formule',
          text: '**True count = Running count ÷ Nombre de jeux restants**. Exemple : RC = +9, 3 jeux restants → TC = +3.',
        },
      ],
    },
    {
      id: 'estimer',
      title: 'Estimer les jeux restants avec le bac de défausse',
      blocks: [
        {
          type: 'p',
          text: "On ne compte pas les cartes une à une : on **regarde le bac de défausse** (*discard tray*), où le croupier range les cartes jouées. On estime combien de jeux il contient, puis :",
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Jeux restants',
          text: '**Jeux restants = Jeux du sabot − Jeux dans la défausse**. Avec 6 jeux et 2,5 jeux en défausse : 3,5 jeux restants.',
        },
        {
          type: 'list',
          items: [
            'Un jeu de 52 cartes fait environ **1,5 à 1,8 cm** d\'épaisseur. Repérez la hauteur d\'un jeu dans le bac de votre casino (souvent des repères sont visibles).',
            'Estimez au **demi-jeu** près en sabot (6-8 jeux). En double jeu, on estime au quart ou au demi-jeu.',
            'Pensez à ajouter les cartes **sur la table** de la main en cours si vous convertissez en milieu de main (pour l\'assurance ou une déviation).',
            'Entraînez-vous avec de vraies cartes : empilez 1, 2, 3… jeux et observez.',
          ],
        },
        { type: 'widget', id: 'discard-demo' },
      ],
    },
    {
      id: 'arrondi',
      title: 'Arrondir le true count',
      blocks: [
        {
          type: 'p',
          text: 'La division donne rarement un entier. Plusieurs conventions existent ; **l\'important est d\'utiliser celle avec laquelle vos indices ont été calculés**.',
        },
        {
          type: 'table',
          headers: ['Méthode', 'RC +7 / 2 jeux (3,5)', 'RC −3 / 2 jeux (−1,5)', 'Usage'],
          rows: [
            ['**Plancher** (arrondi vers le bas)', '+3', '−2', 'Convention de cette formation ; usuelle pour les indices Hi-Lo de sabot'],
            ['**Troncature** (on supprime la décimale)', '+3', '−1', 'Simple de tête ; utilisée par certains auteurs'],
            ['Arrondi au plus proche', '+4', '−1 ou −2', 'Plus précis, mais incompatible avec certains indices'],
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Convention retenue ici',
          text: "Dans toute cette formation, le true count est **arrondi à l'entier inférieur** (plancher), et une déviation d'indice +3 s'applique quand **TC ≥ +3**. Pour les comptes positifs, plancher et troncature donnent le même résultat ; ils ne diffèrent que pour les comptes négatifs.",
        },
        {
          type: 'p',
          text: 'Pour **miser**, la précision au point près suffit. Pour une **déviation** proche de son indice, prenez le temps de bien estimer : c\'est là que l\'arrondi compte.',
        },
      ],
    },
    {
      id: 'avantage',
      title: 'True count et avantage du joueur',
      blocks: [
        {
          type: 'p',
          text: "Règle empirique pour le Hi-Lo : **chaque point de true count ajoute environ 0,5 % à l'avantage du joueur**. On part de l'avantage de la maison « au départ » (TC 0) :",
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Avantage du joueur (≈)',
          text: '**Avantage ≈ −(avantage de la maison) + 0,5 % × TC**. Avec la configuration de référence (≈ 0,34 % pour la maison) : TC +1 → ≈ +0,16 % ; TC +2 → ≈ +0,66 % ; TC +4 → ≈ +1,66 %.',
        },
        { type: 'widget', id: 'edge-table' },
        {
          type: 'list',
          items: [
            'Le joueur passe en positif vers **TC +1** : c\'est là qu\'on commence à augmenter la mise.',
            'Avec une table H17 (≈ 0,56 % pour la maison), il faut TC ≈ +1,2 pour être à l\'équilibre.',
            'Cette relation est une **moyenne** ; elle est un peu moins forte aux comptes très élevés et dépend des règles.',
          ],
        },
      ],
    },
    {
      id: 'exemples',
      title: 'Exemples complets',
      blocks: [
        {
          type: 'example',
          title: 'Sabot de 6 jeux',
          lines: [
            'Défausse : environ 2 jeux → 4 jeux restants. Running count : +10.',
            'TC = 10 ÷ 4 = 2,5 → **TC +2** (plancher).',
            'Avantage ≈ −0,34 + 2 × 0,5 = **+0,66 %**. On augmente la mise.',
          ],
        },
        {
          type: 'example',
          title: 'Compte négatif',
          lines: [
            'Défausse : 1,5 jeu → 4,5 jeux restants. Running count : −7.',
            'TC = −7 ÷ 4,5 ≈ −1,56 → **TC −2** (plancher) ou −1 (troncature).',
            'Avantage nettement négatif : mise minimale, voire quitter la table (Wonging, module 6).',
          ],
        },
        {
          type: 'example',
          title: 'Fin de sabot',
          lines: [
            'Défausse : 4,5 jeux → 1,5 jeu restant. Running count : +6.',
            'TC = 6 ÷ 1,5 = **+4**. Avantage ≈ +1,66 % : mise maximale de votre rampe.',
          ],
        },
        {
          type: 'p',
          text: 'Astuce de calcul mental : diviser par 1,5 revient à multiplier par 2/3 ; diviser par 2,5 revient à multiplier par 0,4 ; diviser par 0,5 revient à doubler.',
        },
      ],
    },
  ],
  keyPoints: [
    'True count = running count ÷ jeux restants.',
    'Jeux restants = jeux du sabot − jeux dans la défausse (estimés au demi-jeu).',
    'Plus le sabot avance, plus un même running count « pèse » lourd.',
    'Convention de cette formation : arrondi à l\'entier inférieur (plancher).',
    'Chaque point de TC ≈ +0,5 % d\'avantage ; le joueur est à l\'équilibre vers TC +1.',
    'Le TC sert à la fois à dimensionner la mise et à décider des déviations.',
  ],
  mistakes: [
    { mistake: 'Diviser par les jeux joués (défausse) au lieu des jeux restants.', fix: 'Jeux restants = total − défausse. Avec 6 jeux et 2 en défausse, on divise par 4.' },
    { mistake: 'Miser selon le running count en sabot.', fix: 'Seul le true count reflète l\'avantage en jeu à plusieurs jeux.' },
    { mistake: 'Oublier les cartes de la main en cours lors d\'une conversion en milieu de main.', fix: 'Elles ne sont pas encore dans la défausse : retirez-les mentalement des jeux restants.' },
    { mistake: 'Changer de convention d\'arrondi en cours de route.', fix: 'Utilisez toujours la même convention que vos indices (ici : plancher).' },
    { mistake: 'Perdre le running count pendant la conversion.', fix: 'Le running count reste la donnée à mémoriser ; le TC se recalcule quand on en a besoin (avant la mise, avant une décision).' },
  ],
  exercises: [
    { id: 'true-count', title: 'Conversion en true count', goal: 'Réponse juste en moins de 4 secondes.' },
    { id: 'discard', title: 'Estimation de la défausse', goal: 'Erreur maximale d\'un demi-jeu.' },
  ],
  quiz: [
    { question: 'RC = +8, 4 jeux restants. TC ?', choices: ['+1', '+2', '+4', '+32'], answer: 1, explanation: '8 ÷ 4 = +2.' },
    { question: 'RC = +9, 2 jeux restants. TC (plancher) ?', choices: ['+4', '+5', '+4,5', '+3'], answer: 0, explanation: '9 ÷ 2 = 4,5 → plancher +4.' },
    { question: 'RC = −5, 2 jeux restants. TC (plancher) ?', choices: ['−2', '−3', '−2,5', '+2'], answer: 1, explanation: '−5 ÷ 2 = −2,5 → l\'entier inférieur est −3 (la troncature donnerait −2).' },
    {
      question: 'Sabot de 6 jeux, 2 jeux dans la défausse, RC = +8. TC ?',
      choices: ['+4', '+2', '+1,3', '+8'],
      answer: 1,
      explanation: 'Jeux restants = 6 − 2 = 4 ; 8 ÷ 4 = +2.',
    },
    {
      question: 'Sabot de 8 jeux, 5 jeux dans la défausse, RC = +9. TC ?',
      choices: ['+1', '+3', '+1,8', '+9'],
      answer: 1,
      explanation: 'Jeux restants = 3 ; 9 ÷ 3 = +3.',
    },
    {
      question: 'RC = +3, 0,5 jeu restant. TC ?',
      choices: ['+1,5', '+3', '+6', '+0,5'],
      answer: 2,
      explanation: 'Diviser par 0,5 revient à multiplier par 2 : +6.',
    },
    {
      question: 'Avantage approximatif du joueur à TC +3 (maison 0,34 % à TC 0) ?',
      choices: ['+3 %', '+1,16 %', '+0,34 %', '−0,34 %'],
      answer: 1,
      explanation: '−0,34 + 3 × 0,5 = +1,16 %.',
    },
    {
      question: 'Vers quel true count le joueur passe-t-il à l\'équilibre (configuration de référence) ?',
      choices: ['TC 0', 'TC +1', 'TC +3', 'TC +5'],
      answer: 1,
      explanation: 'Il faut compenser ≈ 0,34 % : à 0,5 % par point, l\'équilibre est atteint vers +0,7, soit TC +1 en pratique.',
    },
    {
      question: 'Pourquoi convertir en true count ?',
      choices: [
        'Parce que le running count est trop difficile à retenir',
        'Parce que l\'effet d\'un excès de cartes hautes dépend du nombre de cartes restantes',
        'Parce que le casino l\'exige',
        'Pour savoir quelle est la prochaine carte',
      ],
      answer: 1,
      explanation: '+6 cartes hautes en excès sur 6 jeux, c\'est peu ; sur 1 jeu, c\'est énorme. Le TC mesure la densité.',
    },
    {
      question: 'Avec la convention plancher, RC = +5 et 2 jeux restants donne TC = +2. Avec la troncature ?',
      choices: ['+2', '+3', '+2,5', '+1'],
      answer: 0,
      explanation: 'Pour un compte positif, plancher et troncature donnent la même chose : +2.',
    },
    {
      question: 'Comment estime-t-on les jeux restants à la table ?',
      choices: [
        'En comptant les cartes une à une',
        'En estimant les jeux dans le bac de défausse et en soustrayant du total',
        'En demandant au croupier',
        'En regardant la carte de coupe',
      ],
      answer: 1,
      explanation: 'La défausse est visible et facile à estimer au demi-jeu avec l\'entraînement.',
    },
    {
      question: 'RC = +7, 3,5 jeux restants. TC ?',
      choices: ['+1', '+2', '+3', '+3,5'],
      answer: 1,
      explanation: '7 ÷ 3,5 = +2 exactement.',
    },
  ],
};
