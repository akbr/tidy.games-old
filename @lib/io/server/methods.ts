import type { EngineTypes } from "../engine";
import type { ServerContext, Room, ServerSocket, BotSocket } from ".";

import { getRandomRoomID } from "./utils";

export const createRoom = <ET extends EngineTypes>(
  { engine, rooms }: ServerContext<ET>,
  id: string
) => {
  rooms.set(id, {
    id,
    seats: [],
    spectators: [],
    state: engine.autoStart ? engine.getInitialState(0) : false,
  });
  return rooms.get(id) as Room<ET>;
};

export const getRoomForSocket = <ET extends EngineTypes>(
  { rooms, sockets }: ServerContext<ET>,
  socket: ServerSocket<ET>
) => {
  let id = sockets.get(socket);
  if (id) {
    let room = id ? rooms.get(id) : null;
    return room ? room : null;
  }
  return null;
};

const avatars = ["🦊", "🐷", "🐔", "🐻", "🐭", "🦁"];
const botAvatar = "🤖";
export const broadcastRoomStatus = <ET extends EngineTypes>(
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
    socket.send({
      type: "server",
      data: {
        type: "room",
        data: {
          id,
          seats: modSeats,
          spectators: numSpectators,
          seatIndex: seats.indexOf(socket),
          started,
        },
      },
    });
  });
};

export const joinRoom = <ET extends EngineTypes>(
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
      socket.send({
        type: "engine",
        data: engine.adapt
          ? engine.adapt(
              room.state,
              room.seats.indexOf(socket),
              room.seats.length
            )
          : room.state,
      });
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

export const createBot = <ET extends EngineTypes>(
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
      send: (action) => botSocket.send({ type: "engine", data: action }),
      close: botSocket.close,
    },
    undefined
  );

  serverSocket = {
    send: ({ type, data }) => {
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

  api.onInput(serverSocket, {
    type: "server",
    data: {
      type: "join",
      data: { id },
    },
  });
};

export const leaveRoom = <ET extends EngineTypes>(
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
      socket.send({ type: "server", data: { type: "room", data: null } });
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

export const broadcastStateUpdate = <ET extends EngineTypes>(
  { engine }: ServerContext<ET>,
  state: ET["states"],
  room: Room<ET>
) => {
  room.seats.forEach((socket, seatIndex) => {
    if (socket)
      socket.send({
        type: "engine",
        data: engine.adapt
          ? engine.adapt(state, seatIndex, room.seats.length)
          : state,
      });
  });
};

export const updateThroughReducer = <ET extends EngineTypes>(
  ctx: ServerContext<ET>,
  room: Room<ET>,
  input?: {
    socket: ServerSocket<ET>;
    action: ET["actions"];
  }
) => {
  const { engine } = ctx;
  if (!room.state) return;

  const inputAction = input
    ? {
        ...input.action,
        playerIndex: room.seats.indexOf(input.socket),
      }
    : undefined;
  const nextStates = engine.reducer(room.state, inputAction);

  if (nextStates.length === 0) return;

  const isMsg = engine.isMsg(nextStates[0]);
  if (isMsg) {
    input && input.socket.send({ type: "engineMsg", data: nextStates[0] });
    return;
  }

  room.state = nextStates[nextStates.length - 1];

  nextStates.forEach((state) => broadcastStateUpdate(ctx, state, room));
};
