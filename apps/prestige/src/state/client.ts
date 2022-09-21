import { Board, Order } from "./gameTypes";
import type { Server } from "./server";
import { set } from "./useGame";
import { resolveTurn } from "./resolveTurn";

export function createClient(server: Server, id: string) {
  let _boards: Board[] = [];
  let _orders: Order[] = [];

  const api = {
    create: () => {
      server.createGame(id);
    },
    seekTo: (num: number) => {
      const board = _boards[num];
      if (board) {
        set({
          board,
          seek: [num, _boards.length],
          orders: num === 0 ? _orders : [],
        });
      }
    },
    get: (turnNum?: number) => {
      const { numTicks, ...res } = server.get(id, turnNum);
      const { board, orders } = res;

      _boards =
        numTicks !== undefined ? resolveTurn(board, orders, numTicks) : [board];
      _orders = res.orders;

      set({
        ...res,
        seek: _boards.length > 1 ? [0, _boards.length] : undefined,
      });
    },
    resolve: () => {
      server.resolve(id);
      api.get(-1);
    },
    submit: (order: Omit<Order, "id">) => {
      const orders = server.submit(id, order);
      _orders = orders;
      set({ orders, selected: null, mode: null });
    },
  };

  return api;
}
