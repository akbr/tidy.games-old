import { Spec } from "../";
import { Machine } from "../machine";
import { ServerSocket } from "./types";

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
      if (typeof result === "string") return result;

      working = true;
      sockets.forEach(
        (socket, idx) =>
          socket && socket.send(["machine", machine.get(idx - 1)])
      );
      working = false;

      if (actionQueue.length) {
        const [nextPlayer, nextAction] = actionQueue.shift()!;
        submit(nextPlayer, nextAction);
      }
    },
    setSocket: (player, socket) => {
      player = player + 1; // allow for a -1 "god socket"
      if (player < 0) return "Invalid player index.";

      sockets[player] = socket ? socket : undefined;
      if (socket) socket.send(["machine", machine.get(player - 1)]);
    },
  };
};
