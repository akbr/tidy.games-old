import { expect, test } from "vitest";
import {
  canDiscard,
  createDeck,
  createHands,
  createMap,
  getBattleStatus,
  getBattleStrength,
  getNextPlayer,
  getWinner,
  sortHand,
} from "./logic";

test("creates a map", () => {
  const map = createMap();
  const keys = Object.keys(map);
  const values = Object.values(map);
  expect(keys.length).toEqual(17);
  expect(values.filter((x) => x === null).length).toEqual(17);
});

test("creates a deck", () => {
  const deck = createDeck();
  expect(deck.length).toEqual(96);
});

test("sorts a hand", () => {
  expect(sortHand([1, "m", 10, 1, 2, "s"])).toEqual(["s", 1, 1, 2, 10, "m"]);
});

test("creates hands", () => {
  const hands = createHands(3, { tor: 1, mil: 2, ven: 2 });
  expect(hands[0].length).toBe(10);
  expect(hands[1].length).toBe(12);
  expect(hands[2].length).toBe(14);
});

test("gets battle strengths", () => {
  expect(getBattleStrength([1, 2, 3], false)).toBe(6);
  expect(getBattleStrength([1, 2, 3, "d"], false)).toBe(12);
  expect(getBattleStrength([1, 2, 3], true)).toBe(3);
  expect(getBattleStrength([1, 2, 3, "d"], true)).toBe(6);
});

test("gets battle status", () => {
  expect(getBattleStatus([[1], [1], [1]], [true, true, false])).toBe(null);
  expect(getBattleStatus([[1], [1], [1]], [true, false, false])).toBe(-1);
  expect(getBattleStatus([[1], [1], [2]], [true, false, false])).toBe(2);
  expect(
    getBattleStatus(
      [
        [1, "h"],
        [1, "w"],
        [2, 10, 10],
      ],
      [true, false, false]
    )
  ).toBe(0);
});

test("gets a winner", () => {
  expect(getWinner({}, 2)).toBe(null);
  expect(getWinner({ sie: 0, rom: 0, spo: 0 }, 2)).toBe(null);
  expect(getWinner({ sie: 0, rom: 0, spo: 0 }, 4)).toBe(0);
  expect(getWinner({ tor: 1, mil: 1, ven: 1, fer: 1 }, 2)).toBe(1);
});

test("gets next player", () => {
  expect(getNextPlayer(0, [true, true, false])).toBe(1);
  expect(getNextPlayer(2, [false, true, false])).toBe(1);
});

test("gets player discard ability", () => {
  expect(canDiscard([1, "w", "d"])).toBe(false);
  expect(canDiscard(["w", "d"])).toBe(true);
});
