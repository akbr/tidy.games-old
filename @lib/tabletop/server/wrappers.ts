import { createLocalSocketPair } from "@lib/socket";
import { Spec } from "../core/spec";
import { BotFn } from "../core/game";
import { GameStore } from "../core/store";
import { ServerSocket, ServerApi } from "./createServer";

export interface GameHost<S extends Spec> {
  submit: (player: number, action: S["actions"]) => string | void;
  setSocket: (player: number, socket: ServerSocket<S> | null) => string | void;
}

export const createGameHost = <S extends Spec>(
  store: GameStore<S>
): GameHost<S> => {
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
        sockets[playerIndex]?.send({ gameErr: result });
      } else {
        sockets.forEach((socket, idx) => {
          const gameUpdate = store.get(idx);
          socket && socket.send({ gameUpdate });
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
        const gameUpdate = store.get(playerIndex);
        socket.send({ gameUpdate });
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
    clientSocket.send({ to: "game", msg: action });

  clientSocket.onmessage = (res) => {
    if (!res.gameUpdate) return;

    const { gameUpdate } = res;
    const { boards, ctx, playerIndex } = gameUpdate;

    boards.forEach((board) => {
      const action = botFn(board, ctx, playerIndex);
      if (action) botSend(action);
    });
  };

  return serverSocket;
};
