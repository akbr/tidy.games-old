import type { SocketServer, Socket } from "@lib/socket";
import type { Spec, GameDefinition } from "..";
import { createMethods } from "./methods";
import type { ServerOutputs, ServerInputs } from "./types";

export type ServerApi<S extends Spec> = SocketServer<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export function createServer<S extends Spec>(
  gameDefinition: GameDefinition<S>
) {
  const { joinRoom, startGame, submitAction, leaveRoom } =
    createMethods(gameDefinition);

  const server: ServerApi<S> = {
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
          if (err) socket.send(["serverErr", err]);
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
          console.log(err);
          if (err) socket.send(["serverErr", err]);
          return;
        }

        socket.send(["serverErr", "Invalid server action."]);
      }

      if (msgType === "machine") {
        const err = submitAction(socket, msg);
        if (err) socket.send(["serverErr", err]);
      }
    },
  };

  return server;
}
