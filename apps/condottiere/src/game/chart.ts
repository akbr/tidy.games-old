import type { Chart, Ctx } from "@lib/tabletop/cart";
import { CondottiereSpec, Game } from "./spec";

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
  data = {} as Game
): Extract<CondottiereSpec["states"], { 0: "deal" }> => {
  const round = "round" in data ? data.round + 1 : 1;
  const map = "map" in data ? data.map : createMap();
  const condottiere = "condottiere" in data ? data.condottiere : 0;

  return [
    "deal",
    {
      round,
      condottiere,
      player: null,
      map,
      battleLocation: null,
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
    },
  ];
};

export const condottiereChart: Chart<CondottiereSpec> = {
  deal: (game) => ["choose", { player: game.condottiere }],
  choose: (game, ctx, action) => {
    if (!action) return null;
    if (action.type !== "choose" || action.player !== game.player)
      return "Action mistmatch.";

    const city = action.data;
    if (is.undefined(game.map[city])) return "Invalid city.";
    if (is.number(game.map[city])) return "City has already been conquered.";

    return ["chosen", { battleLocation: city }];
  },
  chosen: (game) => ["play", { player: game.condottiere }],
  play: (game, ctx, action) => {
    if (!action) return null;
    if (action.type !== "play" || action.player !== game.player)
      return "Action mistmatch.";

    const card = action.data;

    if (card === false) {
      const nextPlayStatus = game.playStatus.map((s, idx) =>
        idx === game.player ? false : s
      );
      return ["passed", { playStatus: nextPlayStatus }];
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
      "played",
      {
        hands: nextHands,
        lines: nextLines,
      },
    ];
  },
  passed: (game, ctx) => forkOnBattleStatus(game, ctx),
  played: (game, ctx) => {
    const justPlayed = game.lines[game.player!].at(-1);

    if (justPlayed === "s") {
      return ["retreat", {}];
    }

    return forkOnBattleStatus(game, ctx);
  },
  retreat: (game, ctx, action) => {
    if (!action) return null;
    if (action.type !== "retreat" || action.player !== game.player)
      return "Action mistmatch.";

    const order = action.data;

    if (order === false) {
      return ["retreated", {}];
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

    return [
      "retreated",
      {
        lines: nextLines,
        hands: nextHands,
      },
    ];
  },
  retreated: (game, ctx) => forkOnBattleStatus(game, ctx),
  battleEnd: (game, ctx, action) => {
    const winner = getWinner(game.map, ctx.numPlayers);

    if (winner === null) {
      return [
        "discard",
        {
          player: -1,
          lines: game.lines.map(() => []),
          discardStatus: Array.from({ length: ctx.numPlayers }).map(() => null),
          discardResults: Array.from({ length: ctx.numPlayers }).map(
            () => null
          ),
        },
      ];
    }

    return [
      "end",
      {
        player: null,
        lines: game.lines.map(() => []),
        winner,
      },
    ];
  },
  discard: (game, ctx, action) => {
    if (!action) return null;

    if (action.type !== "discard") return "Action mistmatch";
    if (!is.boolean(action.data)) return "Invalid discard order.";
    if (game.discardStatus[action.player] !== null)
      return "You've already chosen.";
    if (action.data === true && !canDiscard(game.hands[action.player])) {
      return "You're not eligible to discard.";
    }

    const nextDiscardStatus = setIndex(game.discardStatus, action.player, true);
    const nextDiscardResults = setIndex(
      game.discardResults,
      action.player,
      action.data
    );

    return [
      "discarded",
      {
        discardStatus: nextDiscardStatus,
        discardResults: nextDiscardResults,
      },
    ];
  },
  discarded: (game, ctx, action) => {
    const discardsRemain = is.defined(
      game.discardStatus.find((x) => x === null)
    );

    if (discardsRemain) {
      return ["discard", {}];
    }

    return ["discardsComplete", {}];
  },
  discardsComplete: (game, ctx) => {
    const nextHands = game.hands.map((hand, idx) =>
      game.discardResults[idx] ? [] : hand
    );
    const numPlayersRemaining = game.hands
      .map((hand) => (hand.length > 0 ? 1 : 0) as number)
      .reduce((a, b) => a + b, 0);

    if (numPlayersRemaining > 1) {
      [
        "choose",
        {
          player: game.condottiere,
          hands: nextHands,
          playStatus: nextHands.map((hand) => hand.length > 0),
          discardStatus: [],
          discardResults: [],
        },
      ];
    }

    return nextRound(ctx, game);
  },
  end: (data, ctx, action) => true,
};

function forkOnBattleStatus(
  game: Extract<
    CondottiereSpec["states"],
    { 0: "played" | "retreated" | "passed" }
  >[1],
  ctx: Ctx<CondottiereSpec>
): any {
  const battleStatus = getBattleStatus(game.lines, game.playStatus);

  if (battleStatus === null) {
    return [
      "play",
      {
        player: getNextPlayer(game.player!, game.playStatus),
      },
    ];
  }

  if (battleStatus === -1) {
    const nextCondottiere = rotateIndex(ctx.numPlayers, game.condottiere, 1);
    return [
      "battleEnd",
      {
        condottiere: nextCondottiere,
        battleLocation: null,
        player: null,
      },
    ];
  }

  const nextCondottiere = battleStatus;
  const nextMap = { ...game.map, [game.battleLocation!]: battleStatus };
  return [
    "battleEnd",
    {
      condottiere: nextCondottiere,
      map: nextMap,
      battleLocation: null,
      player: null,
    },
  ];
}
