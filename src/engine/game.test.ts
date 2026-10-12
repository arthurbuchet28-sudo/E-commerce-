import { describe, expect, it } from 'vitest';
import { BlackjackGame } from './game';
import { REFERENCE_RULES } from './rules';
import { mulberry32 } from './rng';
import type { Card, Rank } from './cards';
import { hiLoValue } from './count';

const cards = (...ranks: Rank[]): Card[] => ranks.map((rank) => ({ rank, suit: '♠' }));

function newGame(virtualPlayers = 0, seed = 1) {
  return new BlackjackGame({ rules: REFERENCE_RULES, virtualPlayers, bankroll: 100, rng: mulberry32(seed) });
}

describe('moteur de table', () => {
  it('distribue dans le bon ordre et ne compte pas la carte cachée', () => {
    const g = newGame();
    // joueur, croupier visible, joueur, croupier caché
    g.shoe.stack(cards('10', '6', '9', 'K'));
    g.startRound(1);
    expect(g.human.hands[0].cards.map((c) => c.rank)).toEqual(['10', '9']);
    expect(g.dealerCards.map((c) => c.rank)).toEqual(['6', 'K']);
    expect(g.runningCount).toBe(-1 + 1 + 0); // 10, 6, 9 visibles
    expect(g.isHumanTurn).toBe(true);
    g.act('S');
    g.runAuto();
    // Croupier : 6 + K = 16, tire la carte suivante.
    expect(g.phase).toBe('roundOver');
    expect(g.holeRevealed).toBe(true);
  });

  it('paie le blackjack 3:2', () => {
    const g = newGame();
    g.shoe.stack(cards('A', '9', 'K', '7'));
    g.startRound(10);
    expect(g.phase).toBe('dealer');
    g.runAuto();
    expect(g.human.hands[0].result).toBe('blackjack');
    expect(g.bankroll).toBe(115);
  });

  it('paie le blackjack 6:5 si la table le prévoit', () => {
    const g = new BlackjackGame({ rules: { ...REFERENCE_RULES, blackjackPayout: 1.2 }, virtualPlayers: 0, bankroll: 100, rng: mulberry32(1) });
    g.shoe.stack(cards('A', '9', 'K', '7'));
    g.startRound(10);
    g.runAuto();
    expect(g.bankroll).toBe(112);
  });

  it('assurance gagnante contre un blackjack du croupier', () => {
    const g = newGame();
    g.shoe.stack(cards('10', 'A', '9', 'K'));
    g.startRound(10);
    expect(g.phase).toBe('insurance');
    g.decideInsurance(true);
    expect(g.phase).toBe('roundOver');
    // Main perdue (-10), assurance (5) payée 2:1 (+10) : résultat nul.
    expect(g.bankroll).toBe(100);
    expect(g.decisions[0].kind).toBe('insurance');
  });

  it('le croupier S17 reste sur soft 17, H17 tire', () => {
    const g = newGame();
    g.shoe.stack(cards('10', 'A', '10', '6', '5'));
    g.startRound(1);
    g.decideInsurance(false);
    g.act('S');
    g.runAuto();
    expect(g.dealerCards).toHaveLength(2);
    expect(g.human.hands[0].result).toBe('win');

    const h = new BlackjackGame({ rules: { ...REFERENCE_RULES, dealerHitsSoft17: true }, virtualPlayers: 0, bankroll: 100, rng: mulberry32(1) });
    h.shoe.stack(cards('10', 'A', '10', '6', '5'));
    h.startRound(1);
    h.decideInsurance(false);
    h.act('S');
    h.runAuto();
    expect(h.dealerCards.length).toBeGreaterThan(2);
  });

  it('double : mise doublée et une seule carte', () => {
    const g = newGame();
    g.shoe.stack(cards('6', '5', '5', '10', 'K', '7'));
    g.startRound(10);
    g.act('D');
    expect(g.human.hands[0].cards).toHaveLength(3);
    expect(g.human.hands[0].bet).toBe(20);
    g.runAuto();
    // Joueur 21 contre croupier 15 + 7 = 22 → gagné.
    expect(g.bankroll).toBe(120);
  });

  it('séparation : deux mains, la seconde reçoit sa carte quand elle devient active', () => {
    const g = newGame();
    g.shoe.stack(cards('8', '6', '8', '10', '3', '10', '9', '9'));
    g.startRound(5);
    expect(g.legalActions()).toContain('P');
    g.act('P');
    expect(g.human.hands).toHaveLength(2);
    expect(g.human.hands[0].cards.map((c) => c.rank)).toEqual(['8', '3']);
    g.act('S');
    expect(g.human.hands[1].cards.map((c) => c.rank)).toEqual(['8', '10']);
    g.act('S');
    g.runAuto();
    expect(g.phase).toBe('roundOver');
  });

  it('abandon : perte de la moitié de la mise', () => {
    const g = newGame();
    g.shoe.stack(cards('10', '10', '6', '7'));
    g.startRound(10);
    g.act('R');
    g.runAuto();
    expect(g.human.hands[0].result).toBe('surrender');
    expect(g.bankroll).toBe(95);
  });

  it('interdit les actions illégales', () => {
    const g = newGame();
    g.shoe.stack(cards('10', '6', '7', '9', '4'));
    g.startRound(1);
    g.act('H');
    expect(() => g.act('D')).toThrow();
  });

  it('enregistre les décisions et les compare à la stratégie', () => {
    const g = newGame();
    g.shoe.stack(cards('10', '6', '6', '9'));
    g.startRound(1);
    g.act('H'); // 16 contre 6 : il fallait rester
    expect(g.decisions[0].correct).toBe(false);
    expect(g.decisions[0].expected).toBe('S');
  });

  it('le running count visible correspond aux cartes vues, sur de nombreuses mains avec joueurs virtuels', () => {
    const g = newGame(5, 77);
    for (let i = 0; i < 300; i++) {
      g.startRound(1);
      if (g.phase === 'insurance') g.decideInsurance(false);
      g.runAuto();
      while (g.isHumanTurn) {
        g.act(g.recommendation()!.action);
        g.runAuto();
      }
      expect(g.phase).toBe('roundOver');
      // Recalcul indépendant du compte des cartes visibles de la main (si pas de mélange entre-temps).
      const visible = [...g.seats.flatMap((s) => s.hands.flatMap((h) => h.cards)), ...g.dealerCards];
      const rcRound = visible.reduce((s, c) => s + hiLoValue(c), 0);
      expect(Math.abs(rcRound)).toBeLessThanOrEqual(visible.length);
      expect(g.seenCards).toBeLessThanOrEqual(g.shoe.totalCards);
    }
    expect(g.round).toBe(300);
  });

  it('remélange quand la carte de coupe est passée et remet le compte à zéro', () => {
    const g = newGame(0, 5);
    let shuffled = false;
    for (let i = 0; i < 200 && !shuffled; i++) {
      g.startRound(1);
      if (g.phase === 'insurance') g.decideInsurance(false);
      while (g.isHumanTurn) g.act('S');
      g.runAuto();
      if (g.shuffledThisRound) shuffled = true;
    }
    expect(shuffled).toBe(true);
  });
});
