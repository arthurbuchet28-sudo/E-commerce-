import { describe, expect, it } from 'vitest';
import { dueForReview, recordAnswer, worstSituations } from './srs';
import { allSituations, cardsForSituation, randomSituation } from './situations';
import { classify } from './strategy';
import { mulberry32 } from './rng';

describe('répétition espacée', () => {
  it('une erreur renvoie en boîte 1, une réussite fait monter', () => {
    let s = recordAnswer({}, 'hard:16:10', false, 0);
    expect(s['hard:16:10']).toMatchObject({ box: 1, errors: 1, seen: 1, due: 3 });
    s = recordAnswer(s, 'hard:16:10', true, 5);
    expect(s['hard:16:10'].box).toBe(2);
    s = recordAnswer(s, 'hard:16:10', false, 6);
    expect(s['hard:16:10'].box).toBe(1);
  });

  it('les situations ratées reviennent quand elles sont dues', () => {
    let s = recordAnswer({}, 'a', false, 0);
    s = recordAnswer(s, 'b', true, 0);
    expect(dueForReview(s, 1)).toEqual([]);
    expect(dueForReview(s, 3)).toEqual(['a']);
  });

  it('classement des pires situations', () => {
    let s = recordAnswer({}, 'a', false, 0);
    s = recordAnswer(s, 'a', true, 1);
    s = recordAnswer(s, 'b', false, 0);
    expect(worstSituations(s).map((x) => x.key)).toEqual(['b', 'a']);
  });
});

describe('génération de situations', () => {
  it('les cartes générées correspondent à la situation', () => {
    const rng = mulberry32(11);
    for (const s of allSituations()) {
      const { player, dealer } = cardsForSituation(s, rng);
      const c = classify(player, dealer);
      expect(c).toEqual(s);
    }
    for (let i = 0; i < 200; i++) {
      const s = randomSituation(rng);
      const { player, dealer } = cardsForSituation(s, rng);
      expect(classify(player, dealer)).toEqual(s);
    }
  });
});
