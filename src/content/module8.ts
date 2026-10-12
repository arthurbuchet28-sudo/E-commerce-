import type { CourseModule } from './types';

export const module8: CourseModule = {
  id: 8,
  slug: 'conditions-reelles',
  title: 'Le comptage en conditions réelles',
  subtitle: 'Vitesse, distractions, camouflage et réalité du métier',
  duration: '1 h + pratique',
  objectives: [
    'Atteindre la vitesse et la fiabilité nécessaires à une vraie table.',
    'Garder le compte malgré les distractions et la conversation.',
    'Adopter un comportement discret et une couverture crédible.',
    'Reconnaître les signes indiquant que le casino vous a repéré.',
    'Avoir des attentes réalistes : gains horaires modestes, forte variance.',
  ],
  sections: [
    {
      id: 'pret',
      title: 'Êtes-vous prêt ?',
      blocks: [
        {
          type: 'p',
          text: 'Avant de jouer de l\'argent réel, vous devriez valider **tous** les points suivants :',
        },
        {
          type: 'list',
          items: [
            'Stratégie de base : 100 % aux flash cards, sans hésitation.',
            'Un jeu de 52 cartes compté en **moins de 25 secondes**, sans erreur, plusieurs jours d\'affilée.',
            'Running count juste à la fin d\'un sabot complet au simulateur avec **5 joueurs virtuels**, compte masqué.',
            'Conversion en true count instantanée et estimation de la défausse à ±0,5 jeu.',
            'Assurance et Illustrious 18 sans erreur.',
            'Une bankroll dédiée, que vous pouvez perdre entièrement sans conséquence sur votre vie.',
          ],
        },
      ],
    },
    {
      id: 'vitesse',
      title: 'Vitesse et distractions',
      blocks: [
        {
          type: 'p',
          text: "À une table pleine, un croupier distribue 60 à 80 mains par heure, avec parfois plus de 20 cartes par main. Les cartes sont ramassées vite, surtout celles des joueurs qui sautent. Votre compte doit être **automatique**.",
        },
        {
          type: 'list',
          items: [
            '**Comptez par mains entières** : regardez la main d\'un joueur, faites les annulations, ajoutez le résultat.',
            '**Comptez les cartes dès leur arrivée**, pas au moment du paiement.',
            '**Ancrez le compte** : associez-le à un repère neutre (position des jetons, doigts posés sur la table) pour le retrouver après une interruption.',
            '**Parlez peu pendant la distribution**, mais parlez : un joueur muet et concentré est suspect. Répondez au croupier entre deux mains.',
            'Entraînez-vous avec de la musique, une télévision, une conversation : le casino est bruyant.',
            'Fatigue et alcool sont les premiers ennemis du compteur : jouez des sessions courtes (30 à 60 minutes) et ne buvez pas.',
          ],
        },
        {
          type: 'callout',
          tone: 'warning',
          title: 'Si vous perdez le compte',
          text: 'Ne devinez pas. Misez la mise minimale jusqu\'au prochain mélange, ou quittez la table. Un compte faux est pire que pas de compte.',
        },
      ],
    },
    {
      id: 'camouflage',
      title: 'Comportement à table et camouflage',
      blocks: [
        {
          type: 'p',
          text: 'Le comptage mental n\'est pas une triche, mais le casino est un lieu privé qui peut refuser votre jeu. Votre longévité dépend de votre discrétion.',
        },
        {
          type: 'list',
          items: [
            '**Variations de mise progressives** : montez par paliers sur plusieurs mains, idéalement après une main gagnée (« je laisse courir mes gains »).',
            '**Évitez les sauts brutaux** 1 → 8 unités et la redescente immédiate au minimum après le mélange : c\'est le signal n°1.',
            '**Après le mélange**, ne revenez pas brusquement à la mise minimale si vous étiez au maximum ; redescendez par étapes ou faites une pause.',
            '**Renoncez aux déviations les plus voyantes** (séparer des 10) quand la mise est grosse.',
            '**Ne fixez pas les cartes** : regardez-les naturellement, comme tout le monde. Ne bougez pas les lèvres.',
            '**Sessions courtes** et rotation des casinos et des équipes de croupiers.',
            "**Jouez le rôle du touriste** : réagissez aux gains et aux pertes, discutez, laissez un pourboire de temps en temps (c'est un coût, mais aussi une couverture).",
            '**Ne demandez jamais** des informations sur la pénétration ou les règles d\'un air expert.',
          ],
        },
      ],
    },
    {
      id: 'repere',
      title: 'Signes que le casino vous a repéré',
      blocks: [
        {
          type: 'list',
          items: [
            'Un responsable (*pit boss*) vient observer votre table, téléphone, ou parle au croupier en vous regardant.',
            'Le croupier **mélange plus tôt** quand vous augmentez votre mise (*preferential shuffling*), ou la carte de coupe est avancée.',
            'On vous demande votre carte de fidélité ou une pièce d\'identité de façon insistante.',
            'On vous impose une **mise à plat** (*flat betting*) : vous ne pouvez plus varier votre mise.',
            'On vous demande poliment de jouer à un autre jeu, ou de quitter le blackjack (*back-off*).',
            'On vous interdit l\'établissement.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Comment réagir',
          text: "Restez **courtois** et partez sans discuter. Ne niez pas et n'argumentez pas. Encaissez vos jetons et quittez l'établissement. Notez le casino et l'heure pour éviter d'y revenir trop tôt. Selon les pays, les règles d'interdiction et d'échange d'informations entre casinos varient.",
        },
      ],
    },
    {
      id: 'legal',
      title: 'Légalité et éthique',
      blocks: [
        {
          type: 'list',
          items: [
            'Compter **de tête** n\'est pas illégal dans la plupart des juridictions : vous utilisez simplement votre mémoire.',
            'Utiliser un **appareil** (téléphone, ordinateur, application) pour compter ou calculer à la table est interdit et peut constituer une infraction pénale.',
            'Les casinos peuvent **refuser** votre jeu ou votre présence. En France et en Europe, la plupart des tables utilisent la règle sans carte cachée (ENHC) et des mélangeurs : les opportunités sont rares.',
            'Le jeu peut créer une dépendance. Fixez des limites de temps et d\'argent. En France : **Joueurs Info Service, 09 74 75 13 13** (appel non surtaxé).',
          ],
        },
      ],
    },
    {
      id: 'realite',
      title: 'La réalité du métier',
      blocks: [
        {
          type: 'table',
          headers: ['Indicateur', 'Ordre de grandeur (6 jeux, rampe 1-8, 75 %)'],
          rows: [
            ['Avantage moyen', '≈ +0,5 % à +1 % de la mise moyenne'],
            ['Gain espéré', '≈ 0,7 à 1 unité par 100 mains'],
            ['Écart-type', '≈ 24 unités par 100 mains'],
            ['Unité de 25 €, 80 mains/h', 'gain espéré ≈ 15 à 20 €/h, écart-type ≈ 550 €/h'],
            ['Probabilité d\'être en perte après 100 h', '≈ 35 à 40 %'],
          ],
          caption: 'Ordres de grandeur calculés avec le module de gestion de mise de cette application (hors déviations).',
        },
        {
          type: 'p',
          text: "Le comptage de cartes est un **travail** : répétitif, solitaire, statistiquement ingrat à court terme, et soumis au bon vouloir des casinos. Les gains horaires sont modestes comparés à la variance. Peu de personnes en vivent. Pour la plupart, c'est un défi intellectuel passionnant et une excellente école de probabilités, de discipline et de gestion du risque.",
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Mesurez ce que vous contrôlez',
          text: 'Évaluez-vous sur la **justesse** (compte exact, décisions correctes, rampe respectée), jamais sur les gains d\'une session. Le simulateur en mode examen vous donne ce bilan.',
        },
      ],
    },
  ],
  keyPoints: [
    'Ne jouez de l\'argent réel qu\'après avoir validé tous les exercices (jeu en < 25 s, sabot complet juste avec 5 joueurs).',
    'Comptez par mains entières, dès l\'arrivée des cartes ; en cas de doute, mise minimale jusqu\'au mélange.',
    'Variez la mise progressivement, évitez les sauts brutaux et les déviations voyantes.',
    'Mélange anticipé, pit boss insistant, mise à plat imposée : vous êtes repéré, partez poliment.',
    'Compter de tête n\'est pas illégal, utiliser un appareil l\'est.',
    'Gains modestes (quelques dizaines d\'euros/h), variance énorme : jugez-vous sur la justesse.',
  ],
  mistakes: [
    { mistake: 'Fixer les cartes avec intensité et rester muet.', fix: 'Adoptez une attitude détendue de joueur ordinaire, discutez un peu.' },
    { mistake: 'Jouer fatigué ou après avoir bu.', fix: 'Sessions courtes, lucidité totale, eau uniquement.' },
    { mistake: 'Continuer à « deviner » après avoir perdu le compte.', fix: 'Mise minimale jusqu\'au mélange, ou départ.' },
    { mistake: 'Discuter ou protester lors d\'un back-off.', fix: 'Restez poli, partez. Une scène ne fait qu\'attirer l\'attention.' },
    { mistake: 'Considérer le comptage comme un revenu garanti.', fix: 'C\'est une espérance faible avec une très forte variance. Prévoyez des pertes longues.' },
  ],
  exercises: [
    { id: 'simulator', title: 'Simulateur en mode examen, 5 joueurs', goal: 'Compte juste à chaque vérification, zéro erreur de décision.' },
    { id: 'deck-countdown', title: 'Compte à rebours d\'un jeu', goal: 'Moins de 25 s, plusieurs jours de suite.' },
    { id: 'card-stream', title: 'Défilé de cartes, niveaux rapides', goal: 'Atteindre les niveaux 6 à 8.' },
  ],
  quiz: [
    {
      question: 'Vous perdez le compte au milieu d\'un sabot. Que faire ?',
      choices: ['Estimer au mieux et continuer', 'Miser le minimum jusqu\'au mélange (ou partir)', 'Miser le maximum', 'Demander au croupier'],
      answer: 1,
      explanation: 'Un compte faux mène à de mauvaises mises. Sans compte, on joue comme un joueur de stratégie de base, au minimum.',
    },
    {
      question: 'Quel est le comportement le plus repérable pour un compteur ?',
      choices: [
        'Laisser un pourboire',
        'Passer brutalement de la mise minimale à la mise maximale et revenir au minimum après le mélange',
        'Discuter avec le croupier',
        'Jouer moins d\'une heure',
      ],
      answer: 1,
      explanation: 'La corrélation entre la mise et le compte (et le retour au minimum au mélange) est exactement ce que surveille le casino.',
    },
    {
      question: 'Le croupier mélange dès que vous augmentez votre mise. Comment s\'appelle cette pratique ?',
      choices: ['Wonging', 'Preferential shuffling', 'Back-off', 'Flat betting'],
      answer: 1,
      explanation: 'Le mélange « préférentiel » supprime précisément les situations favorables au compteur.',
    },
    {
      question: 'Compter les cartes de tête est-il illégal ?',
      choices: [
        'Oui, partout',
        'Non dans la plupart des juridictions, mais le casino peut refuser votre jeu',
        'Seulement en Europe',
        'Seulement avec plus de 6 jeux',
      ],
      answer: 1,
      explanation: 'Utiliser son cerveau n\'est pas une infraction. Utiliser un appareil électronique, en revanche, l\'est.',
    },
    {
      question: 'Un responsable vous demande poliment de ne plus jouer au blackjack. Que faites-vous ?',
      choices: ['Vous argumentez', 'Vous partez poliment', 'Vous changez de table de blackjack', 'Vous exigez de parler au directeur'],
      answer: 1,
      explanation: 'Restez courtois et partez : vous préservez vos chances de revenir un jour et évitez d\'être fiché.',
    },
    {
      question: 'Quel gain horaire est réaliste pour un compteur à 25 € l\'unité en sabot ?',
      choices: ['≈ 15 à 30 €/h', '≈ 500 €/h', '≈ 2 000 €/h', '0 €'],
      answer: 0,
      explanation: 'Avec ≈ 0,7 à 1 unité par 100 mains, l\'espérance reste de l\'ordre de quelques dizaines d\'euros par heure.',
    },
    {
      question: 'Pourquoi juger sa performance sur la justesse plutôt que sur les gains ?',
      choices: [
        'Parce que les gains ne comptent pas',
        'Parce que la variance rend les résultats à court terme presque aléatoires',
        'Parce que le casino truque les résultats',
        'Pour payer moins d\'impôts',
      ],
      answer: 1,
      explanation: 'Même avec un avantage réel, on peut perdre pendant des centaines d\'heures. La justesse, elle, se mesure tout de suite.',
    },
    {
      question: 'Quelle durée de session est conseillée ?',
      choices: ['5 minutes', '30 à 60 minutes', '6 heures', 'Toute la nuit'],
      answer: 1,
      explanation: 'Des sessions courtes limitent la fatigue (erreurs) et l\'exposition au personnel du casino.',
    },
    {
      question: 'Pourquoi les mélangeurs automatiques continus (CSM) empêchent-ils de compter ?',
      choices: [
        'Ils sont trop rapides',
        'Les cartes jouées sont réintroduites en permanence : la composition du sabot ne s\'écarte presque jamais de la neutralité',
        'Ils retirent les As',
        'Ils imposent le 6:5',
      ],
      answer: 1,
      explanation: 'Avec un CSM, il n\'y a pas de « profondeur » de sabot : le compte reste proche de 0.',
    },
    {
      question: 'Quelle couverture est raisonnable ?',
      choices: [
        'Augmenter la mise après une main gagnée, par paliers',
        'Changer de mise au hasard',
        'Toujours miser le maximum',
        'Annoncer que l\'on compte',
      ],
      answer: 0,
      explanation: 'Monter après un gain ressemble au comportement d\'un joueur ordinaire « qui laisse courir ».',
    },
    {
      question: 'Que faut-il pouvoir faire avant de jouer de l\'argent réel ?',
      choices: [
        'Compter un jeu en moins de 25 s et tenir un sabot complet sans erreur avec plusieurs joueurs',
        'Connaître uniquement la stratégie de base',
        'Avoir gagné une session au simulateur',
        'Connaître 5 systèmes de comptage',
      ],
      answer: 0,
      explanation: 'Les exigences techniques doivent être validées : justesse, vitesse, stratégie et déviations.',
    },
  ],
};
