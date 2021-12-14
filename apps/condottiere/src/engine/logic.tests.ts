import assert from "assert";
import {
  createMap,
  createDeck,
  createHands,
  getBattleStrength,
  getBattleStatus,
  isWinner,
  getNextPlayer,
} from "./logic";

const map = createMap();
assert.equal(Object.keys(map).length, 17);

const deck = createDeck();
assert.equal(deck.length, 96);

const startMap = createMap();
const startHands = createHands(3, startMap);
assert.equal(startHands.length, 3);
assert.equal(startHands[0].length, 10);

const modMap = { ...startMap, tor: 0, mil: 0, ven: 1 };
const modHands = createHands(3, modMap);
assert.equal(modHands.length, 3);
assert.equal(modHands[0].length, 14);
assert.equal(modHands[1].length, 12);
assert.equal(modHands[2].length, 10);

assert.equal(getBattleStrength([1], false), 1);
assert.equal(getBattleStrength([10, 1], false), 11);
assert.equal(getBattleStrength([10, 1, "d"], false), 22);
assert.equal(getBattleStrength([10, 1], true), 2);
assert.equal(getBattleStrength([10, 1, "h"], true), 12);

assert.equal(getBattleStatus([[1], [1]], [true, true]), undefined);
assert.equal(getBattleStatus([[1], [1]], [true, false]), -1);
assert.equal(getBattleStatus([[1], [2]], [true, false]), 1);
assert.equal(getBattleStatus([[1, "w"], [2]], [true, false]), -1);
assert.equal(
  getBattleStatus(
    [
      [10, "w"],
      ["h", "m"],
    ],
    [true, true]
  ),
  1
);
assert.equal(
  getBattleStatus(
    [
      [10, "w"],
      ["h", "m"],
    ],
    [true, false]
  ),
  1
);
assert.equal(
  getBattleStatus(
    [
      [10, "d", 1, 1, 1, 1, "w"],
      ["h", "b"],
    ],
    [true, true]
  ),
  -1
);

const closeMap = { ...map, tor: 1, mil: 1, gen: 1 };
assert.equal(isWinner(closeMap, 4), 1);
assert.equal(isWinner(closeMap, 3), null);
assert.equal(isWinner({ ...closeMap, ven: 1 }, 3), 1);

assert.equal(getNextPlayer(0, [true, false, true]), 2);
assert.equal(getNextPlayer(2, [false, true, true]), 1);
