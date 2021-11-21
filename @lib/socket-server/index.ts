import type {
  Engine,
  EngineTypesShape,
  ServerApi,
  ServerContext,
} from "./types";

import {
  getRoomForSocket,
  leaveRoom,
  joinRoom,
  createBot,
  broadcastStateUpdate,
  updateThroughReducer,
  recurseThroughReducer,
} from "./serverFns";

export function createServer<ET extends EngineTypesShape>(engine: Engine<ET>) {
  const api = {} as ServerApi<ET>;

  const ctx: ServerContext<ET> = {
    engine,
    rooms: new Map(),
    sockets: new Map(),
    botSockets: new Set(),
    api,
  };

  api.onOpen = (socket) => {
    socket.send(["server", { type: "room", data: null }]);
  };

  api.onClose = (socket) => {
    leaveRoom(ctx, socket);
  };

  api.onInput = (socket, envelope) => {
    const room = getRoomForSocket(ctx, socket);

    // ---------------
    // Server envelope
    // ---------------
    if (envelope[0] === "server") {
      let action = envelope[1];

      if (action.type === "join") {
        leaveRoom(ctx, socket);
        let { id, seatIndex } = action.data || {};
        let err = joinRoom(ctx, socket, id, seatIndex);
        if (err) socket.send(["serverMsg", { type: "error", data: err }]);
        return;
      }

      if (!room) {
        socket.send([
          "serverMsg",
          { type: "error", data: "You are not in a room." },
        ]);
        return;
      }

      if (action.type === "addBot") {
        if (!engine.createBot) {
          socket.send([
            "serverMsg",
            { type: "error", data: "No bot creator specified." },
          ]);
        }
        createBot(ctx, room.id, action.data);
        return;
      }

      if (action.type === "start") {
        let isPlayer0 = room.seats.indexOf(socket) === 0;

        if (!isPlayer0) {
          socket.send([
            "serverMsg",
            { type: "error", data: "You aren't the room creator." },
          ]);
        }

        let shouldStart = ctx.engine.shouldStart
          ? ctx.engine.shouldStart(room.seats.length)
          : true;
        if (!shouldStart) {
          socket.send([
            "serverMsg",
            {
              type: "error",
              data: "Wrong number of players.",
            },
          ]);
          return;
        }

        room.state = ctx.engine.getInitialState(room.seats.length, action.data);

        broadcastStateUpdate(ctx, room);
        recurseThroughReducer(ctx, room);
        return;
      }

      socket.send([
        "serverMsg",
        { type: "error", data: "Invalid server command." },
      ]);
    }

    // ---------------
    // Engine envelope
    // ---------------
    if (envelope[0] === "engine" && room) {
      updateThroughReducer(ctx, room, socket, envelope[1]);
      recurseThroughReducer(ctx, room);
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
