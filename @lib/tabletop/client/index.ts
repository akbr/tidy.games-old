import { createSocketManager, Socket } from "@lib/socket";
import { createSubscription } from "@lib/state/subscription";
import { createMeter, MeterStatus, Meter } from "@lib/state/meter";

import { GameDefinition, Frame, Spec, ConnectedActions } from "../types";
import { Step } from "../machine";
import {
  actionStubs,
  ServerApi,
  ServerInputs,
  ServerOutputs,
  RoomData,
  ServerActions,
} from "../server";
import { getFrames, createActions } from "../helpers";
import { getHash, replaceHash } from "./hash";
import { deep } from "@lib/compare/deep";

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
  connected: boolean;
  meta: GameDefinition<S>["meta"];
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
    server: createActions<ServerActions<S>>(actionStubs, (action) => {
      socket.send(["server", action]);
    }),
  };
}

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  def: GameDefinition<S>,
  history = false
) {
  const { meta } = def;
  let connected = false;
  let step: Step<S> | null;
  let room: RoomData | null = null;
  let meterStatus: MeterStatus<Frame<S>>;
  let frame: Frame<S> | null;
  let err: Err | undefined;

  const socket = createSocketManager(server, {
    onopen: () => {
      connected = true;
      update();
    },
    onclose: () => {
      connected = false;
      update();
    },
  });

  const meter = createMeter<Frame<S>>({ history });

  const controls = {
    ...createControls(socket, def),
    meter,
  };

  const sub = createSubscription<ViewProps<S>>([
    "title",
    { connected, meta, controls },
  ]);

  function update() {
    meterStatus = meter.get();
    frame = meterStatus.state || null;

    const nextProps: ViewProps<S> = !room
      ? ["title", { connected, meta, controls, err }]
      : !frame
      ? ["lobby", { connected, meta, controls, err, room }]
      : [
          "game",
          { connected, meta, controls, err, room, frame, meter: meterStatus },
        ];

    nextProps && sub.push(nextProps);
  }

  function reset() {
    frame = null;
    step = null;
    meter.reset();
    controls.server.leave(null);
  }

  socket.onmessage = ([type, payload]) => {
    if (type === "server") {
      room = payload;
      if (room) {
        replaceHash({ id: room.id, player: room.player });
      } else {
        replaceHash({});
        reset();
      }
      update();
    } else if (type === "machine") {
      const nextStep = payload;
      if (step) {
        payload.prev[1] = patch(step.prev[1], nextStep.prev[1]);
      }
      step = nextStep;
      meter.push(...getFrames(payload));
    } else if (type === "serverErr" || type === "machineErr") {
      err = { type, data: payload };
      update();
      err = undefined;
      update();
    }
  };

  function reactToHash(hasRun = false) {
    let { id, player } = getHash();
    if (room && room.id === id && room.player === player) return;
    if (id) {
      controls.server.join({ id, seatIndex: player });
    } else if (hasRun) {
      room = null;
      reset();
      update();
    }
  }

  socket.open();

  reactToHash();
  window.onhashchange = () => reactToHash(true);

  meter.subscribe(update);

  return { meter, subscribe: sub.subscribe, controls, update };
}

function patch<T extends Object>(prev: Record<string, any>, next: T): T {
  const merged = {} as T;
  for (const k in prev) {
    const key = k as keyof T;
    if (deep(prev[k], next[key])) {
      merged[key] = prev[k];
    } else {
      merged[key] = next[key];
    }
  }
  return merged;
}
