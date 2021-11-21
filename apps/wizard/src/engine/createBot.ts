import { WizardEngine, WizardShape } from "./types";
import { randomFromArray } from "@lib/random";
import { getPlayableCards, getSuit, getTuple } from "./logic";

const clamp = (num: number, min = 0, max = Infinity) =>
  Math.min(Math.max(num, min), max);

const computeBid = (
  { hands, trumpSuit, numPlayers, turn }: WizardShape["states"],
  playerIndex: number
) => {
  let hand = hands[playerIndex];

  let suits = hand.map(getSuit);
  let numWizards = suits.filter((s) => s === "w").length;
  let trumpValue = hand
    .map(getTuple)
    .map(([value, suit]) => (suit === trumpSuit ? value : 0))
    .reduce((x, y) => x + y, 0);

  return clamp(numWizards + (trumpValue % 8), 0, turn);
};

export const createBot: WizardEngine["createBot"] =
  ({ send }) =>
  (state, playerIndex) => {
    const itsMyTurn =
      "activePlayer" in state && state.activePlayer === playerIndex;

    if (!itsMyTurn) return;

    if (state.type === "selectTrump") {
      send({
        type: "selectTrump",
        data: randomFromArray(["c", "d", "h", "s"]),
      });
    }

    if (state.type === "bid") {
      send({ type: "bid", data: computeBid(state, playerIndex) });
    }

    if (state.type === "play") {
      let playableCards = getPlayableCards(
        state.hands[playerIndex],
        state.trick
      );
      send({ type: "play", data: randomFromArray(playableCards) });
    }
  };
