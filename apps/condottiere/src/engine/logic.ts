import { Core, Cards, Cities } from "./types";
import { cardNumbers, adjacencyList, handOrder } from "./glossary";
import {
  deal,
  indexOfMax,
  maxInt,
  rotateIndex,
  shuffle,
  sortBySpec,
} from "@lib/array";
import { getClusterSizes } from "@lib/graph";

export const createMap = () => {
  const map = {} as { [City in Cities]: null | number };
  (Object.keys(adjacencyList) as Cities[]).forEach((id) => {
    map[id] = null;
  });
  return map;
};

export const createDeck = () => {
  const deck: Cards[] = [];
  const parseNum = (arg: string) => {
    const parsed = Number(arg);
    return isNaN(parsed) ? arg : parsed;
  };
  Object.entries(cardNumbers).forEach(([card, num]) => {
    while (num > 0) {
      deck.push(parseNum(card) as Cards);
      num--;
    }
  });
  return deck;
};

export const createHands = (
  numPlayers: number,
  map: Core["map"],
  seed?: string
) => {
  const handSpecs = Array.from({ length: numPlayers }).map(() => 10);
  Object.values(map)
    .filter((control): control is number => control !== null && control > -1)
    .forEach((controllingPlayer) => {
      handSpecs[controllingPlayer] += 2;
    });

  const deck = shuffle(createDeck(), seed);

  return deal(deck, handSpecs).map((hand) => sortBySpec(hand, handOrder));
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
 * void = battle continues
 * -1 = battle is resolved with no victor
 * 0-6 = winningIndex
 */
export const getBattleStatus = (
  lines: Cards[][],
  playStatus: boolean[]
): number | void => {
  const cards = new Set(lines.flat());

  // Resolve bishop
  if (cards.has("b")) return -1;

  // Battle is scored and resolved if mayor has been played, or only one player has cards
  const battleIsOver =
    cards.has("m") || playStatus.filter((x) => x === true).length < 2;

  if (!battleIsOver) return;

  const isWinter = cards.has("w");
  const playerStrengths = lines.map((playerCards) =>
    getBattleStrength(playerCards, isWinter)
  );

  const winningIndex = indexOfMax(playerStrengths);
  const maxStrength = playerStrengths[winningIndex];
  const isTied = playerStrengths.filter((s) => s === maxStrength).length > 1;

  return !isTied ? winningIndex : -1;
};

export const isWinner = (map: Core["map"], numPlayers: number) => {
  const playerCities: Map<number, Cities[]> = new Map();

  Object.entries(map).forEach(([city, playerIndex]) => {
    if (playerIndex === null || playerIndex === -1) return;
    const cities = playerCities.get(playerIndex) || [];
    cities.push(city as Cities);
    playerCities.set(playerIndex, cities);
  });

  const adjScores = Array.from({ length: numPlayers }).map(() => 0);
  playerCities.forEach((cities, playerIndex) => {
    const adjCounts = getClusterSizes(cities, adjacencyList);
    adjScores[playerIndex] = maxInt(adjCounts);
  });

  const numToWin = numPlayers < 4 ? 4 : 3;
  const thereIsAWinner = adjScores.filter((n) => n === numToWin).length > 0;

  return thereIsAWinner ? indexOfMax(adjScores) : null;
};

export const getNextPlayer = (
  activePlayer: number,
  playStatus: Core["playStatus"]
) => {
  let nextPlayer = null;
  let lastTried = activePlayer;
  while (nextPlayer === null) {
    lastTried = rotateIndex(playStatus.length, lastTried);
    nextPlayer = playStatus[lastTried] === true ? lastTried : null;
  }
  return nextPlayer;
};

export const canDiscard = (hand: Cards[]) =>
  hand.filter((c) => typeof c === "number").length === 0;
