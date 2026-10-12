import { describe, expect, it } from 'vitest';
import { REFERENCE_RULES, type TableRules } from './rules';
import { basicStrategy, basicStrategyFor, buildCharts, situationAction, type PlayOptions } from './strategy';
import type { Card, UpValue } from './cards';

const all: PlayOptions = { canDouble: true, canSplit: true, canSurrender: true };
const R = REFERENCE_RULES;
const H17: TableRules = { ...R, dealerHitsSoft17: true };
const NODAS: TableRules = { ...R, doubleAfterSplit: false };
const NOLS: TableRules = { ...R, lateSurrender: false };

const hard = (total: number, d: UpValue, rules = R, opts = all) => basicStrategyFor({ total, soft: false, dealer: d }, rules, opts);
const soft = (total: number, d: UpValue, rules = R, opts = all) => basicStrategyFor({ total, soft: true, dealer: d }, rules, opts);
const pair = (v: number, d: UpValue, rules = R) => situationAction({ kind: 'pair', value: v, dealer: d }, rules, all);
const card = (rank: string): Card => ({ rank, suit: '♣' }) as Card;

/** Ligne attendue d'un tableau, colonnes 2,3,4,5,6,7,8,9,10,A. */
const row = (s: string) => s.split(' ');
const D: UpValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

describe('stratégie de base — mains dures (6 jeux, S17, DAS, LS)', () => {
  const expected: Record<number, string> = {
    8: 'H H H H H H H H H H',
    9: 'H D D D D H H H H H',
    10: 'D D D D D D D D H H',
    11: 'D D D D D D D D D H',
    12: 'H H S S S H H H H H',
    13: 'S S S S S H H H H H',
    14: 'S S S S S H H H H H',
    15: 'S S S S S H H H R H',
    16: 'S S S S S H H R R R',
    17: 'S S S S S S S S S S',
  };
  for (const [total, line] of Object.entries(expected)) {
    it(`dur ${total}`, () => {
      expect(D.map((d) => hard(Number(total), d))).toEqual(row(line));
    });
  }
  it('sans abandon : 16 contre 10 → tirer', () => {
    expect(hard(16, 10, NOLS)).toBe('H');
  });
  it('après trois cartes, on ne double plus : 11 → tirer', () => {
    expect(hard(11, 6, R, { canDouble: false, canSplit: false, canSurrender: false })).toBe('H');
  });
  it('H17 : 11 contre As → doubler ; 15 et 17 contre As → abandon', () => {
    expect(hard(11, 11, H17)).toBe('D');
    expect(hard(15, 11, H17)).toBe('R');
    expect(hard(17, 11, H17)).toBe('R');
  });
});

describe('stratégie de base — mains soft', () => {
  const expected: Record<number, string> = {
    13: 'H H H D D H H H H H',
    14: 'H H H D D H H H H H',
    15: 'H H D D D H H H H H',
    16: 'H H D D D H H H H H',
    17: 'H D D D D H H H H H',
    18: 'S D D D D S S H H H',
    19: 'S S S S S S S S S S',
    20: 'S S S S S S S S S S',
  };
  for (const [total, line] of Object.entries(expected)) {
    it(`soft ${total}`, () => {
      expect(D.map((d) => soft(Number(total), d))).toEqual(row(line));
    });
  }
  it('A,7 contre 3 sans pouvoir doubler → rester (Ds)', () => {
    expect(soft(18, 3, R, { canDouble: false, canSplit: false, canSurrender: false })).toBe('S');
  });
  it('A,6 contre 3 sans pouvoir doubler → tirer (D)', () => {
    expect(soft(17, 3, R, { canDouble: false, canSplit: false, canSurrender: false })).toBe('H');
  });
  it('H17 : A,7 contre 2 et A,8 contre 6 → doubler', () => {
    expect(soft(18, 2, H17)).toBe('D');
    expect(soft(19, 6, H17)).toBe('D');
  });
});

describe('stratégie de base — paires', () => {
  const expected: Record<number, string> = {
    2: 'P P P P P P H H H H',
    3: 'P P P P P P H H H H',
    4: 'H H H P P H H H H H',
    5: 'D D D D D D D D H H',
    6: 'P P P P P H H H H H',
    7: 'P P P P P P H H H H',
    8: 'P P P P P P P P P P',
    9: 'P P P P P S P P S S',
    10: 'S S S S S S S S S S',
    11: 'P P P P P P P P P P',
  };
  for (const [v, line] of Object.entries(expected)) {
    it(`paire de ${v === '11' ? 'As' : v}`, () => {
      expect(D.map((d) => pair(Number(v), d))).toEqual(row(line));
    });
  }
  it('sans DAS : 2,2 contre 2 → tirer, 4,4 contre 5 → tirer, 6,6 contre 2 → tirer', () => {
    expect(pair(2, 2, NODAS)).toBe('H');
    expect(pair(4, 5, NODAS)).toBe('H');
    expect(pair(6, 2, NODAS)).toBe('H');
    expect(pair(6, 3, NODAS)).toBe('P');
  });
  it('H17 : 8,8 contre As → abandon', () => {
    expect(pair(8, 11, H17)).toBe('R');
    expect(pair(8, 11, R)).toBe('P');
  });
  it('fonctionne avec des cartes réelles (K et 10 = paire de 10)', () => {
    expect(basicStrategy([card('K'), card('10')], card('6'), R, all)).toBe('S');
    expect(basicStrategy([card('8'), card('8')], card('10'), R, all)).toBe('P');
    expect(basicStrategy([card('10'), card('6')], card('10'), R, all)).toBe('R');
    expect(basicStrategy([card('5'), card('4'), card('7')], card('10'), R, { canDouble: false, canSplit: false, canSurrender: false })).toBe('H');
  });
});

describe('tableaux affichés', () => {
  it('contiennent toutes les lignes', () => {
    const c = buildCharts(R);
    expect(c.hard).toHaveLength(10);
    expect(c.soft).toHaveLength(8);
    expect(c.pairs).toHaveLength(10);
    expect(c.surrender).toHaveLength(4);
    expect(c.surrender[1].cells[8]).toBe('R'); // 16 contre 10
  });
});
