import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/engine/random';
import { validerQuestion } from '@/engine/validation';
import type { Question } from '@/types/question';
import { questionPersonne, genererQuestionsPersonnes, categoriePersonne } from '../generateurs/personnes';
import { questionChronologie, questionAnneeEvenement, genererQuestionsMonuments } from '../generateurs/monuments-evenements';
import { questionPays, questionDepartement, genererQuestionsPays, genererQuestionsDepartements } from '../generateurs/geographie';
import { questionChanson, tirerChansons } from '../generateurs/blindtest';
import { anneesProches, distracteursCredibles, niveauSelonRang } from '../generateurs/outils';
import type { Evenement, Monument, Pays, Personne } from '../wikidata/requetes';

const rng = () => mulberry32(42);

function personne(id: string, nom: string, extra: Partial<Personne> = {}): Personne {
  return { id, nom, notoriete: 100, naissance: 1900, naissancePrecise: true, genre: 'm', paysNaissance: 'France', domaines: ['sciences'], image: 'https://x/img.jpg', credit: 'Photo : X, CC BY — Wikimedia Commons', ...extra };
}

const personnes: Personne[] = [
  personne('Q1', 'Marie Curie', { genre: 'f', naissance: 1867, paysNaissance: 'Pologne' }),
  personne('Q2', 'Albert Einstein', { naissance: 1879, paysNaissance: 'Allemagne' }),
  personne('Q3', 'Louis Pasteur', { naissance: 1822 }),
  personne('Q4', 'Isaac Newton', { naissance: 1643, paysNaissance: 'Royaume-Uni' }),
  personne('Q5', 'Niels Bohr', { naissance: 1885, paysNaissance: 'Danemark' }),
  personne('Q6', 'Charlie Chaplin', { naissance: 1889, domaines: ['cinema'], paysNaissance: 'Royaume-Uni' }),
  personne('Q7', 'Zinédine Zidane', { naissance: 1972, domaines: ['sport'] }),
  personne('Q8', 'Galilée', { naissance: 1564, paysNaissance: 'Italie' }),
  personne('Q9', 'Ada Lovelace', { genre: 'f', naissance: 1815, paysNaissance: 'Royaume-Uni' }),
  personne('Q10', 'Nikola Tesla', { naissance: 1856, paysNaissance: 'Croatie' }),
];

/** Toute question générée doit passer la même validation que la banque locale (hors règle du nombre de choix). */
function valide(q: Question | null) {
  expect(q).not.toBeNull();
  const erreurs = validerQuestion({ ...q!, anecdote: q!.anecdote ?? 'anecdote de test' }).filter((e) => !e.includes('attendus au niveau'));
  expect(erreurs).toEqual([]);
}

describe('outils de génération', () => {
  it('distracteurs : jamais la bonne réponse, sans doublon, les plus ressemblants d’abord', () => {
    const d = distracteursCredibles(5, [1, 2, 3, 4, 5, 6, 7, 8, 50, 60], 3, (x) => -Math.abs(x - 5), String, mulberry32(1));
    expect(d).toHaveLength(3);
    expect(d).not.toContain('5');
    expect(new Set(d).size).toBe(3);
    expect(d.every((x) => Number(x) < 10)).toBe(true);
  });
  it('niveau selon la notoriété', () => {
    expect(niveauSelonRang(0, 100)).toBe(1);
    expect(niveauSelonRang(99, 100)).toBe(4);
    expect(niveauSelonRang(0, 100, 5)).toBe(4);
  });
  it('années proches distinctes de la bonne', () => {
    const a = anneesProches(1900, 5, mulberry32(3));
    expect(a).toHaveLength(5);
    expect(a).not.toContain('1900');
    expect(new Set(a).size).toBe(5);
  });
});

describe('Wikidata : personnalités', () => {
  it('« Qui est cette personne ? » avec photo créditée et texte alternatif neutre', () => {
    const q = questionPersonne(personnes[0]!, personnes, 'photo', rng())!;
    valide(q);
    expect(q.type).toBe('image');
    expect(q.media?.credit).toContain('Wikimedia Commons');
    expect(q.media?.alt).not.toContain('Curie');
    expect(q.choix).toHaveLength(6);
    expect(q.reponsesAcceptees).toEqual(['Curie']);
  });
  it('accorde au féminin', () => {
    expect(questionPersonne(personnes[0]!, personnes, 'naissance', rng())!.enonce).toBe('En quelle année est née Marie Curie ?');
  });
  it('pas de question d’année si la date est imprécise', () => {
    expect(questionPersonne(personne('Q99', 'Homère', { naissancePrecise: false }), personnes, 'naissance', rng())).toBeNull();
  });
  it('vrai / faux de chronologie entre deux personnes', () => {
    const q = questionPersonne(personnes[1]!, personnes, 'avant', rng())!;
    valide(q);
  });
  it('les sportifs vont en Sport, les acteurs en Cinéma', () => {
    expect(categoriePersonne(personnes[6]!)).toBe('sport');
    expect(categoriePersonne(personnes[5]!)).toBe('cinema_series');
    const qs = genererQuestionsPersonnes(personnes, 'personnalites', 5, rng());
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.categorie === 'personnalites')).toBe(true);
    qs.forEach(valide);
  });
});

describe('Wikidata : monuments et événements', () => {
  const monuments: Monument[] = ['Tour Eiffel', 'Colisée', 'Big Ben', 'Taj Mahal', 'Machu Picchu', 'Alhambra', 'Kremlin'].map((nom, i) => ({
    id: `M${i}`,
    nom,
    notoriete: 100 - i,
    pays: ['France', 'Italie', 'Royaume-Uni', 'Inde', 'Pérou', 'Espagne', 'Russie'][i]!,
    image: 'https://x/m.jpg',
    credit: 'Photo : X — Wikimedia Commons',
  }));
  const evenements: Evenement[] = [1789, 1815, 1870, 1914, 1939, 1969, 1989].map((annee, i) => ({ id: `E${i}`, nom: `Événement ${i}`, notoriete: 100 - i, annee, ponctuel: true }));

  it('monuments en photo', () => {
    genererQuestionsMonuments(monuments, 3, rng()).forEach(valide);
  });
  it('chronologie : 4 événements bien ordonnés', () => {
    const q = questionChronologie(evenements, rng())!;
    valide(q);
    const ordre = q.bonneReponse as string[];
    const annees = ordre.map((n) => evenements.find((e) => e.nom === n)!.annee);
    expect(annees).toEqual([...annees].sort((a, b) => a - b));
  });
  it('année d’un événement (QCM ou estimation)', () => {
    const q = questionAnneeEvenement(evenements[0]!, evenements, rng());
    valide(q);
    expect(q.bonneReponse).toBe(1789);
  });
});

describe('Géographie', () => {
  const pays: Pays[] = [
    ['fr', 'France', 'Paris', 'euro', 'Europe'],
    ['de', 'Allemagne', 'Berlin', 'euro', 'Europe'],
    ['it', 'Italie', 'Rome', 'euro', 'Europe'],
    ['es', 'Espagne', 'Madrid', 'euro', 'Europe'],
    ['gb', 'Royaume-Uni', 'Londres', 'livre sterling', 'Europe'],
    ['ch', 'Suisse', 'Berne', 'franc suisse', 'Europe'],
    ['jp', 'Japon', 'Tokyo', 'yen', 'Asie'],
    ['br', 'Brésil', 'Brasilia', 'réal brésilien', 'Amérique du Sud'],
  ].map(([iso2, nom, cap, mon, cont], i) => ({ iso2: iso2!, nom: nom!, notoriete: 400 - i, capitales: [cap!], population: 50_000_000, monnaies: [mon!], continents: [cont!] }));
  const drapeau = (iso: string) => `/drapeaux/${iso}.svg`;

  it('drapeau : distracteurs du même continent d’abord', () => {
    const q = questionPays(pays[0]!, pays, 'drapeau', rng(), drapeau)!;
    valide(q);
    expect(q.media?.image).toBe('/drapeaux/fr.svg');
    expect(q.choix!.slice(1).every((c) => ['Allemagne', 'Italie', 'Espagne', 'Royaume-Uni', 'Suisse'].includes(c))).toBe(true);
  });
  it('capitale, monnaie, population', () => {
    valide(questionPays(pays[0]!, pays, 'capitale', rng(), drapeau));
    const monnaie = questionPays(pays[4]!, pays, 'monnaie', rng(), drapeau)!;
    valide(monnaie);
    expect(monnaie.choix).not.toContain(undefined);
    const pop = questionPays(pays[0]!, pays, 'population', rng(), drapeau)!;
    valide(pop);
    expect(pop.bonneReponse).toBe(50);
  });
  it('génère des questions variées et valides', () => {
    genererQuestionsPays(pays, 6, rng(), drapeau).forEach(valide);
  });
  it('départements', () => {
    const deps = [
      { code: '69', nom: 'Rhône', prefecture: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
      { code: '38', nom: 'Isère', prefecture: 'Grenoble', region: 'Auvergne-Rhône-Alpes' },
      { code: '01', nom: 'Ain', prefecture: 'Bourg-en-Bresse', region: 'Auvergne-Rhône-Alpes' },
      { code: '13', nom: 'Bouches-du-Rhône', prefecture: 'Marseille', region: "Provence-Alpes-Côte d'Azur" },
      { code: '59', nom: 'Nord', prefecture: 'Lille', region: 'Hauts-de-France' },
      { code: '33', nom: 'Gironde', prefecture: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
      { code: '75', nom: 'Paris', prefecture: 'Paris', region: 'Île-de-France' },
    ];
    const q = questionDepartement(deps[2]!, deps, 'numeroInverse', rng());
    valide(q);
    expect(q.reponsesAcceptees).toEqual(['1']);
    genererQuestionsDepartements(deps, 5, rng()).forEach(valide);
  });
});

describe('Blind test', () => {
  const chansons = [
    { artiste: 'Joe Dassin', titre: 'Les Champs-Élysées', annee: 1969, epoque: '60-70' as const, style: 'variete' as const },
    { artiste: 'Michel Sardou', titre: 'Les Lacs du Connemara', annee: 1981, epoque: '80' as const, style: 'variete' as const },
    { artiste: 'IAM', titre: 'Je danse le mia', annee: 1994, epoque: '90' as const, style: 'rap' as const },
    { artiste: 'MC Solaar', titre: 'Caroline', annee: 1991, epoque: '90' as const, style: 'rap' as const },
    { artiste: 'Stromae', titre: 'Papaoutai', annee: 2013, epoque: 'actuel' as const, style: 'variete' as const },
    { artiste: 'Indochine', titre: "L'Aventurier", annee: 1982, epoque: '80' as const, style: 'rock' as const },
  ];
  it('questions audio : extrait officiel, jamais de paroles', () => {
    for (const genre of ['artiste', 'titre', 'annee'] as const) {
      const q = questionChanson(chansons[2]!, chansons, genre, { id: 123, preview: 'https://cdn/x.mp3' }, rng());
      valide(q);
      expect(q.type).toBe('audio');
      expect(q.id).toBe(`deezer-123-${genre}`);
      expect(q.enonce).not.toMatch(/parole/i);
    }
  });
  it('filtre par époque et par style', () => {
    expect(tirerChansons(chansons, 10, rng(), { style: 'rap' }).every((c) => c.style === 'rap')).toBe(true);
    expect(tirerChansons(chansons, 10, rng(), { epoque: '80' })).toHaveLength(2);
  });
});
