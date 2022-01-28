import type { EngineTypes, Engine } from "@lib/engine";
import type { Socket } from "../socket/types";
import type { ServerApi, ServerOutputs, ServerInputs } from "./types";
import { Machine } from "@lib/engine/machine";

import { createMethods } from "./methods";

export type ServerSocket<ET extends EngineTypes> = Socket<
  ServerOutputs<ET>,
  ServerInputs<ET>
>;

export type BotSocket<ET extends EngineTypes> = Socket<
  ServerInputs<ET>,
  ServerOutputs<ET>
>;

export type Room<ET extends EngineTypes> = {
  id: string;
  seats: (ServerSocket<ET> | null)[];
  machine: Machine<ET> | null;
};

export type ServerContext<ET extends EngineTypes> = {
  engine: Engine<ET>;
  rooms: Map<string, Room<ET>>;
  sockets: Map<ServerSocket<ET>, string>;
  api: ServerApi<ET>;
};

export function createServer<ET extends EngineTypes>(engine: Engine<ET>) {
  const api = {} as ServerApi<ET>;

  const { joinRoom, startGame, submitAction, leaveRoom } = createMethods({
    engine,
    rooms: new Map(),
    sockets: new Map(),
    api,
  });

  api.onOpen = (socket) => {
    socket.send({ type: "server", data: null });
  };

  api.onClose = (socket) => {
    leaveRoom(socket);
  };

  api.onInput = (socket, envelope) => {
    // ---------------
    // Server envelope
    // ---------------
    if (envelope.type === "server") {
      const action = envelope.data;

      if (action.type === "join") {
        leaveRoom(socket);
        const err = joinRoom(socket, action.data?.id, action.data?.seatIndex);
        if (err) socket.send({ type: "serverMsg", data: err });
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
    if (envelope.type === "engine") {
      const err = submitAction(socket, envelope.data);
      if (err) socket.send(err);
    }
  };

  return api;
}

/**
 * 
      if (action.type === "addBot") {
        if (!engine.createBot) {
          socket.send({
            type: "serverMsg",
            data: { type: "err", data: "No bot creator specified." },
          });
        }
        createBot(ctx, room.id, action.data);
        return;
      }
 */
