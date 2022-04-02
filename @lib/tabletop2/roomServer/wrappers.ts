import { Spec } from "../spec";
import { BotFn } from "../cart";
import { getFrames, Machine } from "../machine";
import { ServerSocket } from ".";
import { ServerApi } from "./roomServer";
import { createLocalSocketPair } from "@lib/socket";

export interface MachineServer<S extends Spec> {
  submit: (player: number, action: S["actions"]) => string | void;
  setSocket: (player: number, socket: ServerSocket<S> | null) => string | void;
}

export const createMachineServer = <S extends Spec>(
  machine: Machine<S>
): MachineServer<S> => {
  const sockets: (ServerSocket<S> | undefined)[] = [];
  const actionQueue: [number, S["actions"]][] = [];

  let working = false;

  return {
    submit: function submit(player, action) {
      if (working) {
        actionQueue.push([player, action]);
        return;
      }

      const result = machine.submit(action, player);
      working = true;
      if (typeof result === "string") {
        sockets[player]?.send(["machineErr", result]);
      } else {
        sockets.forEach(
          (socket, idx) => socket && socket.send(["machine", machine.get(idx)])
        );
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
      if (socket) socket.send(["machine", machine.get(player)]);
    },
  };
};

export const createBotSocket = <S extends Spec>(
  botFn: BotFn<S>,
  server: ServerApi<S>
) => {
  const [clientSocket, serverSocket] = createLocalSocketPair(server);

  const botSend = (action: S["actions"]) =>
    clientSocket.send(["machine", action]);
  clientSocket.onmessage = ([type, payload]) => {
    if (type !== "machine") return;
    const frames = getFrames(payload);
    frames.forEach((frame) => {
      botFn(frame, botSend);
    });
  };

  return serverSocket;
};
