export default "deprcated";

/**
import { Cart } from "@lib/tabletop";
import { AuthenticatedAction } from "@lib/tabletop/cart";
import { getScore } from "./logic";

import { WizardSpec } from "./spec";

const parseHistory = (playRecord: number[][]) => {
  const bids: number[][] = [];
  const actuals: number[][] = [];

  playRecord.forEach((x, idx) => {
    if (idx % 2 === 0) {
      bids.push(x);
    } else {
      actuals.push(x);
    }
  });

  return { bids, actuals };
};

const getScoresByRound = (playRecord: number[][]) => {
  const { bids, actuals } = parseHistory(playRecord);
  return bids.map((playerBids, player) =>
    playerBids.map((bid, round) => getScore(bid, actuals[player][round]))
  );
};

export const getRunningScore = (playRecord: number[][]) =>
  getScoresByRound(playRecord).map((scores) => {
    const totals = [0];
    scores.forEach((scoreMod, round) => {
      totals.push(scoreMod + totals[round]);
    });
    return totals;
  });

export const getTricksTaken = (playRecord: number[][]) => {
  const { actuals } = parseHistory(playRecord);

  const runningTotals = actuals.map((actuals) => {
    const totals = [0];
    actuals.forEach((numTaken, round) => {
      totals.push(numTaken + totals[round]);
    });
    return totals;
  });

  return runningTotals;
};

export const createAnalysis: Cart<WizardSpec>["createAnalysis"] = (
  stream,
  ctx
) => {
  type States = WizardSpec["states"];
  type Actions = AuthenticatedAction<WizardSpec>;

  const states = stream.filter((x): x is States => Array.isArray(x));

  const deals = states.filter(
    (x): x is Extract<States, { 0: "deal" }> => x[0] === "deal"
  );

  const suitsByPlayer = Array.from(
    { length: ctx.numPlayers },
    () => [] as string[]
  );

  deals.forEach(([, { hands }], round) => {
    hands.forEach((hand, player) => {
      hand.forEach((card) => {
        const suit = card.split("|")[1];
        suitsByPlayer[player].push(suit);
      });
    });
  });

  const numWizards = suitsByPlayer.map(
    (suits) => suits.filter((suit) => suit === "w").length
  );
  const numJesters = suitsByPlayer.map(
    (suits) => suits.filter((suit) => suit === "j").length
  );

  const finalScores = states.at(-1)![1].scores;

  return {
    numWizards,
    numJesters,
    runningScore: getRunningScore(finalScores),
  };
};

 */
