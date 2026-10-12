import { type Card, upValue, isTenValue } from './cards';
import { hiLoValue, trueCount, type TrueCountMethod } from './count';
import { type CountedDecision, countedDecisionForCards, shouldTakeInsurance } from './deviations';
import { handValue, isBlackjack, isPair } from './hand';
import { type Rng, defaultRng } from './rng';
import { type TableRules } from './rules';
import { Shoe } from './shoe';
import { type Action, type PlayOptions, basicStrategy } from './strategy';

export type HandResult = 'blackjack' | 'win' | 'push' | 'lose' | 'bust' | 'surrender';

export interface PlayerHand {
  cards: Card[];
  bet: number;
  doubled: boolean;
  surrendered: boolean;
  fromSplit: boolean;
  splitAces: boolean;
  done: boolean;
  result?: HandResult;
  /** Gain net de la main (en unités de mise). */
  net?: number;
}

export interface Seat {
  id: number;
  name: string;
  isHuman: boolean;
  hands: PlayerHand[];
  activeHand: number;
  insurance: number;
  insuranceNet: number;
}

export type Phase = 'betting' | 'insurance' | 'playing' | 'dealer' | 'roundOver';

export interface DecisionRecord {
  round: number;
  kind: 'play' | 'insurance';
  description: string;
  taken: Action | 'Ins' | 'NoIns';
  expected: Action | 'Ins' | 'NoIns';
  basic: Action | 'Ins' | 'NoIns';
  trueCount: number;
  correct: boolean;
  deviationId?: string;
}

export interface GameOptions {
  rules: TableRules;
  virtualPlayers: number;
  bankroll: number;
  tcMethod?: TrueCountMethod;
  rng?: Rng;
}

/**
 * Moteur de table : sabot, sièges (humain + joueurs virtuels en stratégie de base), croupier.
 * Les actions automatiques (joueurs virtuels, croupier) s'exécutent pas à pas via `step()`
 * pour que l'interface puisse les animer et laisser le temps de compter.
 */
export class BlackjackGame {
  readonly rules: TableRules;
  readonly shoe: Shoe;
  readonly tcMethod: TrueCountMethod;
  seats: Seat[] = [];
  dealerCards: Card[] = [];
  holeRevealed = false;
  phase: Phase = 'betting';
  turn = -1;
  bankroll: number;
  round = 0;
  /** Running count des cartes VISIBLES depuis le dernier mélange. */
  runningCount = 0;
  /** Nombre de cartes visibles depuis le dernier mélange. */
  seenCards = 0;
  shuffledThisRound = false;
  decisions: DecisionRecord[] = [];
  lastRoundNet = 0;
  private humanSeatIndex: number;

  constructor(opts: GameOptions) {
    this.rules = opts.rules;
    this.tcMethod = opts.tcMethod ?? 'floor';
    this.shoe = new Shoe(opts.rules.decks, opts.rules.penetration, opts.rng ?? defaultRng);
    this.bankroll = opts.bankroll;
    const n = Math.max(0, Math.min(5, opts.virtualPlayers));
    // L'humain est placé au milieu : certains joueurs jouent avant lui, d'autres après.
    this.humanSeatIndex = Math.floor(n / 2);
    let virtualNo = 1;
    for (let i = 0; i <= n; i++) {
      const isHuman = i === this.humanSeatIndex;
      this.seats.push({
        id: i,
        name: isHuman ? 'Vous' : `Joueur ${virtualNo++}`,
        isHuman,
        hands: [],
        activeHand: 0,
        insurance: 0,
        insuranceNet: 0,
      });
    }
  }

  get human(): Seat {
    return this.seats[this.humanSeatIndex];
  }

  get dealerUpCard(): Card | undefined {
    return this.dealerCards[0];
  }

  /** Jeux non encore vus (y compris la carte cachée), en valeur exacte. */
  get decksRemaining(): number {
    return (this.shoe.totalCards - this.seenCards) / 52;
  }

  get trueCount(): number {
    return trueCount(this.runningCount, this.decksRemaining, this.tcMethod);
  }

  get exactTrueCount(): number {
    return trueCount(this.runningCount, this.decksRemaining, 'exact');
  }

  private see(card: Card): void {
    this.runningCount += hiLoValue(card);
    this.seenCards++;
  }

  private drawVisible(): Card {
    const c = this.shoe.draw();
    this.see(c);
    return c;
  }

  /** Lance une nouvelle main. `bet` = mise de l'humain. */
  startRound(bet: number): void {
    if (this.phase !== 'betting' && this.phase !== 'roundOver') throw new Error('Une main est déjà en cours');
    if (bet <= 0) throw new Error('La mise doit être positive');
    this.shuffledThisRound = false;
    if (this.shoe.needsShuffle) {
      this.shoe.shuffle();
      this.runningCount = 0;
      this.seenCards = 0;
      this.shuffledThisRound = true;
    }
    this.round++;
    this.lastRoundNet = 0;
    this.holeRevealed = false;
    this.dealerCards = [];
    for (const seat of this.seats) {
      seat.hands = [
        { cards: [], bet: seat.isHuman ? bet : 1, doubled: false, surrendered: false, fromSplit: false, splitAces: false, done: false },
      ];
      seat.activeHand = 0;
      seat.insurance = 0;
      seat.insuranceNet = 0;
    }
    // Distribution : une carte à chacun, carte visible du croupier, deuxième carte, carte cachée.
    for (const seat of this.seats) seat.hands[0].cards.push(this.drawVisible());
    this.dealerCards.push(this.drawVisible());
    for (const seat of this.seats) seat.hands[0].cards.push(this.drawVisible());
    this.dealerCards.push(this.shoe.draw()); // carte cachée : pas encore comptée

    for (const seat of this.seats) {
      const h = seat.hands[0];
      if (isBlackjack(h.cards)) h.done = true;
    }

    if (this.dealerCards[0].rank === 'A') {
      this.phase = 'insurance';
      return;
    }
    this.peekAndContinue();
  }

  /** Décision d'assurance de l'humain (les joueurs virtuels la refusent toujours). */
  decideInsurance(take: boolean): void {
    if (this.phase !== 'insurance') throw new Error("L'assurance n'est pas proposée");
    const tc = this.trueCount;
    const expected = shouldTakeInsurance(tc) ? 'Ins' : 'NoIns';
    this.decisions.push({
      round: this.round,
      kind: 'insurance',
      description: 'Assurance (croupier As)',
      taken: take ? 'Ins' : 'NoIns',
      expected,
      basic: 'NoIns',
      trueCount: tc,
      correct: (take ? 'Ins' : 'NoIns') === expected,
      deviationId: expected === 'Ins' ? 'ins' : undefined,
    });
    if (take) this.human.insurance = this.human.hands[0].bet / 2;
    this.peekAndContinue();
  }

  private dealerHasBlackjack(): boolean {
    return isBlackjack(this.dealerCards);
  }

  private peekAndContinue(): void {
    const up = this.dealerCards[0];
    const mustPeek = up.rank === 'A' || isTenValue(up);
    for (const seat of this.seats) {
      if (seat.insurance > 0) {
        seat.insuranceNet = mustPeek && this.dealerHasBlackjack() ? seat.insurance * 2 : -seat.insurance;
      }
    }
    if (mustPeek && this.dealerHasBlackjack()) {
      this.revealHole();
      this.settle();
      return;
    }
    this.phase = 'playing';
    this.turn = -1;
    this.advanceTurn();
  }

  private revealHole(): void {
    if (!this.holeRevealed) {
      this.holeRevealed = true;
      this.see(this.dealerCards[1]);
    }
  }

  /** Passe à la prochaine main qui attend une décision. */
  private advanceTurn(): void {
    while (true) {
      if (this.turn >= 0 && this.turn < this.seats.length) {
        const seat = this.seats[this.turn];
        while (seat.activeHand < seat.hands.length) {
          const hand = seat.hands[seat.activeHand];
          if (hand.cards.length === 1) {
            // Deuxième carte d'une main issue d'une séparation.
            hand.cards.push(this.drawVisible());
            if (hand.splitAces) hand.done = true;
            else if (handValue(hand.cards).total === 21) hand.done = true;
          }
          if (!hand.done) return;
          seat.activeHand++;
        }
      }
      this.turn++;
      if (this.turn >= this.seats.length) {
        this.phase = 'dealer';
        return;
      }
      this.seats[this.turn].activeHand = 0;
    }
  }

  get currentSeat(): Seat | undefined {
    return this.phase === 'playing' ? this.seats[this.turn] : undefined;
  }

  get currentHand(): PlayerHand | undefined {
    const seat = this.currentSeat;
    return seat ? seat.hands[seat.activeHand] : undefined;
  }

  get isHumanTurn(): boolean {
    return this.phase === 'playing' && !!this.currentSeat?.isHuman;
  }

  /** Vrai si l'interface doit appeler `step()` (joueur virtuel ou croupier). */
  get needsAutoStep(): boolean {
    return (this.phase === 'playing' && !this.currentSeat?.isHuman) || this.phase === 'dealer';
  }

  optionsFor(seat: Seat, hand: PlayerHand): PlayOptions {
    const two = hand.cards.length === 2;
    return {
      canDouble: two && !hand.splitAces && (!hand.fromSplit || this.rules.doubleAfterSplit),
      canSplit:
        two &&
        isPair(hand.cards) &&
        seat.hands.length < this.rules.maxHands &&
        (!hand.splitAces || this.rules.resplitAces),
      canSurrender: two && this.rules.lateSurrender && seat.hands.length === 1 && !hand.fromSplit,
    };
  }

  legalActions(): Action[] {
    const seat = this.currentSeat;
    const hand = this.currentHand;
    if (!seat || !hand) return [];
    const o = this.optionsFor(seat, hand);
    const actions: Action[] = ['H', 'S'];
    if (o.canDouble) actions.push('D');
    if (o.canSplit) actions.push('P');
    if (o.canSurrender) actions.push('R');
    return actions;
  }

  /** Recommandation pour la main humaine courante (stratégie de base + déviations). */
  recommendation(): CountedDecision | undefined {
    if (!this.isHumanTurn) return undefined;
    const seat = this.currentSeat!;
    const hand = this.currentHand!;
    return countedDecisionForCards(hand.cards, this.dealerCards[0], this.trueCount, this.rules, this.optionsFor(seat, hand));
  }

  /** Action de l'humain. */
  act(action: Action): void {
    if (!this.isHumanTurn) throw new Error("Ce n'est pas votre tour");
    if (!this.legalActions().includes(action)) throw new Error(`Action interdite : ${action}`);
    const rec = this.recommendation()!;
    const hand = this.currentHand!;
    const v = handValue(hand.cards);
    this.decisions.push({
      round: this.round,
      kind: 'play',
      description: `${isPair(hand.cards) ? 'Paire' : v.soft ? 'Soft' : 'Dur'} ${v.total} (${hand.cards.map((c) => c.rank).join(',')}) contre ${this.dealerCards[0].rank}`,
      taken: action,
      expected: rec.action,
      basic: rec.basic,
      trueCount: this.trueCount,
      correct: action === rec.action,
      deviationId: rec.deviation?.id,
    });
    this.apply(this.currentSeat!, action);
  }

  /** Exécute une action automatique (joueur virtuel ou croupier). Renvoie faux s'il n'y a rien à faire. */
  step(): boolean {
    if (this.phase === 'playing') {
      const seat = this.currentSeat!;
      if (seat.isHuman) return false;
      const hand = this.currentHand!;
      const action = basicStrategy(hand.cards, this.dealerCards[0], this.rules, this.optionsFor(seat, hand));
      this.apply(seat, action);
      return true;
    }
    if (this.phase === 'dealer') {
      if (!this.holeRevealed) {
        this.revealHole();
        if (!this.anyLiveHand()) this.settle();
        return true;
      }
      if (this.dealerShouldHit()) {
        this.dealerCards.push(this.drawVisible());
        return true;
      }
      this.settle();
      return true;
    }
    return false;
  }

  /** Fait jouer toutes les actions automatiques jusqu'au tour de l'humain ou la fin de la main. */
  runAuto(): void {
    let guard = 0;
    while (this.needsAutoStep && guard++ < 500) this.step();
  }

  private anyLiveHand(): boolean {
    return this.seats.some((s) =>
      s.hands.some((h) => !h.surrendered && handValue(h.cards).total <= 21 && !(isBlackjack(h.cards) && !h.fromSplit && s.hands.length === 1)),
    );
  }

  dealerShouldHit(): boolean {
    const v = handValue(this.dealerCards);
    if (v.total < 17) return true;
    if (v.total === 17 && v.soft && this.rules.dealerHitsSoft17) return true;
    return false;
  }

  private apply(seat: Seat, action: Action): void {
    const hand = seat.hands[seat.activeHand];
    switch (action) {
      case 'H': {
        hand.cards.push(this.drawVisible());
        const t = handValue(hand.cards).total;
        if (t >= 21) hand.done = true;
        break;
      }
      case 'S':
        hand.done = true;
        break;
      case 'D':
        hand.bet *= 2;
        hand.doubled = true;
        hand.cards.push(this.drawVisible());
        hand.done = true;
        break;
      case 'R':
        hand.surrendered = true;
        hand.done = true;
        break;
      case 'P': {
        const aces = hand.cards[0].rank === 'A';
        const second = hand.cards.pop()!;
        hand.fromSplit = true;
        hand.splitAces = aces;
        const newHand: PlayerHand = {
          cards: [second],
          bet: hand.bet,
          doubled: false,
          surrendered: false,
          fromSplit: true,
          splitAces: aces,
          done: false,
        };
        seat.hands.splice(seat.activeHand + 1, 0, newHand);
        hand.cards.push(this.drawVisible());
        if (aces && !(this.rules.resplitAces && hand.cards[1].rank === 'A')) hand.done = true;
        else if (handValue(hand.cards).total === 21) hand.done = true;
        break;
      }
    }
    if (hand.done) {
      seat.activeHand++;
      this.advanceTurn();
    }
  }

  private settle(): void {
    this.revealHole();
    const dealerV = handValue(this.dealerCards);
    const dealerBJ = this.dealerHasBlackjack();
    const dealerBust = dealerV.total > 21;
    for (const seat of this.seats) {
      const natural = seat.hands.length === 1 && isBlackjack(seat.hands[0].cards);
      for (const h of seat.hands) {
        const pv = handValue(h.cards).total;
        if (h.surrendered) {
          h.result = 'surrender';
          h.net = -h.bet / 2;
        } else if (natural && !h.fromSplit) {
          h.result = dealerBJ ? 'push' : 'blackjack';
          h.net = dealerBJ ? 0 : h.bet * this.rules.blackjackPayout;
        } else if (dealerBJ) {
          h.result = 'lose';
          h.net = -h.bet;
        } else if (pv > 21) {
          h.result = 'bust';
          h.net = -h.bet;
        } else if (dealerBust || pv > dealerV.total) {
          h.result = 'win';
          h.net = h.bet;
        } else if (pv === dealerV.total) {
          h.result = 'push';
          h.net = 0;
        } else {
          h.result = 'lose';
          h.net = -h.bet;
        }
        h.done = true;
      }
      if (seat.isHuman) {
        const net = seat.hands.reduce((s, h) => s + (h.net ?? 0), 0) + seat.insuranceNet;
        this.lastRoundNet = net;
        this.bankroll += net;
      }
    }
    this.phase = 'roundOver';
    this.turn = -1;
  }

  /** Total visible du croupier (carte cachée exclue tant qu'elle n'est pas retournée). */
  dealerVisibleTotal(): number {
    return this.holeRevealed ? handValue(this.dealerCards).total : upValue(this.dealerCards[0]) === 11 ? 11 : handValue([this.dealerCards[0]]).total;
  }
}
