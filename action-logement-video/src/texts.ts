// Tous les textes de la vidéo (français, apostrophes typographiques ’, ® inclus).
// Titres : 6 mots max par ligne. Un tableau = une ligne par entrée.

export const texts = {
  accroche: {
    ligne1: ['Trouver un logement', 'quand on travaille…'],
    ligne2: 'pas toujours simple\u00A0?', // espace insécable avant « ? »
  },
  reponse: {
    titre: ['Action Logement', 'vous accompagne'],
    sousTitre: 'Salariés et entreprises du secteur privé',
  },
  solutions: {
    surtitre: 'Pour les salariés',
    cartes: [
      {icone: 'bouclier', titre: 'Visale', texte: 'La garantie locative gratuite'},
      {icone: 'cle', titre: 'Avance Loca-Pass®', texte: 'Votre dépôt de garantie avancé sans frais'},
      {icone: 'diplome', titre: 'Mobili-Jeune®', texte: 'Une aide au loyer pour les alternants'},
      {icone: 'maison', titre: 'Prêt Accession', texte: 'Un coup de pouce pour devenir propriétaire'},
    ],
  },
  entreprises: {
    titre: ['Entreprises\u00A0:', 'attirez et fidélisez', 'vos talents'],
    sousTitre: 'Le logement, un levier RH',
  },
  signature: {
    baseline: 'Faciliter le logement pour favoriser l’emploi',
    // Version sur deux lignes pour le format 9:16
    baselineLignes: ['Faciliter le logement', 'pour favoriser l’emploi'],
    url: 'actionlogement.fr',
  },
} as const;

export type IconName = 'bouclier' | 'cle' | 'diplome' | 'maison' | 'mallette' | 'poignee';
