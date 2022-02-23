import type { EngineTypes, MachineSpec } from "@lib/engine-turn";
import type { ServerApi } from "./types";
import { createMethods } from "./methods";

export function createServer<ET extends EngineTypes>(
  machineSpec: MachineSpec<ET>
) {
  const { joinRoom, startGame, submitAction, leaveRoom } =
    createMethods(machineSpec);

  const server: ServerApi<ET> = {
    onopen: (socket) => {
      socket.send(["server", null]);
    },
    onclose: (socket) => {
      leaveRoom(socket);
    },
    onmessage: (socket, [msgType, msg]) => {
      if (msgType === "server") {
        if (msg.type === "join") {
          leaveRoom(socket);
          const err = joinRoom(socket, msg.data?.id, msg.data?.seatIndex);
          if (err) socket.send(["serverMsg", err]);
          return;
        }

        /**
        if (action.type === "addBot") {
          const res = addBot(socket, action.data);
          if (res) {
            return socket.send({ type: "serverMsg", data: res });
          }
          return;
        }
        **/

        if (msg.type === "start") {
          let err = startGame(socket, msg.data);
          if (err) socket.send(["serverMsg", err]);
          return;
        }

        socket.send(["serverMsg", "Invalid server action."]);
      }

      if (msgType === "engine") {
        const err = submitAction(socket, msg);
        if (err) socket.send(["serverMsg", err]);
      }
    },
  };

  return server;
}
