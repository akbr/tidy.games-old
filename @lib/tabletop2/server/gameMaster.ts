import { Spec } from "../spec";
import { Machine } from "../machine";
import { ServerSocket } from "../server";

export interface GameMaster<S extends Spec> {
  submit: (player: number, action: S["actions"]) => string | void;
  setSocket: (player: number, socket: ServerSocket<S> | null) => string | void;
}

export const createGameMaster = <S extends Spec>(
  machine: Machine<S>
): GameMaster<S> => {
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
