import { describe, expect, it } from 'vitest';
import { validerQuestion } from '@/engine/validation';
import restCountries from './fixtures/restcountries-v5.json';
import openTdb from './fixtures/opentdb.json';
import { enrichirPays, normaliserRestCountries } from '../pays';
import { categorieOpenQuizzDb, normaliserOpenQuizzDb } from '../openquizzdb';
import { normaliserOpenTdb, traduireQuestions } from '../opentdb';
import { choisirPiste, idPisteDepuisQuestion, type PisteDeezer } from '../deezer';
import { anneeDepuisDate, fichierCommons, normaliserEvenements, normaliserPays, normaliserPersonnes, majuscule } from '../wikidata/requetes';

describe('REST Countries v5', () => {
  it('extrait population et drapeau par code ISO', () => {
    const m = normaliserRestCountries(restCountries);
    expect(m.get('ca')).toEqual({ population: 41798407, drapeau: 'https://flags.restcountries.com/v5/svg/ca.svg' });
  });
  it('ignore une réponse inattendue', () => {
    expect(normaliserRestCountries({ erreur: true }).size).toBe(0);
  });
  it('enrichit la population sans toucher aux libellés français', () => {
    const [p] = enrichirPays([{ iso2: 'ca', nom: 'Canada', notoriete: 1, capitales: ['Ottawa'], population: 1, monnaies: ['dollar canadien'], continents: [] }], normaliserRestCountries(restCountries));
    expect(p).toMatchObject({ nom: 'Canada', capitales: ['Ottawa'], population: 41798407 });
  });
});

describe('OpenQuizzDB', () => {
  const exemple = {
    response_code: 0,
    results: [
      { langue: 'fr', categorie: 'Cinéma', theme: 'Films cultes', difficulte: 'confirmé', question: 'Qui a réalisé « Les Tontons flingueurs » ?', reponse_correcte: 'Georges Lautner', autres_choix: ['Georges Lautner', 'Michel Audiard', 'Claude Zidi', 'Gérard Oury'], anecdote: 'Dialogues de Michel Audiard.' },
      { question: 'Sans réponse' },
    ],
  };
  it('normalise au format QuizMania', () => {
    const [q, ...reste] = normaliserOpenQuizzDb(exemple);
    expect(reste).toHaveLength(0);
    expect(q).toMatchObject({ source: 'openquizzdb', categorie: 'cinema_series', difficulte: 2, bonneReponse: 'Georges Lautner' });
    expect(q!.choix).toHaveLength(4);
    expect(validerQuestion(q!).filter((e) => !e.includes('attendus'))).toEqual([]);
  });
  it('catégorie par défaut : culture générale', () => {
    expect(categorieOpenQuizzDb({ categorie: 'Divers' })).toBe('culture_generale');
  });
});

describe('Open Trivia DB', () => {
  it('décode et normalise, puis traduit (bonne réponse conservée)', async () => {
    const qs = normaliserOpenTdb(openTdb, 'geographie');
    expect(qs.length).toBe(3);
    expect(qs[0]!.enonce).not.toContain('%20');
    const fausseTraduction = async (textes: string[]) => textes.map((t) => `[fr] ${t}`);
    const traduites = await traduireQuestions(qs, fausseTraduction);
    for (const q of traduites) {
      if (q.type === 'qcm') expect(q.choix).toContain(q.bonneReponse);
      expect(q.enonce.startsWith('[fr] ')).toBe(true);
    }
  });
});

describe('Deezer', () => {
  const piste = (id: number, title: string, artist: string): PisteDeezer => ({ id, title, preview: `https://cdn/${id}.mp3`, artist: { name: artist } });
  const chanson = { artiste: 'Joe Dassin', titre: 'Les Champs-Élysées', annee: 1969, epoque: '60-70' as const, style: 'variete' as const };
  it('préfère la version originale à un live ou une reprise', () => {
    const pistes = [piste(1, 'Les Champs-Elysées (Live)', 'Joe Dassin'), piste(2, 'Les Champs-Elysées', 'Autre Artiste'), piste(3, 'Les Champs-Elysées', 'Joe Dassin')];
    expect(choisirPiste(chanson, pistes)?.id).toBe(3);
  });
  it('rien si aucun résultat ne correspond', () => {
    expect(choisirPiste(chanson, [piste(9, 'Aline', 'Christophe')])).toBeUndefined();
  });
  it('retrouve l’identifiant de piste pour rafraîchir l’extrait', () => {
    expect(idPisteDepuisQuestion({ id: 'deezer-2243907797-titre' } as never)).toBe(2243907797);
    expect(idPisteDepuisQuestion({ id: 'loc-x' } as never)).toBeNull();
  });
});

describe('Wikidata : normalisation SPARQL', () => {
  const lit = (value: string) => ({ type: 'literal', value });
  const uri = (value: string) => ({ type: 'uri', value });
  it('dates, fichiers Commons, majuscules', () => {
    expect(anneeDepuisDate('1452-04-15T00:00:00Z')).toBe(1452);
    expect(anneeDepuisDate('-0469-01-01T00:00:00Z')).toBe(-469);
    expect(fichierCommons('http://commons.wikimedia.org/wiki/Special:FilePath/Mona%20Lisa.jpg')).toBe('Mona_Lisa.jpg');
    expect(majuscule('tour Eiffel')).toBe('Tour Eiffel');
  });
  it('fusionne les domaines d’une même personne et écarte les libellés sans nom', () => {
    const base = { p: uri('http://www.wikidata.org/entity/Q762'), nom: lit('Léonard de Vinci'), sl: lit('300'), nais: lit('1452-04-15T00:00:00Z'), precNais: lit('11'), image: uri('http://commons.wikimedia.org/wiki/Special:FilePath/X.jpg') };
    const r = normaliserPersonnes([
      { ...base, domaine: lit('peinture') },
      { ...base, domaine: lit('sciences') },
      { ...base, p: uri('http://www.wikidata.org/entity/Q1'), nom: lit('Q1'), domaine: lit('sciences') },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ nom: 'Léonard de Vinci', naissancePrecise: true, domaines: ['peinture', 'sciences'] });
  });
  it('écarte les événements dont le nom donne la date ou dont la date est future', () => {
    const e = (id: string, nom: string, date: string) => ({ e: uri(`http://www.wikidata.org/entity/${id}`), nom: lit(nom), sl: lit('80'), date: lit(date) });
    const r = normaliserEvenements([e('Q1', 'prise de la Bastille', '1789-07-14T00:00:00Z'), e('Q2', 'Coupe du monde 1998', '1998-06-10T00:00:00Z'), e('Q3', 'Guerre future', '2100-01-01T00:00:00Z')]);
    expect(r.map((x) => x.nom)).toEqual(['Prise de la Bastille']);
  });
  it('pays : euro forcé pour la zone euro, libellés corrigés', () => {
    const pays = (iso: string, nom: string, mon: string) => ({ c: uri('x'), iso: lit(iso), nom: lit(nom), sl: lit('100'), capitales: lit('Paris'), monnaies: lit(mon), continents: lit('Europe') });
    const r = normaliserPays([pays('FR', 'France', 'franc Pacifique'), pays('CN', 'république populaire de Chine', 'Renminbi')]);
    expect(r.find((x) => x.iso2 === 'fr')?.monnaies).toEqual(['euro']);
    expect(r.find((x) => x.iso2 === 'cn')).toMatchObject({ nom: 'Chine', monnaies: ['renminbi'] });
  });
});
