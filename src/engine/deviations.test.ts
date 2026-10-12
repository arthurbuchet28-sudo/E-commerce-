import { describe, expect, it } from 'vitest';
import { countedDecision, DEVIATIONS, shouldTakeInsurance } from './deviations';
import { REFERENCE_RULES, type TableRules } from './rules';
import type { PlayOptions } from './strategy';
import type { UpValue } from './cards';

const all: PlayOptions = { canDouble: true, canSplit: true, canSurrender: true };
const noSurr: PlayOptions = { ...all, canSurrender: false };
const R = REFERENCE_RULES;
const NOLS: TableRules = { ...R, lateSurrender: false };

const dec = (total: number, d: UpValue, tc: number, rules = R, opts = all, pairValue?: number) =>
  countedDecision({ total, soft: false, dealer: d, pairValue }, tc, rules, opts).action;

describe('Illustrious 18 & Fab 4', () => {
  it('liste 18 + 4 déviations', () => {
    expect(DEVIATIONS.filter((d) => d.group === 'I18')).toHaveLength(18);
    expect(DEVIATIONS.filter((d) => d.group === 'Fab4')).toHaveLength(4);
  });

  it('assurance à TC ≥ +3', () => {
    expect(shouldTakeInsurance(2)).toBe(false);
    expect(shouldTakeInsurance(3)).toBe(true);
  });

  it('16 contre 10 sans abandon : tirer si TC < 0, rester si TC ≥ 0', () => {
    expect(dec(16, 10, -1, NOLS)).toBe('H');
    expect(dec(16, 10, 0, NOLS)).toBe('S');
  });

  it('16 contre 10 avec abandon : abandonner', () => {
    expect(dec(16, 10, 3)).toBe('R');
    expect(dec(16, 10, -2)).toBe('R');
  });

  it('16 contre 10 après séparation (abandon impossible) : rester dès TC ≥ 0', () => {
    expect(dec(16, 10, 1, R, noSurr)).toBe('S');
  });

  it('15 contre 10 : abandon si TC ≥ 0, sinon tirer ; sans abandon, rester à +4', () => {
    expect(dec(15, 10, 0)).toBe('R');
    expect(dec(15, 10, -1)).toBe('H');
    expect(dec(15, 10, 4, NOLS)).toBe('S');
    expect(dec(15, 10, 3, NOLS)).toBe('H');
  });

  it('14 contre 10 : abandon à +3', () => {
    expect(dec(14, 10, 3)).toBe('R');
    expect(dec(14, 10, 2)).toBe('H');
  });

  it('15 contre 9 (+2) et 15 contre As (+1)', () => {
    expect(dec(15, 9, 2)).toBe('R');
    expect(dec(15, 9, 1)).toBe('H');
    expect(dec(15, 11, 1)).toBe('R');
    expect(dec(15, 11, 0)).toBe('H');
  });

  it('10,10 contre 5 (+5) et contre 6 (+4)', () => {
    expect(dec(20, 5, 5, R, all, 10)).toBe('P');
    expect(dec(20, 5, 4, R, all, 10)).toBe('S');
    expect(dec(20, 6, 4, R, all, 10)).toBe('P');
  });

  it('doubles : 10 contre 10 (+4), 11 contre As (+1), 9 contre 2 (+1), 9 contre 7 (+3), 10 contre As (+4)', () => {
    expect(dec(10, 10, 4)).toBe('D');
    expect(dec(10, 10, 3)).toBe('H');
    expect(dec(11, 11, 1)).toBe('D');
    expect(dec(11, 11, 0)).toBe('H');
    expect(dec(9, 2, 1)).toBe('D');
    expect(dec(9, 7, 3)).toBe('D');
    expect(dec(10, 11, 4)).toBe('D');
  });

  it('pas de double déviant quand doubler est impossible', () => {
    expect(dec(10, 10, 6, R, { canDouble: false, canSplit: false, canSurrender: false })).toBe('H');
  });

  it('12 contre 2 (+3), 12 contre 3 (+2)', () => {
    expect(dec(12, 2, 3)).toBe('S');
    expect(dec(12, 2, 2)).toBe('H');
    expect(dec(12, 3, 2)).toBe('S');
  });

  it('déviations négatives : 12 contre 4 (<0), 12 contre 5 (<-2), 12 contre 6 (<-1), 13 contre 2 (<-1), 13 contre 3 (<-2)', () => {
    expect(dec(12, 4, -1)).toBe('H');
    expect(dec(12, 4, 0)).toBe('S');
    expect(dec(12, 5, -3)).toBe('H');
    expect(dec(12, 5, -2)).toBe('S');
    expect(dec(12, 6, -2)).toBe('H');
    expect(dec(13, 2, -2)).toBe('H');
    expect(dec(13, 2, -1)).toBe('S');
    expect(dec(13, 3, -3)).toBe('H');
  });

  it('16 contre 9 sans abandon : rester à +5', () => {
    expect(dec(16, 9, 5, NOLS)).toBe('S');
    expect(dec(16, 9, 4, NOLS)).toBe('H');
    expect(dec(16, 9, 5)).toBe('R');
  });

  it('une paire de 8 contre 10 se sépare quel que soit le compte', () => {
    expect(dec(16, 10, 5, R, all, 8)).toBe('P');
  });

  it('les mains soft ne sont pas concernées', () => {
    expect(countedDecision({ total: 12, soft: true, dealer: 4 }, -5, R, all).action).toBe('H');
  });
});
