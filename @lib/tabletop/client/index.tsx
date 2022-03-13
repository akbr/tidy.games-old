import { createSocketManager, Socket } from "@lib/socket";
import { createSubscription } from "@lib/state/subscription";
import { createMeter, MeterStatus, Meter } from "@lib/state/meter";

import { GameDefinition, Frame, Spec, ConnectedActions } from "../types";
import {
  ServerApi,
  ServerInputs,
  ServerOutputs,
  RoomData,
  ServerActions,
} from "../server";
import { getFrames, createActions } from "../helpers";

export type Controls<S extends Spec> = {
  game: ConnectedActions<S["actions"]>;
  server: ConnectedActions<ServerActions<S>>;
  meter: Meter<Frame<S>>;
};

export type Err = {
  type: "serverErr" | "machineErr";
  data: string;
};

export type TitleProps<S extends Spec> = {
  err?: Err;
  controls: Controls<S>;
};

export type LobbyProps<S extends Spec> = {
  room: RoomData;
} & TitleProps<S>;

export type GameProps<S extends Spec> = {
  frame: Frame<S>;
} & LobbyProps<S>;

export type DebugProps<S extends Spec> = {
  meter: MeterStatus<Frame<S>>;
} & GameProps<S>;

export type ViewProps<S extends Spec> =
  | ["title", TitleProps<S>]
  | ["lobby", LobbyProps<S>]
  | ["game", DebugProps<S>];

export function createControls<S extends Spec>(
  socket: Socket<ServerInputs<S>, ServerOutputs<S>>,
  def: GameDefinition<S>
) {
  return {
    game: createActions<S["actions"]>(def.actionStubs, (action) => {
      socket.send(["machine", action]);
    }),
    server: createActions<ServerActions<S>>(
      {
        start: null,
        addBot: null,
        join: null,
      },
      (action) => {
        socket.send(["server", action]);
      }
    ),
  };
}

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  def: GameDefinition<S>
) {
  let room: RoomData | null = null;
  let meterStatus: MeterStatus<Frame<S>>;
  let frame: Frame<S> | null;
  let err: Err | undefined;

  const socket = createSocketManager(server);
  const meter = createMeter<Frame<S>>();

  const controls = {
    ...createControls(socket, def),
    meter,
  };

  const sub = createSubscription<ViewProps<S>>(["title", { controls }]);

  function update() {
    meterStatus = meter.get();
    frame = meterStatus.states[meterStatus.idx];

    const nextProps: ViewProps<S> = !room
      ? ["title", { controls, err }]
      : !frame
      ? ["lobby", { controls, err, room }]
      : ["game", { controls, err, room, frame, meter: meterStatus }];

    nextProps && sub.push(nextProps);
  }

  socket.onmessage = ([type, payload]) => {
    if (type === "server") {
      room = payload;
      update();
    }
    if (type === "machine") {
      // patch payload.prev
      const frames = getFrames(payload);
      meter.push(...frames);
    }
    if (type === "serverErr" || type === "machineErr") {
      err = { type, data: payload };
      update();
      err = undefined;
      update();
    }
  };

  meter.subscribe(update);

  return { meter, subscribe: sub.subscribe, controls, update };
}
