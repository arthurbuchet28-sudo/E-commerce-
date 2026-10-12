import { describe, expect, it } from 'vitest';
import { banqueLocale } from '@/providers/local';
import { depuisCsv, depuisJson, lireCsv, versCsv, versFichiersBanque } from '../import-export';

describe('CSV', () => {
  it('lit guillemets, séparateurs et retours à la ligne dans une cellule', () => {
    expect(lireCsv('a;b\n"x;1";"il dit ""oui""\nsuite"\n')).toEqual([
      ['a', 'b'],
      ['x;1', 'il dit "oui"\nsuite'],
    ]);
  });
  it('aller-retour sans perte sur toute la banque locale', () => {
    const banque = banqueLocale();
    const { questions, erreurs } = depuisCsv(versCsv(banque));
    expect(erreurs).toEqual([]);
    expect(questions).toHaveLength(banque.length);
    expect(questions).toEqual(banque.map((q) => ({ ...q, anecdote: q.anecdote })));
  });
  it('signale les lignes invalides sans bloquer les autres', () => {
    const csv =
      'categorie;type;difficulte;enonce;choix;bonneReponse;anecdote\n' +
      'sport;qcm;1;Question valide ?;A|B|C|D;A;Une anecdote suffisante.\n' +
      'sport;qcm;9;Niveau impossible ?;A|B;Z;Une anecdote suffisante.\n';
    const r = depuisCsv(csv);
    expect(r.questions).toHaveLength(1);
    expect(r.erreurs.join(' ')).toMatch(/ligne 3/);
  });
  it('refuse un fichier sans les colonnes requises', () => {
    expect(depuisCsv('a;b\n1;2').erreurs[0]).toMatch(/Colonnes manquantes/);
  });
});

describe('JSON', () => {
  it('accepte un tableau, un fichier de la banque ou une liste de fichiers', () => {
    const fichiers = versFichiersBanque(banqueLocale());
    expect(depuisJson(JSON.stringify(fichiers.histoire)).questions).toHaveLength(fichiers.histoire.questions.length);
    expect(depuisJson(JSON.stringify(Object.values(fichiers))).questions).toHaveLength(banqueLocale().length);
    expect(depuisJson(JSON.stringify(banqueLocale().slice(0, 3))).questions).toHaveLength(3);
  });
  it('signale un JSON invalide', () => {
    expect(depuisJson('{oups').erreurs[0]).toMatch(/JSON invalide/);
  });
  it('l’export par catégorie retire source et catégorie de chaque question', () => {
    const f = versFichiersBanque(banqueLocale()).sport.questions[0]!;
    expect(f).not.toHaveProperty('source');
    expect(f).not.toHaveProperty('categorie');
  });
});
