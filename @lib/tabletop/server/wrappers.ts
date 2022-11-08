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
    submit: function submit(player, action) {
      if (working) {
        actionQueue.push([player, action]);
        return;
      }

      const result = store.submit(action, player);
      working = true;
      if (typeof result === "string") {
        sockets[player]?.send({ cartErr: result });
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
    setSocket: (player, socket) => {
      if (player < 0) return "Invalid player index.";

      sockets[player] = socket ? socket : undefined;

      if (socket) {
        const cartUpdate = store.get(player);
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

  clientSocket.onmessage = ({ cartUpdate }) => {
    if (!cartUpdate) return;

    cartUpdate.games.forEach((game) => {
      const action = botFn(game, cartUpdate.ctx, cartUpdate.player);
      if (action) botSend(action);
    });
  };

  return serverSocket;
};
