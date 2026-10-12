import type { CourseModule } from './types';

export const module9: CourseModule = {
  id: 9,
  slug: 'aller-plus-loin',
  title: 'Aller plus loin',
  subtitle: 'Autres systèmes : KO, Omega II, Zen (module optionnel)',
  duration: '45 min',
  optional: true,
  objectives: [
    'Connaître les critères de comparaison des systèmes (BC, PE, IC).',
    'Comprendre la différence entre système équilibré et non équilibré.',
    'Découvrir KO, Omega II et Zen, avec leurs avantages et inconvénients.',
    'Savoir pourquoi le Hi-Lo reste un excellent choix en sabot.',
  ],
  sections: [
    {
      id: 'criteres',
      title: 'Comment comparer des systèmes',
      blocks: [
        {
          type: 'list',
          items: [
            '**Corrélation de mise (BC, *Betting Correlation*)** : à quel point le compte reflète l\'avantage réel. Elle détermine l\'efficacité de la variation de mise — la plus importante en sabot.',
            '**Efficacité de jeu (PE, *Playing Efficiency*)** : à quel point le compte permet de bien choisir les déviations. Plus importante en jeu simple ou double.',
            '**Corrélation d\'assurance (IC)** : précision de la décision d\'assurance.',
            '**Niveau** : valeur absolue maximale attribuée à une carte. Niveau 1 (±1) = simple ; niveau 2 (±2) = plus précis, plus difficile.',
            '**Équilibré ou non** : un système équilibré totalise 0 sur un jeu et nécessite la conversion en true count ; un système non équilibré évite cette conversion.',
          ],
        },
        { type: 'widget', id: 'systems-table' },
        {
          type: 'p',
          text: 'Valeurs couramment citées (sources : Griffin, Snyder, Wong). Les écarts de performance réelle entre ces systèmes sont **faibles** en sabot (de l\'ordre de 5 à 10 % de gain en plus), alors que la difficulté et le risque d\'erreur augmentent nettement avec le niveau.',
        },
      ],
    },
    {
      id: 'ko',
      title: 'KO (Knock-Out)',
      blocks: [
        {
          type: 'p',
          text: "Publié par Ken Fuchs et Olaf Vancura (*Knock-Out Blackjack*, 1998). Identique au Hi-Lo, sauf que le **7 vaut +1**. Le jeu totalise alors **+4** : le système est **non équilibré**.",
        },
        {
          type: 'list',
          items: [
            "**Compte initial** (IRC) : on démarre à 4 − 4 × (nombre de jeux), par exemple **−20** pour 6 jeux, afin d'atteindre un « point clé » (*key count*) fixe.",
            '**Pas de conversion en true count** : on mise plus quand le running count dépasse le point clé (souvent proche de −4 à +2 selon le nombre de jeux).',
            '**Avantages** : plus simple en jeu réel (pas de division, pas d\'estimation de défausse), BC excellent.',
            '**Inconvénients** : moins précis pour les déviations (indices au running count) ; démarrer à −20 n\'est pas toujours naturel.',
          ],
        },
      ],
    },
    {
      id: 'omega',
      title: 'Omega II',
      blocks: [
        {
          type: 'p',
          text: "Système de **niveau 2** proposé par Bryce Carlson (*Blackjack for Blood*). Valeurs : 2, 3, 7 = +1 ; 4, 5, 6 = +2 ; 9 = −1 ; 10 = −2 ; **As = 0**, 8 = 0. Équilibré.",
        },
        {
          type: 'list',
          items: [
            '**Avantages** : excellente efficacité de jeu (PE ≈ 0,67) grâce à des valeurs plus fines.',
            '**Inconvénients** : l\'As étant compté 0, il faut un **compte annexe des As** (*side count*) pour bien miser, ce qui est exigeant ; plus d\'erreurs de comptage.',
            'Intéressant surtout en jeu simple ou double, où les déviations ont plus de poids.',
          ],
        },
      ],
    },
    {
      id: 'zen',
      title: 'Zen Count',
      blocks: [
        {
          type: 'p',
          text: "Système de **niveau 2** d'Arnold Snyder (*Blackbelt in Blackjack*). Valeurs : 2, 3, 7 = +1 ; 4, 5, 6 = +2 ; 8, 9 = 0 ; 10 = −2 ; **As = −1**. Équilibré.",
        },
        {
          type: 'list',
          items: [
            '**Avantages** : bon compromis entre corrélation de mise et efficacité de jeu, sans compte annexe des As.',
            '**Inconvénients** : niveau 2 (plus lent, plus d\'erreurs) ; conversion en true count nécessaire (souvent par demi-jeu ou par quart de jeu).',
          ],
        },
      ],
    },
    {
      id: 'choisir',
      title: 'Quel système choisir ?',
      blocks: [
        {
          type: 'callout',
          tone: 'success',
          title: 'Recommandation',
          text: "En sabot, le **Hi-Lo** reste le meilleur rapport efficacité / difficulté. Un compte Hi-Lo **juste** rapporte plus qu'un compte de niveau 2 avec quelques erreurs. Si la conversion en true count vous pose problème, le **KO** est une excellente alternative. Les systèmes de niveau 2 ne se justifient que pour les joueurs très expérimentés, ou en jeu simple/double.",
        },
        {
          type: 'p',
          text: 'Pour aller plus loin : *Professional Blackjack* (Stanford Wong), *Blackjack Attack* (Don Schlesinger), *The Theory of Blackjack* (Peter Griffin), *Beat the Dealer* (Edward O. Thorp), ainsi que des logiciels de simulation comme CVCX ou CVData pour étudier vos conditions précises.',
        },
      ],
    },
  ],
  keyPoints: [
    'BC (mise), PE (jeu), IC (assurance) : trois mesures de la qualité d\'un système.',
    'Système équilibré = conversion en true count ; non équilibré (KO) = point clé sur le running count.',
    'KO : Hi-Lo avec le 7 à +1, pas de conversion, très pratique.',
    'Omega II et Zen : niveau 2, plus précis, plus difficiles ; Omega II demande un compte annexe des As.',
    'En sabot, le gain supplémentaire des systèmes complexes est faible : la justesse prime.',
  ],
  mistakes: [
    { mistake: 'Changer de système dès qu\'on maîtrise le Hi-Lo « pour gagner plus ».', fix: 'Le gain est marginal en sabot ; le coût d\'apprentissage et le risque d\'erreurs sont élevés.' },
    { mistake: 'Convertir le KO en true count.', fix: 'Le KO s\'utilise directement au running count, avec un point clé.' },
    { mistake: 'Utiliser des indices Hi-Lo avec un autre système.', fix: 'Chaque système a ses propres indices.' },
  ],
  exercises: [{ id: 'card-stream', title: 'Défilé de cartes', goal: 'Maintenez votre niveau en Hi-Lo.' }],
  quiz: [
    { question: 'Que vaut le 7 dans le système KO ?', choices: ['0', '+1', '−1', '+2'], answer: 1, explanation: 'C\'est la seule différence avec le Hi-Lo, qui rend le système non équilibré (+4 par jeu).' },
    { question: 'Le KO nécessite-t-il une conversion en true count ?', choices: ['Oui', 'Non'], answer: 1, explanation: 'Non : c\'est son principal avantage. On compare le running count à un point clé.' },
    { question: 'Combien totalise un jeu complet en KO ?', choices: ['0', '+4', '−4', '+2'], answer: 1, explanation: 'Les quatre 7 valent +1 : le jeu totalise +4.' },
    { question: 'Que mesure la corrélation de mise (BC) ?', choices: ['La vitesse de comptage', 'La qualité du compte pour dimensionner la mise', 'Le nombre de jeux', 'La pénétration'], answer: 1, explanation: 'C\'est la corrélation entre les valeurs du système et les effets de retrait réels des cartes.' },
    { question: 'Quel système compte l\'As à 0 et recommande un compte annexe des As ?', choices: ['Hi-Lo', 'KO', 'Omega II', 'Zen'], answer: 2, explanation: 'Omega II neutralise l\'As pour améliorer l\'efficacité de jeu, d\'où le compte annexe pour la mise.' },
    { question: 'Qu\'est-ce qu\'un système de niveau 2 ?', choices: ['Un système à deux comptes', 'Un système où certaines cartes valent ±2', 'Un système pour 2 jeux', 'Un système pour 2 joueurs'], answer: 1, explanation: 'Le niveau est la valeur absolue maximale attribuée à une carte.' },
    { question: 'En sabot, quel critère est le plus important ?', choices: ['L\'efficacité de jeu (PE)', 'La corrélation de mise (BC)', 'La corrélation d\'assurance', 'Le niveau'], answer: 1, explanation: 'En sabot, le gain vient surtout de la variation de mise : la BC prime.' },
    { question: 'Quelle est la valeur de l\'As dans le Zen Count ?', choices: ['0', '−1', '−2', '+1'], answer: 1, explanation: 'Zen : As = −1, 10 = −2.' },
    { question: 'Pourquoi le Hi-Lo reste-t-il recommandé ?', choices: ['Il est le plus précis', 'Il offre le meilleur compromis précision / simplicité, et la justesse prime', 'Il est le seul autorisé', 'Il ne nécessite pas de calcul'], answer: 1, explanation: 'Un compte simple et juste rapporte plus qu\'un compte complexe avec des erreurs.' },
    { question: 'Quel est le compte initial habituel du KO pour 6 jeux ?', choices: ['0', '−20', '+4', '−4'], answer: 1, explanation: 'IRC = 4 − 4 × 6 = −20.' },
  ],
};
