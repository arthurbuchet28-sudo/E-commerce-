/**
 * Tous les textes de l'interface, regroupés ici pour faciliter les modifications.
 */
import type { Joker, NiveauDifficulte } from '@/config/difficulte';

export const T = {
  appNom: 'QuizMania',
  slogan: 'Des quiz en français, fun et rejouables à l’infini',
  accueil: {
    jouer: 'Jouer',
    sousTitre: 'Choisis un thème, règle la difficulté… et enchaîne les bonnes réponses !',
    bientot: 'Bientôt',
    modes: 'Modes de jeu',
    modeClassique: 'Classique',
    modeClassiqueDesc: '10 ou 20 questions sur le thème de ton choix',
    autresModes: ['Contre-la-montre', 'Survie', 'Blind test', 'Défi du jour', 'Duel local', 'Entraînement'],
    stats: (n: number) => `${n} questions dans la banque locale`,
  },
  config: {
    titre: 'Prépare ta partie',
    categorie: 'Thème',
    difficulte: 'Difficulté',
    nombre: 'Nombre de questions',
    lancer: 'C’est parti !',
    chargement: 'Préparation des questions…',
    erreur: 'Impossible de préparer la partie. Réessaie dans un instant.',
    pasAssez: (n: number) => `Seulement ${n} questions disponibles pour ce choix : la partie sera plus courte.`,
    details: (temps: number, choix: number, jokers: number, mult: number) =>
      `${temps} s par question · ${choix} choix · ${jokers} joker${jokers > 1 ? 's' : ''} · points ×${String(mult).replace('.', ',')}`,
  },
  difficultes: {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
    expert: 'Expert',
  } satisfies Record<NiveauDifficulte, string>,
  jeu: {
    question: (i: number, n: number) => `Question ${i} / ${n}`,
    score: 'Score',
    suivante: 'Question suivante',
    resultats: 'Voir les résultats',
    abandonner: 'Quitter la partie',
    confirmerAbandon: 'Quitter la partie en cours ? Ta progression sera perdue.',
    bravo: ['Bravo !', 'Excellent !', 'Bien joué !', 'Parfait !', 'Génial !', 'Impressionnant !'],
    rate: ['Raté !', 'Pas tout à fait…', 'Dommage !', 'Eh non !'],
    tempsEcoule: 'Temps écoulé !',
    passee: 'Question passée',
    bonneReponseEtait: 'La bonne réponse était :',
    leSaviezVous: 'Le saviez-vous ?',
    combo: (n: number) => `Combo ×${n}`,
    pointsGagnes: (n: number) => `+${n}`,
    raccourcis: 'Touches 1 à 6 pour répondre, Entrée pour continuer',
    secondes: (n: number) => `${n} secondes restantes`,
    valider: 'Valider',
    validerOrdre: 'Valider l’ordre',
    saisiePlaceholder: 'Ta réponse…',
    saisieLibelle: 'Écris ta réponse',
    chronologieAide: 'Du plus ancien (en haut) au plus récent (en bas) : fais glisser ou utilise ↑ ↓',
    chronologieLibelle: 'Événements à remettre dans l’ordre',
    estimationLibelle: 'Ton estimation',
    estimationCurseur: 'Ajuster l’estimation',
    estimationResultat: (ecart: string, pct: number) => (pct === 100 ? 'Pile dans le mille ! 🎯' : `Écart : ${ecart} — ${pct} % des points`),
    partiel: ['Pas loin !', 'Presque !', 'Bien tenté !'],
    imageIndisponible: 'Image indisponible pour le moment.',
    audioIndisponible: 'Extrait indisponible',
    ecouter: 'Écouter l’extrait',
    pause: 'Mettre en pause',
  },
  jokers: {
    cinquante: { nom: '50/50', aide: 'Retire la moitié des mauvaises réponses' },
    indice: { nom: 'Indice', aide: 'Donne la première lettre de la réponse' },
    passer: { nom: 'Passer', aide: 'Passe la question sans perdre ta série' },
    temps: { nom: '+10 s', aide: 'Ajoute 10 secondes au chrono' },
  } satisfies Record<Joker, { nom: string; aide: string }>,
  jokersRestants: (n: number) => (n === 0 ? 'Aucun joker' : `${n} joker${n > 1 ? 's' : ''}`),
  resultats: {
    titre: 'Partie terminée !',
    nouveauRecord: 'Nouveau record !',
    score: 'Score',
    precision: 'Précision',
    tempsMoyen: 'Temps moyen',
    meilleureSerie: 'Meilleure série',
    record: 'Record',
    rejouer: 'Rejouer',
    changer: 'Changer de thème',
    accueil: 'Accueil',
    partager: 'Partager mon score',
    copie: 'Copié dans le presse-papiers !',
    recap: 'Récapitulatif',
    messages: {
      1: 'Il y a de la marge… mais chaque partie t’apprend quelque chose !',
      2: 'Belle partie ! Encore un petit effort pour les 3 étoiles.',
      3: 'Magistral ! Tu es une véritable encyclopédie.',
    } as Record<1 | 2 | 3, string>,
    partage: (score: number, bonnes: number, total: number, grille: string, theme: string, difficulte: string) =>
      `QuizMania 🎯 ${theme} (${difficulte})\n${grille}\n${bonnes}/${total} · ${score} points\nSauras-tu faire mieux ?`,
  },
  reglages: {
    titre: 'Réglages',
    theme: 'Thème',
    themes: { systeme: 'Auto', clair: 'Clair', sombre: 'Sombre' },
    animations: 'Animations réduites',
    vibrations: 'Vibrations',
    fermer: 'Fermer',
  },
  erreurs: {
    pageIntrouvable: 'Cette page n’existe pas.',
    retourAccueil: 'Retour à l’accueil',
  },
};

export function auHasard(liste: readonly string[]): string {
  return liste[Math.floor(Math.random() * liste.length)] ?? '';
}
