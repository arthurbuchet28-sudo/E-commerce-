import type { CourseModule } from './types';

export const module6: CourseModule = {
  id: 6,
  slug: 'gestion-de-mise',
  title: 'La gestion de la mise',
  subtitle: 'Écart de mise, rampe, bankroll, risque de ruine et variance',
  duration: '1 h 30',
  objectives: [
    'Comprendre que l\'essentiel du gain d\'un compteur vient de la variation de la mise.',
    'Définir une unité de mise, un écart (spread) et une rampe selon le true count.',
    'Connaître le Wonging (back-counting) et ses limites.',
    'Calculer un risque de ruine et la bankroll nécessaire.',
    'Comprendre la variance : pourquoi on peut perdre pendant des semaines avec un avantage.',
  ],
  sections: [
    {
      id: 'principe',
      title: 'Miser plus quand on est favori',
      blocks: [
        {
          type: 'p',
          text: "Environ deux mains sur trois se jouent avec un true count nul ou négatif, donc avec un **désavantage**. Si vous misez toujours la même somme, vous perdez. Le compteur gagne parce qu'il **mise beaucoup plus sur les mains favorables** que sur les autres.",
        },
        {
          type: 'callout',
          tone: 'success',
          title: 'Ordre d\'importance',
          text: "Pour un compteur Hi-Lo en sabot, **80 à 90 % du gain vient de la variation de la mise**, et seulement 10 à 20 % des déviations de stratégie. Bien miser est la compétence n°1.",
        },
      ],
    },
    {
      id: 'vocabulaire',
      title: 'Unité, écart et rampe',
      blocks: [
        {
          type: 'list',
          items: [
            "**Unité de mise** : votre mise de base, jouée quand le compte est neutre ou défavorable. Tout se raisonne en unités (ex. 1 unité = 10 €).",
            "**Écart de mise** (*bet spread*) : rapport entre la mise maximale et la mise minimale. Un écart **1-8** signifie que vous misez de 1 à 8 unités.",
            '**Rampe de mise** (*bet ramp*) : la règle qui associe une mise à chaque true count.',
          ],
        },
        { type: 'h', text: 'Exemple de rampe 1-8 (sabot de 6 jeux)' },
        {
          type: 'table',
          headers: ['True count', '≤ +1', '+2', '+3', '+4', '≥ +5'],
          rows: [
            ['Mise (unités)', '1', '2', '4', '6', '8'],
            ['Avantage approximatif', '≤ +0,2 %', '+0,7 %', '+1,2 %', '+1,7 %', '≥ +2,2 %'],
          ],
          caption: 'Une rampe courante consiste à miser (TC − 1) × une à deux unités, jusqu\'au maximum de votre écart.',
        },
        {
          type: 'p',
          text: "En sabot de 6 à 8 jeux, un écart de **1-8 à 1-12** est généralement nécessaire pour obtenir un avantage intéressant. Un écart de 1-4 en sabot rapporte très peu. Mais plus l'écart est grand, plus il est **voyant** pour le casino (module 8).",
        },
      ],
    },
    {
      id: 'wonging',
      title: 'Le Wonging (back-counting)',
      blocks: [
        {
          type: 'p',
          text: "Popularisée par Stanford Wong, la technique consiste à **compter debout derrière une table sans jouer**, puis à s'asseoir quand le true count devient favorable (par exemple TC ≥ +1), et à **quitter la table** quand il redevient négatif (*Wonging out*).",
        },
        {
          type: 'list',
          items: [
            '**Avantage** : vous évitez la majorité des mains défavorables. L\'avantage moyen par main jouée double environ, et l\'écart de mise nécessaire diminue.',
            '**Inconvénients** : très reconnaissable ; beaucoup de casinos interdisent l\'entrée en milieu de sabot (« *No mid-shoe entry* ») ; on joue moins de mains par heure.',
            '**Version douce** : rester à table mais quitter le sabot quand le TC tombe à −2 ou moins (« aller aux toilettes », prendre un appel…).',
          ],
        },
      ],
    },
    {
      id: 'variance',
      title: 'La variance : pourquoi on peut perdre longtemps',
      blocks: [
        {
          type: 'p',
          text: "Au Blackjack, l'**écart-type** du résultat d'une main vaut environ **1,15 fois la mise**. Avec une rampe de mise, il atteint environ **2,5 unités par main**, alors que le gain espéré n'est que de **0,01 unité par main** environ. Le « bruit » est plus de 200 fois plus gros que le « signal ».",
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Le résultat après n mains',
          text: "Gain espéré = n × E ; écart-type = σ × √n. Le gain espéré croît comme n, l'écart-type comme √n : il faut **beaucoup** de mains pour que l'avantage l'emporte sur la chance. Le nombre de mains pour que le gain espéré égale un écart-type s'appelle **N0** = σ² / E². Pour un compteur typique en sabot, N0 se compte en **dizaines de milliers de mains**, soit des centaines d'heures de jeu.",
        },
        { type: 'widget', id: 'variance-sim' },
        {
          type: 'example',
          title: 'Ordre de grandeur (rampe 1-8, 6 jeux, 75 %, unité = 25 €)',
          lines: [
            'Gain espéré ≈ 0,7 unité / 100 mains ≈ **18 € par heure** (100 mains/h).',
            'Écart-type ≈ 24 unités / 100 mains ≈ **600 € par heure**.',
            'Après 100 heures : gain espéré ≈ +1 800 €, mais un écart-type de ±6 000 € : une perte reste très plausible.',
          ],
        },
      ],
    },
    {
      id: 'ruine',
      title: 'Bankroll et risque de ruine',
      blocks: [
        {
          type: 'p',
          text: 'La **bankroll** est la somme exclusivement dédiée au jeu. Le **risque de ruine** (RoR) est la probabilité de la perdre entièrement avant que l\'avantage ne joue son rôle.',
        },
        {
          type: 'callout',
          tone: 'math',
          title: 'Formule (approximation classique)',
          text: '**RoR = exp(−2 × E × B / σ²)**, où E est le gain espéré par main, σ l\'écart-type par main et B la bankroll (même unité). Inversement, la bankroll nécessaire pour un risque cible r est **B = −σ² × ln(r) / (2E)**.',
        },
        {
          type: 'table',
          headers: ['Bankroll (unités)', '400', '800', '1 200', '2 000'],
          rows: [['Risque de ruine (rampe 1-8, ≈ 0,7 u / 100 mains, σ ≈ 2,4 u)', '≈ 36 %', '≈ 13 %', '≈ 5 %', '< 1 %']],
          caption: 'Calcul : exp(−2 × 0,0073 × B / 2,39²). Il faut environ 1 200 unités pour un risque de ruine de 5 %. Avec Wonging et déviations, le besoin diminue.',
        },
        {
          type: 'list',
          items: [
            '**Ne jamais** jouer avec de l\'argent dont vous avez besoin. Une bankroll est de l\'argent que vous pouvez perdre entièrement.',
            '**Critère de Kelly** : miser une fraction de la bankroll égale à avantage ÷ variance (≈ avantage ÷ 1,33). Avec +1 % d\'avantage, Kelly suggère ≈ 0,75 % de la bankroll. Beaucoup de professionnels jouent « demi-Kelly » pour réduire la volatilité.',
            '**Réajuster l\'unité** : si la bankroll baisse fortement, réduisez l\'unité de mise pour garder un risque acceptable.',
          ],
        },
        { type: 'widget', id: 'bet-ramp' },
      ],
    },
  ],
  keyPoints: [
    'L\'essentiel du gain vient de la variation de la mise, pas des déviations.',
    'Unité = mise de base ; écart = max/min ; rampe = mise en fonction du TC.',
    'En sabot, un écart de 1-8 à 1-12 est nécessaire ; on commence à monter vers TC +2.',
    'Wonging : ne jouer que les comptes favorables ; efficace mais repérable.',
    'Écart-type ≈ 1,15 mise par main : la variance domine à court terme.',
    'RoR = exp(−2EB/σ²) ; il faut de l\'ordre de 1 000 unités de bankroll.',
    'Le gain horaire est modeste (souvent 10 à 40 € de l\'heure pour un joueur à 10-25 € l\'unité).',
  ],
  mistakes: [
    { mistake: 'Miser plus après une perte « pour se refaire » (martingale).', fix: 'La mise dépend uniquement du true count, jamais des résultats passés.' },
    { mistake: 'Utiliser un écart trop faible (1-2, 1-4) en sabot.', fix: 'L\'avantage obtenu est alors quasi nul. Il faut un écart réel ou du Wonging.' },
    { mistake: 'Sous-estimer la bankroll nécessaire.', fix: 'Avec 100 unités, la ruine est quasi certaine même avec un avantage. Visez ~1 000 unités.' },
    { mistake: 'Juger sa compétence sur une soirée ou une semaine.', fix: 'Les résultats à court terme ne prouvent rien. Jugez votre justesse (compte, décisions), pas vos gains.' },
    { mistake: 'Passer brusquement de 1 à 8 unités.', fix: 'C\'est le signal le plus visible pour le casino. Montez progressivement (voir module 8).' },
  ],
  exercises: [
    { id: 'simulator', title: 'Simulateur avec rampe de mise', goal: 'Appliquez votre rampe pendant 200 mains en mode entraînement.' },
    { id: 'true-count', title: 'Conversion en true count', goal: 'Le TC détermine la mise : il doit être instantané.' },
  ],
  quiz: [
    {
      question: 'D\'où vient l\'essentiel du gain d\'un compteur Hi-Lo en sabot ?',
      choices: ['Des déviations de stratégie', 'De la variation de la mise', 'De l\'assurance', 'Des pourboires'],
      answer: 1,
      explanation: 'Environ 80 à 90 % du gain vient de l\'écart de mise.',
    },
    {
      question: 'Que signifie un écart de mise 1-12 ?',
      choices: [
        'On mise entre 1 € et 12 €',
        'La mise maximale vaut 12 fois la mise minimale',
        'On joue 12 mains par sabot',
        'On commence à miser à TC +12',
      ],
      answer: 1,
      explanation: 'L\'écart est le rapport max/min, exprimé en unités.',
    },
    {
      question: 'Votre rampe est « (TC − 1) × 2 unités, max 8 ». Combien misez-vous à TC +3 ?',
      choices: ['2 unités', '4 unités', '6 unités', '8 unités'],
      answer: 1,
      explanation: '(3 − 1) × 2 = 4 unités.',
    },
    {
      question: 'Qu\'est-ce que le Wonging ?',
      choices: [
        'Doubler sa mise après chaque perte',
        'Observer le jeu sans jouer et n\'entrer que lorsque le compte est favorable',
        'Compter deux sabots à la fois',
        'Jouer deux mains à la fois',
      ],
      answer: 1,
      explanation: 'Technique popularisée par Stanford Wong : on évite les mains défavorables.',
    },
    {
      question: 'Pourquoi peut-on perdre pendant des semaines avec un avantage de 1 % ?',
      choices: [
        'Parce que le casino triche forcément',
        'Parce que l\'écart-type par main est bien plus grand que le gain espéré',
        'Parce que l\'avantage disparaît la nuit',
        'Parce que le comptage ne fonctionne pas',
      ],
      answer: 1,
      explanation: 'Écart-type ≈ 1,15 mise par main contre 0,01 mise de gain espéré : la chance domine à court terme.',
    },
    {
      question: 'Le gain espéré croît comme n. Comment croît l\'écart-type du résultat après n mains ?',
      choices: ['Comme n', 'Comme √n', 'Comme n²', 'Il est constant'],
      answer: 1,
      explanation: 'L\'écart-type croît comme la racine carrée de n : à très long terme, l\'espérance finit par dominer.',
    },
    {
      question: 'Quelle formule approche le risque de ruine ?',
      choices: ['RoR = E × B', 'RoR = exp(−2EB/σ²)', 'RoR = σ / B', 'RoR = 1 − E'],
      answer: 1,
      explanation: 'Plus E (espérance) ou B (bankroll) sont grands, plus le risque baisse ; plus σ² (variance) est grande, plus il augmente.',
    },
    {
      question: 'Si votre bankroll double (E et σ inchangés), le risque de ruine…',
      choices: ['Est divisé par 2', 'Est élevé au carré (il baisse fortement)', 'Ne change pas', 'Double'],
      answer: 1,
      explanation: 'exp(−2E·2B/σ²) = [exp(−2EB/σ²)]². Un RoR de 30 % devient 9 %.',
    },
    {
      question: 'Selon le critère de Kelly, avec un avantage de 1 % (variance ≈ 1,33), quelle fraction de la bankroll miser ?',
      choices: ['≈ 0,75 %', '≈ 10 %', '≈ 50 %', '≈ 1,33 %'],
      answer: 0,
      explanation: 'Fraction ≈ avantage / variance = 0,01 / 1,33 ≈ 0,75 %.',
    },
    {
      question: 'Vous venez de perdre 5 mains. Le TC est 0. Combien misez-vous ?',
      choices: ['La mise minimale (1 unité)', 'Le double de la mise précédente', 'La mise maximale', 'Rien, on attend'],
      answer: 0,
      explanation: 'La mise ne dépend que du true count. À TC 0, mise minimale (ou Wonging out si vous le pratiquez).',
    },
    {
      question: 'Quel ordre de grandeur de bankroll faut-il pour un risque de ruine de 5-10 % avec une rampe 1-8 en sabot ?',
      choices: ['≈ 50 unités', '≈ 200 unités', '≈ 1 000 unités', '≈ 100 000 unités'],
      answer: 2,
      explanation: 'De l\'ordre de 1 000 à 1 200 unités selon les conditions (pénétration, règles, Wonging).',
    },
    {
      question: 'Pourquoi l\'interdiction d\'entrer en milieu de sabot gêne-t-elle le compteur ?',
      choices: [
        'Elle l\'empêche de pratiquer le Wonging',
        'Elle l\'empêche de doubler',
        'Elle impose le 6:5',
        'Elle réduit la pénétration',
      ],
      answer: 0,
      explanation: '« No mid-shoe entry » oblige à s\'asseoir au début du sabot, et donc à jouer aussi les comptes négatifs.',
    },
  ],
};
