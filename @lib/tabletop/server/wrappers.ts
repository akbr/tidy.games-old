import { createLocalSocketPair } from "@lib/socket";
import { Spec } from "../core/spec";
import { BotFn } from "../core/cart";
import { CartStore } from "../core/store";
import { ServerSocket, ServerApi } from "./createServer";

export interface CartHost<S extends Spec> {
  submit: (player: number, action: S["actions"]) => string | void;
  setSocket: (player: number, socket: ServerSocket<S> | null) => string | void;
}

export const createCartHost = <S extends Spec>(
  store: CartStore<S>
): CartHost<S> => {
  const sockets: (ServerSocket<S> | undefined)[] = [];
  const actionQueue: [number, S["actions"]][] = [];

  let working = false;

  return {
    submit: function submit(playerIndex, action) {
      if (working) {
        if (!actionQueue.filter((x) => x[1] === action).length)
          actionQueue.push([playerIndex, action]);
        return;
      }

      const result = store.submit(action, playerIndex);
      working = true;

      if (typeof result === "string") {
        sockets[playerIndex]?.send({ cartErr: result });
      } else {
        sockets.forEach((socket, idx) => {
          const cartUpdate = store.get(idx);
          socket && socket.send({ cartUpdate });
        });
      }
      working = false;

      if (actionQueue.length) {
        const [nextPlayer, nextAction] = actionQueue.shift()!;
        submit(nextPlayer, nextAction);
      }
    },
    setSocket: (playerIndex, socket) => {
      if (playerIndex < 0) return "Invalid player index.";

      sockets[playerIndex] = socket ? socket : undefined;

      if (socket) {
        const cartUpdate = store.get(playerIndex);
        socket.send({ cartUpdate });
      }
    },
  };
};

export const createBotSocket = <S extends Spec>(
  botFn: BotFn<S>,
  server: ServerApi<S>
) => {
  const [clientSocket, serverSocket] = createLocalSocketPair(server);

  const botSend = (action: S["actions"]) =>
    clientSocket.send({ to: "cart", msg: action });

  clientSocket.onmessage = (res) => {
    if (!res.cartUpdate) return;

    const { cartUpdate } = res;
    const { games, ctx, playerIndex } = cartUpdate;

    games.forEach((game) => {
      const action = botFn(game, ctx, playerIndex);
      if (action) botSend(action);
    });
  };

  return serverSocket;
};
