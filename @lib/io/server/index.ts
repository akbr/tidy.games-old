import type { EngineTypes, Engine } from "@lib/engine";
import type { Socket } from "../socket/types";
import type { ServerApi, ServerOutputs, ServerInputs } from "./types";
import { Machine } from "@lib/engine/machine";

import { createMethods } from "./methods";

export type ServerSocket<ET extends EngineTypes> = Socket<
  ServerOutputs<ET>,
  ServerInputs<ET>
>;

export type Room<ET extends EngineTypes> = {
  id: string;
  seats: (ServerSocket<ET> | null)[];
  machine: Machine<ET> | null;
};

export interface ServerContext<ET extends EngineTypes> {
  engine: Engine<ET>;
  rooms: Map<string, Room<ET>>;
  sockets: Map<ServerSocket<ET>, string>;
  botSockets: Set<ServerSocket<ET>>;
}

export function createServer<ET extends EngineTypes>(
  engine: Engine<ET>
): ServerApi<ET> {
  const { joinRoom, addBot, startGame, submitAction, leaveRoom } =
    createMethods({
      engine,
      rooms: new Map(),
      sockets: new Map(),
      botSockets: new Set<ServerSocket<ET>>(),
    });

  return {
    onOpen: (socket) => {
      socket.send({ type: "server", data: null });
    },
    onClose: (socket) => {
      leaveRoom(socket);
    },
    onInput: (socket, { type: envelopeType, data: action }) => {
      // ---------------
      // Server envelope
      // ---------------
      if (envelopeType === "server") {
        if (action.type === "join") {
          leaveRoom(socket);
          const err = joinRoom(socket, action.data?.id, action.data?.seatIndex);
          if (err) socket.send({ type: "serverMsg", data: err });
          return;
        }

        if (action.type === "addBot") {
          const res = addBot(socket, action.data);
          if (res) {
            return socket.send({ type: "serverMsg", data: res });
          }
          return;
        }

        if (action.type === "start") {
          let err = startGame(socket, action.data);
          if (err) socket.send({ type: "serverMsg", data: err });
          return;
        }

        socket.send({
          type: "serverMsg",
          data: "Invalid server action.",
        });
      }

      // ---------------
      // Engine envelope
      // ---------------
      if (envelopeType === "engine") {
        const err = submitAction(socket, action);
        if (err) socket.send(err);
      }
    },
  };
}
