import { type Card, createDeck } from './cards';
import { type Rng, defaultRng, shuffleInPlace } from './rng';
import { hiLoValue } from './count';

/**
 * Sabot de N jeux avec carte de coupe (pénétration).
 * Le sabot suit lui-même le running count Hi-Lo des cartes SORTIES ;
 * le simulateur peut aussi compter uniquement les cartes visibles (carte cachée du croupier).
 */
export class Shoe {
  readonly decks: number;
  readonly penetration: number;
  private cards: Card[] = [];
  private position = 0;
  private rng: Rng;

  constructor(decks: number, penetration = 0.75, rng: Rng = defaultRng) {
    if (!Number.isInteger(decks) || decks < 1) throw new Error('Le nombre de jeux doit être un entier ≥ 1');
    if (penetration <= 0 || penetration > 1) throw new Error('La pénétration doit être comprise entre 0 et 1');
    this.decks = decks;
    this.penetration = penetration;
    this.rng = rng;
    this.shuffle();
  }

  /** Remet toutes les cartes dans le sabot et mélange. */
  shuffle(): void {
    const cards: Card[] = [];
    for (let d = 0; d < this.decks; d++) cards.push(...createDeck());
    this.cards = shuffleInPlace(cards, this.rng);
    this.position = 0;
  }

  get totalCards(): number {
    return this.decks * 52;
  }

  get cardsDealt(): number {
    return this.position;
  }

  get cardsRemaining(): number {
    return this.totalCards - this.position;
  }

  /** Jeux restants (valeur exacte, non arrondie). */
  get decksRemaining(): number {
    return this.cardsRemaining / 52;
  }

  /** Jeux déjà dans le bac de défausse (valeur exacte). */
  get decksDiscarded(): number {
    return this.position / 52;
  }

  /** Index de la carte de coupe. */
  get cutCardPosition(): number {
    return Math.floor(this.totalCards * this.penetration);
  }

  /** Vrai quand la carte de coupe est sortie : on termine la main puis on mélange. */
  get needsShuffle(): boolean {
    return this.position >= this.cutCardPosition;
  }

  /** Running count Hi-Lo de toutes les cartes sorties du sabot. */
  get runningCount(): number {
    let rc = 0;
    for (let i = 0; i < this.position; i++) rc += hiLoValue(this.cards[i]);
    return rc;
  }

  draw(): Card {
    if (this.position >= this.cards.length) {
      // Cas extrême (pénétration 100 % et longue main) : on remélange plutôt que d'échouer.
      this.shuffle();
    }
    return this.cards[this.position++];
  }

  /** Permet aux tests d'imposer l'ordre des prochaines cartes. */
  stack(cards: Card[]): void {
    this.cards.splice(this.position, cards.length, ...cards);
  }
}
