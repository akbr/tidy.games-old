import type { EngineTypes, Engine } from "../engine";
import type { Socket } from "../socket/types";
import type { ServerApi, ServerOutputs, ServerInputs } from "./types";

import {
  getRoomForSocket,
  leaveRoom,
  joinRoom,
  createBot,
  broadcastStateUpdate,
  updateThroughReducer,
} from "./methods";

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
  seats: (ServerSocket<ET> | false)[];
  spectators: ServerSocket<ET>[];
  state: ET["states"] | false;
};

export type ServerContext<ET extends EngineTypes> = {
  engine: Engine<ET>;
  rooms: Map<string, Room<ET>>;
  sockets: Map<ServerSocket<ET>, string>;
  botSockets: Set<ServerSocket<ET>>;
  api: ServerApi<ET>;
};

export function createServer<ET extends EngineTypes>(engine: Engine<ET>) {
  const api = { engine } as ServerApi<ET>;

  const ctx: ServerContext<ET> = {
    engine,
    rooms: new Map(),
    sockets: new Map(),
    botSockets: new Set(),
    api,
  };

  api.onOpen = (socket) => {
    socket.send({ type: "server", data: { type: "room", data: null } });
  };

  api.onClose = (socket) => {
    leaveRoom(ctx, socket);
  };

  api.onInput = (socket, envelope) => {
    const room = getRoomForSocket(ctx, socket);

    if (envelope.type === "server") {
      let action = envelope.data;

      if (action.type === "join") {
        leaveRoom(ctx, socket);
        let { id, seatIndex } = action.data || {};
        let err = joinRoom(ctx, socket, id, seatIndex);
        if (err)
          socket.send({ type: "serverMsg", data: { type: "err", data: err } });
        return;
      }

      if (!room) {
        socket.send({
          type: "serverMsg",
          data: { type: "err", data: "You are not in a room." },
        });
        return;
      }

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

      if (action.type === "start") {
        let isPlayer0 = room.seats.indexOf(socket) === 0;

        if (!isPlayer0) {
          socket.send({
            type: "serverMsg",
            data: { type: "err", data: "You aren't the room creator." },
          });
        }

        let shouldStart = ctx.engine.shouldStart
          ? ctx.engine.shouldStart(room.seats.length)
          : true;
        if (!shouldStart) {
          socket.send({
            type: "serverMsg",
            data: { type: "err", data: "Wrong number of players." },
          });
          return;
        }

        room.state = ctx.engine.getInitialState(room.seats.length, action.data);

        broadcastStateUpdate(ctx, room.state, room);
        updateThroughReducer(ctx, room);
        return;
      }

      socket.send({
        type: "serverMsg",
        data: { type: "err", data: "Invalid server action." },
      });
    }

    // ---------------
    // Engine envelope
    // ---------------
    if (envelope.type === "engine") {
      if (!room) {
        socket.send({
          type: "serverMsg",
          data: {
            type: "err",
            data: "You are not in a room.",
          },
        });
        return;
      }

      if (!room.state) {
        socket.send({
          type: "serverMsg",
          data: {
            type: "err",
            data: "This room's game has not started.",
          },
        });
        return;
      }

      updateThroughReducer(ctx, room, { socket, action: envelope.data });
    }
  };

  api.dump = () => {
    let roomObj: any = {};
    ctx.rooms.forEach(({ id, state, seats }) => {
      roomObj[id] = {
        id,
        state,
        seats: seats.map(() => false),
        spectators: [],
      };
    });
    return JSON.stringify(roomObj);
  };

  api.format = (json: string) => {
    let roomObj = JSON.parse(json);
    Object.values(roomObj).forEach((room) => {
      //@ts-ignore
      ctx.rooms.set(room.id, room);
    });
  };

  return api;
}