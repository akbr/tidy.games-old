import type {
  EngineTypesShape,
  ServerContext,
  ServerSocket,
  BotSocket,
  Room,
} from "./types";

import { getRandomRoomID } from "./utils";

export const createRoom = <ET extends EngineTypesShape>(
  { engine, rooms }: ServerContext<ET>,
  id: string
) => {
  const room: Room<ET> = {
    id,
    seats: [],
    spectators: [],
    state: engine.autoStart ? engine.getInitialState(0) : false,
  };
  rooms.set(id, room);
  return room;
};

export const getRoomForSocket = <ET extends EngineTypesShape>(
  { rooms, sockets }: ServerContext<ET>,
  socket: ServerSocket<ET>
) => {
  let id = sockets.get(socket);
  if (id) {
    let room = rooms.get(id);
    return room ? room : null;
  }
  return null;
};

const avatars = ["🦊", "🐷", "🐔", "🐻", "🐭", "🦁"];
const botAvatar = "🤖";
export const broadcastRoomStatus = <ET extends EngineTypesShape>(
  { botSockets }: ServerContext<ET>,
  { id, seats, spectators, state }: Room<ET>
) => {
  const modSeats = seats.map((socket, idx) => {
    const avatar = socket && botSockets.has(socket) ? botAvatar : avatars[idx];
    return {
      avatar,
      name: `P${idx + 1}`,
    };
  });

  const numSpectators = spectators.length;
  const started = state ? true : false;

  [...seats, ...spectators].forEach((socket) => {
    if (!socket) return;
    socket.send([
      "server",
      {
        type: "room",
        data: {
          id,
          seats: modSeats,
          spectators: numSpectators,
          seatIndex: seats.indexOf(socket),
          started,
        },
      },
    ]);
  });
};

export const joinRoom = <ET extends EngineTypesShape>(
  ctx: ServerContext<ET>,
  socket: ServerSocket<ET>,
  id?: string,
  requestedPlayerIndex?: number
) => {
  const { rooms, sockets, engine } = ctx;

  let room: Room<ET>;
  if (id !== undefined) {
    id = id.toUpperCase();
    if (id.length !== 4) return `Invalid room code format.`;
    room = rooms.get(id) || createRoom(ctx, id);
  } else {
    let id = getRandomRoomID();
    while (rooms.get(id)) id = getRandomRoomID();
    room = createRoom(ctx, id);
  }

  let numSeats = room.seats.length;

  const addSocket = () => {
    sockets.set(socket, room.id);
    broadcastRoomStatus(ctx, room);

    if (room.state) {
      socket.send([
        "engine",
        engine.adapt
          ? engine.adapt(
              room.state,
              room.seats.indexOf(socket),
              room.seats.length
            )
          : room.state,
      ]);
    }
  };

  if (requestedPlayerIndex === undefined) {
    let openSeats = room.seats.indexOf(false) > -1;
    let roomForNewSeats = engine.shouldAddSeat
      ? engine.shouldAddSeat(numSeats, room.state !== false)
      : true;

    if (!openSeats && !roomForNewSeats) {
      room.spectators.push(socket);
      return addSocket();
    }

    let firstOpenSeat = room.seats.indexOf(false);
    if (firstOpenSeat > -1) {
      room.seats[firstOpenSeat] = socket;
    } else {
      room.seats.push(socket);
    }
  } else {
    if (requestedPlayerIndex > numSeats) {
      return `Can't skip seats. Next seat is ${numSeats}`;
    }

    let seatOpen =
      room.seats.length === 0 || room.seats[requestedPlayerIndex] === false;

    if (!seatOpen) {
      return `Seat ${requestedPlayerIndex} is occupied`;
    }
    room.seats[requestedPlayerIndex] = socket;
  }

  return addSocket();
};

export const createBot = <ET extends EngineTypesShape>(
  ctx: ServerContext<ET>,
  id: string,
  options?: ET["botOptions"]
) => {
  const { engine, botSockets, api } = ctx;

  if (!engine.createBot) return;

  let serverSocket: ServerSocket<ET>;

  let botSocket: BotSocket<ET> = {
    send: (action) => {
      api.onInput(serverSocket, action);
    },
    close: () => api.onClose(serverSocket),
  };

  let botFn = engine.createBot(
    {
      send: (action) => botSocket.send(["engine", action]),
      close: botSocket.close,
    },
    undefined
  );

  serverSocket = {
    send: ([type, data]) => {
      if (type !== "engine") {
        if (type === "engineMsg")
          console.warn("Bot reiceived engine error", data);
        return;
      }
      let room = getRoomForSocket(ctx, serverSocket);
      let playerIndex = room ? room.seats.indexOf(serverSocket) : undefined;
      botFn(data, playerIndex);
    },
    close: () => api.onClose(serverSocket),
  };

  botSockets.add(serverSocket);

  api.onInput(serverSocket, [
    "server",
    {
      type: "join",
      data: { id },
    },
  ]);
};

export const leaveRoom = <ET extends EngineTypesShape>(
  ctx: ServerContext<ET>,
  socket: ServerSocket<ET>
) => {
  let { engine, rooms, sockets, botSockets } = ctx;

  let room = getRoomForSocket(ctx, socket);
  if (!room) return;

  let seatIndex = room.seats.indexOf(socket);
  if (seatIndex !== -1) {
    room.seats[seatIndex] = false;
  }

  room.spectators = room.spectators.filter((x) => x !== socket);

  let roomIsEmpty =
    room.seats.filter((socket) => socket && !botSockets.has(socket)).length ===
    0;
  if (roomIsEmpty) {
    let socketsToEject = [socket, ...room.spectators];
    socketsToEject.forEach((socket) => {
      sockets.delete(socket);
      botSockets.delete(socket);
      socket.send(["server", { type: "room", data: null }]);
    });
    rooms.delete(room.id);
  } else {
    let shouldRemove = engine.shouldRemoveSeat
      ? engine.shouldRemoveSeat(room.seats.length, room.state !== false)
      : false;
    if (shouldRemove) {
      room.seats = room.seats.filter((x) => x);
    }

    broadcastRoomStatus(ctx, room);
  }
};

export const broadcastStateUpdate = <ET extends EngineTypesShape>(
  { engine }: ServerContext<ET>,
  room: Room<ET>
) => {
  room.seats.forEach((socket, seatIndex) => {
    if (socket && room.state)
      socket.send([
        "engine",
        engine.adapt
          ? engine.adapt(room.state, seatIndex, room.seats.length)
          : room.state,
      ]);
  });
};

export const updateThroughReducer = <ET extends EngineTypesShape>(
  ctx: ServerContext<ET>,
  room: Room<ET>,
  socket: ServerSocket<ET>,
  action: ET["actions"]
) => {
  const { rooms, sockets, engine } = ctx;

  if (!room.state) {
    if (socket) {
      socket.send([
        "serverMsg",
        { type: "error", data: "Game hasn't yet started." },
      ]);
    }
    return;
  }

  let nextState = engine.reducer(
    room.state,
    { numSeats: room.seats.length },
    { action, seatIndex: room.seats.indexOf(socket) }
  );

  if (nextState === room.state) return;

  if (!engine.isState(nextState)) {
    socket.send(["engineMsg", nextState]);
    return;
  }

  room.state = nextState;
  broadcastStateUpdate(ctx, room);
};

export const recurseThroughReducer = <ET extends EngineTypesShape>(
  ctx: ServerContext<ET>,
  room: Room<ET>
): void => {
  const { engine } = ctx;

  if (!room.state) return;

  const nextState = engine.reducer(room.state, { numSeats: room.seats.length });
  if (nextState === room.state) return;
  room.state = nextState;
  broadcastStateUpdate(ctx, room);
  return recurseThroughReducer(ctx, room);
};
