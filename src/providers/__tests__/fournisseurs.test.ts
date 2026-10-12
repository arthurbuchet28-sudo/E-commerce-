import { describe, expect, it, vi } from 'vitest';
import { CATEGORIES, type Question } from '@/types/question';
import { validerBanque } from '@/engine/validation';
import { banqueLocale, fournisseurLocal, normaliserFichierLocal } from '../local';
import { avecDelai, recupererQuestions } from '../registre';
import type { FournisseurQuestions } from '../types';

describe('fournisseur local', () => {
  it('normalise un fichier : source « local » et catégorie du fichier', () => {
    const [q] = normaliserFichierLocal({
      categorie: 'sport',
      questions: [{ id: 'x', type: 'qcm', difficulte: 1, enonce: 'Test ?', choix: ['a', 'b'], bonneReponse: 'a' }],
    });
    expect(q).toMatchObject({ id: 'x', source: 'local', categorie: 'sport' });
  });

  it('contient au moins 150 questions, toutes valides', () => {
    const banque = banqueLocale();
    expect(banque.length).toBeGreaterThanOrEqual(150);
    expect(validerBanque(banque)).toEqual([]);
  });

  it('couvre toutes les catégories et les 4 niveaux', () => {
    const banque = banqueLocale();
    for (const c of CATEGORIES) expect(banque.some((q) => q.categorie === c)).toBe(true);
    for (const n of [1, 2, 3, 4]) expect(banque.some((q) => q.difficulte === n)).toBe(true);
  });

  it('filtre par catégorie', async () => {
    const qs = await fournisseurLocal.recuperer({ categorie: 'histoire', niveaux: [1], nombre: 10 });
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.categorie === 'histoire')).toBe(true);
  });
});

function faux(id: string, comportement: () => Promise<Question[]>): FournisseurQuestions {
  return {
    id,
    nom: id,
    categories: CATEGORIES,
    actifParDefaut: true,
    horsLigne: false,
    partMax: 1,
    estDisponible: () => true,
    recuperer: comportement,
  };
}

describe('registre des fournisseurs', () => {
  it('bascule sur la banque locale si la source distante échoue', async () => {
    const enPanne = faux('panne', () => Promise.reject(new Error('réseau')));
    const qs = await recupererQuestions({ categorie: 'sport', niveaux: [1], nombre: 5 }, [enPanne]);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.source === 'local')).toBe(true);
  });

  it('abandonne une source trop lente', async () => {
    vi.useFakeTimers();
    const promesse = avecDelai(new Promise<number>(() => {}), 4000);
    vi.advanceTimersByTime(4001);
    await expect(promesse).rejects.toThrow('Délai dépassé');
    vi.useRealTimers();
  });

  it('ignore une source indisponible (clé absente)', async () => {
    const recuperer = vi.fn(() => Promise.resolve([]));
    const sansCle = { ...faux('cle', recuperer), estDisponible: () => false };
    await recupererQuestions({ categorie: 'sport', niveaux: [1], nombre: 5 }, [sansCle, fournisseurLocal]);
    expect(recuperer).not.toHaveBeenCalled();
  });
});

describe('quota des sources générées', () => {
  it('garde au plus partMax × nombre questions, en privilégiant le niveau demandé', async () => {
    const genere = (n: number): Question[] =>
      Array.from({ length: n }, (_, i) => ({
        id: `g${i}`,
        source: 'gen',
        categorie: 'sport',
        type: 'qcm',
        difficulte: ((i % 4) + 1) as 1 | 2 | 3 | 4,
        enonce: `Question générée ${i} ?`,
        choix: ['a', 'b'],
        bonneReponse: 'a',
      }));
    const recuperer = vi.fn(async (c: { nombre: number }) => genere(c.nombre));
    const source = { ...faux('gen', recuperer as never), horsLigne: true, partMax: 0.5 };
    const qs = await recupererQuestions({ categorie: 'sport', niveaux: [1], nombre: 10 }, [source]);
    expect(recuperer).toHaveBeenCalledWith(expect.objectContaining({ nombre: 15 }));
    expect(qs).toHaveLength(5);
    expect(qs.every((q) => q.difficulte === 1 || q.difficulte === 2)).toBe(true);
  });
});
