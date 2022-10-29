import { Board } from "../game.types";
import { Orders } from "./orders.types";
import { getById } from "../utils";

type CommitOrderFns = {
  [O in Orders as O["type"]]: (board: Board, order: O) => void;
};

export const orderFns: CommitOrderFns = {
  transitOrder: (board, order) => {
    const { to, from, fleets } = order;
    const system = getById(board.systems, from)!;

    fleets.forEach(({ player, num }) => {
      const mod = system.fleets.find((x) => x.player === player)!;
      mod.num -= num;
    });

    board.transit.push({
      type: "transit",
      id: order.id,
      to,
      from,
      fleets: order.fleets,
      distance: 0,
    });
  },
};

export default orderFns;
