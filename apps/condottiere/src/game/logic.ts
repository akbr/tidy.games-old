import type { Cards, Cities } from "./glossary";
import { cardQuantities, cityAdjacencies, handOrder } from "./glossary";
import {
  deal,
  indexOfMax,
  maxInt,
  rotateIndex,
  shuffle,
  sortBySpec,
} from "@lib/array";
import { createPRNG } from "@lib/random/prng";
import { getClusterSizes } from "@lib/graph";
import { is } from "@lib/compare/is";

type InputMap = Partial<{ [City in Cities]: null | number }>;

export const createMap = () => {
  const map = {} as { [City in Cities]: null | number };
  (Object.keys(cityAdjacencies) as Cities[]).forEach((id) => {
    map[id] = null;
  });
  return map;
};

const parseNum = (x: string) => {
  const parsed = Number(x);
  return isNaN(parsed) ? x : parsed;
};
export const createDeck = () => {
  const deck: Cards[] = [];
  Object.entries(cardQuantities).forEach(([card, num]) => {
    let parsed = parseNum(card) as Cards;
    while (num > 0) {
      deck.push(parsed);
      num--;
    }
  });
  return deck;
};

export const sortHand = (hand: Cards[]) => sortBySpec(hand, handOrder);

export const getControlCount = (numPlayers: number, map: InputMap) => {
  const controlPerPlayer = Array.from({ length: numPlayers }, () => 0);
  Object.values(map)
    .filter((control): control is number => control !== null && control > -1)
    .forEach((controllingPlayer) => {
      controlPerPlayer[controllingPlayer] += 1;
    });
  return controlPerPlayer;
};

export const createHands = (
  numPlayers: number,
  map: InputMap,
  seed?: string
) => {
  const controlPerPlayer = getControlCount(numPlayers, map);
  const handSpecs = Array.from({ length: numPlayers }).map(
    (_, idx) => 10 + controlPerPlayer[idx] * 2
  );
  const deck = shuffle(createDeck(), seed ? createPRNG(seed) : undefined);
  return deal(deck, handSpecs).map(sortHand);
};

export const getBattleStrength = (line: Cards[], isWinter: boolean) => {
  const isDrumming = line.includes("d");

  const mercenaryStrength = (
    line.filter((c) => typeof c === "number") as number[]
  ).reduce((total, value) => {
    value = isWinter ? 1 : value;
    value = isDrumming ? value * 2 : value;
    return value + total;
  }, 0);

  const heroineStrength = line
    .filter((c) => c === "h")
    .reduce((total) => {
      let value = isWinter ? 10 : 1;
      return total + value;
    }, 0);

  return mercenaryStrength + heroineStrength;
};

/**
 * null = battle continues
 * -1 = battle is a tie
 * 0-6 = index of winning player
 */
export const getBattleStatus = (
  lines: Cards[][],
  playerStatuses: boolean[]
): number | null => {
  const cards = new Set(lines.flat());

  // If bishop, battle is tie
  if (cards.has("b")) return -1;

  // Battle should be scored if mayor has been played, or less than two active players
  const battleIsOver =
    cards.has("m") || playerStatuses.filter((x) => x === true).length < 2;

  if (!battleIsOver) return null;

  // Score the battle
  const isWinter = cards.has("w");
  const playerStrengths = lines.map((playerCards) =>
    getBattleStrength(playerCards, isWinter)
  );

  const winningIndex = indexOfMax(playerStrengths);
  const maxStrength = playerStrengths[winningIndex];
  const isTied = playerStrengths.filter((s) => s === maxStrength).length > 1;

  if (isTied) return -1;

  return winningIndex;
};

export const getWinner = (map: InputMap, numPlayers: number) => {
  const playerCities: Map<number, Cities[]> = new Map();

  Object.entries(map).forEach(([city, controllingPlayer]) => {
    if (controllingPlayer === null || controllingPlayer === -1) return;
    const cities = playerCities.get(controllingPlayer) || [];
    cities.push(city as Cities);
    playerCities.set(controllingPlayer, cities);
  });

  const adjScores = Array.from({ length: numPlayers }).map(() => 0);
  playerCities.forEach((cities, playerIndex) => {
    const adjCounts = getClusterSizes(cities, cityAdjacencies);
    adjScores[playerIndex] = maxInt(adjCounts);
  });

  const numToWin = numPlayers < 4 ? 4 : 3;
  const thereIsAWinner = adjScores.filter((n) => n === numToWin).length > 0;

  if (thereIsAWinner) {
    return indexOfMax(adjScores);
  }

  return null;
};

export const getNextPlayer = (
  activePlayer: number,
  playerStatuses: boolean[]
) => {
  if (!playerStatuses.includes(true)) return null;
  let nextPlayer = null;
  let lastTried = activePlayer;
  while (nextPlayer === null) {
    lastTried = rotateIndex(playerStatuses.length, lastTried, 1);
    nextPlayer = playerStatuses[lastTried] === true ? lastTried : null;
  }
  return nextPlayer;
};

export const canDiscard = (hand: Cards[]) =>
  is.undefined(hand.find((c) => typeof c === "number"));
