import { indexOfMax, shuffle } from "@lib/array";

const SEPERATOR = "|";
const split = (cardId: string) => cardId.split(SEPERATOR);
export const getValue = (cardId: string) => parseInt(split(cardId)[0], 10);
export const getSuit = (cardId: string) => split(cardId)[1];
export const getTuple = (cardId: string): [number, string] => [
  getValue(cardId),
  getSuit(cardId),
];

const combineAll = <T1, T2>(
  suits: T1[],
  values: T2[],
  seperator?: string
): string[] =>
  suits
    .map((s) => values.map((v) => [v, s].join(seperator || SEPERATOR)))
    .flat(1);

// ---

const getStandardDeck = () =>
  combineAll(
    ["c", "h", "s", "d"],
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  );

const getWizardDeck = () => combineAll(["w", "j"], [1, 2, 3, 4]);

// ---

const sortHand = (hand: string[], order = ["c", "d", "h", "s"]) => {
  const bySuit: { [key: string]: number[] } = {};
  const sortedHand: string[] = [];

  hand.forEach((cardId) => {
    let [value, suit] = getTuple(cardId);
    bySuit[suit] = bySuit[suit] || [];
    bySuit[suit].push(value);
  });

  order.forEach((suit) => {
    if (!bySuit[suit]) return;
    sortedHand.push(
      ...combineAll(
        [suit],
        bySuit[suit].sort((a, b) => a - b)
      )
    );
  });

  return sortedHand;
};

export const getDealtCards = (numPlayers: number, numCards: number) => {
  const deck = shuffle([...getStandardDeck(), ...getWizardDeck()]);
  const sortOrder = ["j", "c", "d", "h", "s", "w"];

  const hands = Array.from({ length: numPlayers })
    .map(() => {
      const hand: string[] = [];
      let i = 0;
      while (i < numCards) {
        let card = deck.pop();
        if (!card) throw new Error("Ran out of cards in the deck.");
        hand.push(card);
        i++;
      }
      return hand;
    })
    .map((hand) => sortHand(hand, sortOrder));

  const trumpCard = deck.pop() || null;

  const trumpSuit = typeof trumpCard === "string" ? getSuit(trumpCard) : null;

  return {
    hands,
    trumpCard,
    trumpSuit,
  } as const;
};

const getLeadSuit = (trick: string[]) =>
  trick.map(getSuit).find((suit) => suit !== "j");

const winnerWithinSuit = (trick: string[], suit: string) => {
  const adjustedValues = trick.map((card) =>
    getSuit(card) === suit ? getValue(card) : -1
  );
  return indexOfMax(adjustedValues);
};

export const getWinningIndex = (
  trick: string[],
  trumpSuit: string | null | undefined
) => {
  const suits = trick.map(getSuit);

  // First wizard wins
  const firstWizardIndex = suits.indexOf("w");
  if (firstWizardIndex !== -1) return firstWizardIndex;

  // Highest trump wins
  const trumpSuitPlayed =
    trumpSuit && !["w", "j"].includes(trumpSuit) && suits.includes(trumpSuit);
  if (trumpSuitPlayed) return winnerWithinSuit(trick, trumpSuit);

  // Highest of led suit wins
  const leadSuit = getLeadSuit(trick);
  if (leadSuit && leadSuit !== "w") return winnerWithinSuit(trick, leadSuit);

  // Lead card wins (must be all jesters!)
  return 0;
};

export const getPlayableCards = (hand: string[], trick: string[]) => {
  if (trick.length === 0) return hand;

  const leadSuit = getLeadSuit(trick);
  if (!leadSuit || leadSuit === "w") return hand;

  const handSuits = hand.map(getSuit);
  if (!handSuits.includes(leadSuit)) return hand;

  const playableSuits = new Set([leadSuit, "w", "j"]);
  return hand.filter((_, i) => playableSuits.has(handSuits[i]));
};

export const isValidBid = (
  bid: number,
  {
    canadian = false,
    bids,
    turn,
  }: {
    canadian?: boolean;
    bids: (number | null)[];
    turn: number;
  }
) => {
  const isInRange = bid >= 0 && bid <= turn;
  if (!isInRange) return false;

  if (!canadian) return true;

  const isLastBid = bids.filter((bid) => bid === null).length === 1;
  if (!isLastBid) return true;

  const totalBids =
    bid +
    bids
      .map((thisBid) => (thisBid === null ? 0 : thisBid))
      .reduce((total, thisBid) => total + thisBid, 0);

  return totalBids !== turn;
};
