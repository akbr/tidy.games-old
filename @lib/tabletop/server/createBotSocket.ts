import { createLocalSocketPair } from "@lib/socket";
import { Spec } from "../core/spec";
import { BotFn } from "../core/game";
import { ServerApi } from "./types";

export const createBotSocket = <S extends Spec>(
  botFn: BotFn<S>,
  server: ServerApi<S>
) => {
  const [clientSocket, serverSocket] = createLocalSocketPair(server);

  const botSend = (action: S["actions"]) =>
    clientSocket.send({ to: "game", msg: action });

  clientSocket.onmessage = (res) => {
    if (!res.loc || !res.gameUpdate) return;

    const {
      gameUpdate,
      loc: { playerIndex },
    } = res;
    const { boardSet, ctx } = gameUpdate;

    boardSet.forEach((board) => {
      const action = botFn(board, ctx, playerIndex);
      if (action) botSend(action);
    });
  };

  return serverSocket;
};
