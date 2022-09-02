import type { Chart, Ctx, StatePatch } from "@lib/tabletop/";
import { CondottiereSpec } from "./spec";

import {
  canDiscard,
  createHands,
  createMap,
  getBattleStatus,
  getNextPlayer,
  getWinner,
  sortHand,
} from "./logic";

import { removeOne, rotateIndex, setIndex } from "@lib/array";
import { is } from "@lib/compare/is";

export const nextRound = (
  { numPlayers, seed }: Ctx<CondottiereSpec>,
  data = {} as CondottiereSpec["game"]
): CondottiereSpec["states"] => {
  const round = "round" in data ? data.round + 1 : 1;
  const map = "map" in data ? data.map : createMap();
  const condottiere = "condottiere" in data ? data.condottiere : 0;

  return {
    phase: "deal",
    round,
    condottiere,
    player: null,
    map,
    battleLocation: null,
    battleStatus: null,
    hands: createHands(
      numPlayers,
      map,
      seed ? seed + round : String(Math.random())
    ),
    lines: Array.from({ length: numPlayers }).map(() => []),
    playStatus: Array.from({ length: numPlayers }).map(() => true),
    discardStatus: [],
    discardResults: [],
    winner: null,
  };
};

export const condottiereChart: Chart<CondottiereSpec> = {
  deal: (game) => ({ phase: "choose", player: game.condottiere }),
  choose: (game, ctx, action) => {
    if (!action) return null;
    if (action.type !== "choose" || action.player !== game.player)
      return "Action mistmatch.";

    const city = action.data;
    if (is.undefined(game.map[city])) return "Invalid city.";
    if (is.number(game.map[city])) return "City has already been conquered.";

    return { phase: "chosen", battleLocation: city, player: null };
  },
  chosen: (s) => {
    const condottiereIsActive = s.playStatus[s.condottiere];
    const nextPlayer = condottiereIsActive
      ? s.condottiere
      : getNextPlayer(s.condottiere, s.playStatus);

    return { phase: "play", player: nextPlayer };
  },
  play: (game, ctx, action) => {
    if (!action) return null;
    if (action.type !== "play" || action.player !== game.player)
      return "Action mistmatch.";

    const card = action.data;

    if (card === false) {
      const nextPlayStatus = game.playStatus.map((s, idx) =>
        idx === game.player ? false : s
      );
      return { phase: "passed", playStatus: nextPlayStatus };
    }

    if (!game.hands[game.player!].includes(card))
      return "You don't have that card.";

    const nextHands = game.hands.map((hand, idx) =>
      idx === game.player ? removeOne(hand, card) : hand
    );
    const nextLines = game.lines.map((line, idx) =>
      idx === game.player ? [...line, card] : line
    );

    return [
      {
        phase: "played",
        hands: nextHands,
      },
      {
        phase: "placed",
        lines: nextLines,
      },
    ];
  },
  passed: (game, ctx) => forkOnBattleStatus(game),
  played: () => "This state is never on the edge.",
  placed: (s, ctx) => {
    const justPlayed = s.lines[s.player!].at(-1);

    if (justPlayed === "s") {
      const mercsInLine =
        s.lines[s.player!].filter((x) => is.number(x)).length > 0;
      if (mercsInLine) return { phase: "retreat" };
    }

    return forkOnBattleStatus(s);
  },
  retreat: (game, ctx, action) => {
    if (!action) return null;
    if (action.type !== "retreat" || action.player !== game.player)
      return "Action mistmatch.";

    const order = action.data;

    if (order === false) {
      return { phase: "retreated" };
    }

    if (!is.number(order)) return "Invalid retreat order.";
    if (is.undefined(game.lines[game.player!].find((x) => x === order)))
      return "You don't have that mercenary to retreat.";

    const nextLines = game.lines.map((line, idx) =>
      idx === game.player ? removeOne(line, order) : line
    );
    const nextHands = game.hands.map((hand, idx) =>
      idx === game.player ? sortHand([...hand, order]) : hand
    );

    return {
      phase: "retreated",
      lines: nextLines,
      hands: nextHands,
    };
  },
  retreated: (s) => forkOnBattleStatus(s),
  battleEnd: (s, ctx) => {
    const nextMap = {
      ...s.map,
      [s.battleLocation!]: s.battleStatus === -1 ? null : s.battleStatus,
    };
    const winner = getWinner(nextMap, ctx.numPlayers);

    const next = {
      lines: s.lines.map(() => []),
      battleLocation: null,
      battleStatus: null,
      map: nextMap,
    };

    if (winner === null) {
      const nextCondottiere =
        s.battleStatus === -1
          ? rotateIndex(ctx.numPlayers, s.condottiere, 1)
          : s.battleStatus!;
      return {
        phase: "discard",
        player: -1,
        discardStatus: Array.from({ length: ctx.numPlayers }).map(() => null),
        discardResults: Array.from({ length: ctx.numPlayers }).map(() => null),
        condottiere: nextCondottiere,
        ...next,
      };
    }

    return {
      phase: "end",
      winner,
      ...next,
    };
  },
  discard: (s, ctx, a) => {
    if (!a) return null;

    if (a.type !== "discard") return "Action mistmatch";
    if (!is.boolean(a.data)) return "Invalid discard order.";
    if (s.discardStatus[a.player] !== null) return "You've already chosen.";
    if (a.data === true && !canDiscard(s.hands[a.player])) {
      return "You're not eligible to discard.";
    }

    const nextDiscardStatus = setIndex(s.discardStatus, a.player, true);
    const nextDiscardResults = setIndex(s.discardResults, a.player, a.data);

    return {
      phase: "discarded",
      discardStatus: nextDiscardStatus,
      discardResults: nextDiscardResults,
    };
  },
  discarded: (s) => {
    if (s.discardStatus.includes(null)) return { phase: "discard" };

    const nextHands = s.hands.map((hand, idx) =>
      s.discardResults[idx] ? [] : hand
    );

    return {
      phase: "discardsComplete",
      hands: nextHands,
      playStatus: nextHands.map((hand) => hand.length > 0),
    };
  },
  discardsComplete: (s, ctx) => {
    const numPlayersRemaining = s.playStatus.filter((s) => s).length;

    if (numPlayersRemaining > 1) {
      return {
        phase: "choose",
        player: s.condottiere,
        discardStatus: [],
        discardResults: [],
      };
    }

    return nextRound(ctx, s);
  },
  end: () => true,
};

function forkOnBattleStatus(
  s: CondottiereSpec["states"]
): StatePatch<CondottiereSpec> {
  const nextPlayStatus = s.playStatus.map((x, idx) =>
    x === false ? x : s.hands[idx].length > 0
  );
  const battleStatus = getBattleStatus(s.lines, s.playStatus);
  const nextPlayer = getNextPlayer(s.player!, s.playStatus);

  return battleStatus === null && nextPlayer !== null
    ? {
        phase: "play",
        player: nextPlayer,
        playStatus: nextPlayStatus,
        battleStatus,
      }
    : {
        phase: "battleEnd",
        player: null,
        playStatus: nextPlayStatus,
        battleStatus,
      };
}
