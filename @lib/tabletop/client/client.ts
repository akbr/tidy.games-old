import type { Spec, Cart } from "../";
import type { ActionStubs } from "../cart";
import { Segment, Frame, getFrames } from "../machine";
import {
  ServerApi,
  RoomData,
  ServerActions,
  actionStubs as serverActionStubs,
} from "../roomServer";

import { createSocketManager } from "@lib/socket";
import { createSubscription, Subscribe } from "@lib/state/subscription";
import { createMeter, Meter } from "@lib/state/meter";
import { shallowPatchWithDeep } from "@lib/compare/patch";

export type Client<S extends Spec> = {
  subscribe: Subscribe<ClientState<S>>;
  get: () => ClientState<S>;
  meter: Meter<Frame<S>>;
  controls: Controls<S>;
  update: () => void;
  reset: () => void;
};

export type ClientState<S extends Spec> =
  | ["title", TitleProps<S>]
  | ["lobby", LobbyProps<S>]
  | ["game", GameProps<S>];

export type TitleProps<S extends Spec> = {
  cart: Cart<S>;
  connected: boolean;
  controls: Controls<S>;
  err?: Err;
};

export type LobbyProps<S extends Spec> = {
  room: RoomData;
} & TitleProps<S>;

export type GameProps<S extends Spec> = {
  frame: Frame<S>;
} & LobbyProps<S>;

export type FinalProps<S extends Spec> = GameProps<S>;

export type Controls<S extends Spec> = {
  game: ConnectedActions<S["actions"]>;
  server: ConnectedActions<ServerActions<S>>;
  meter: Meter<Frame<S>>;
};

export type Err = {
  type: "serverErr" | "machineErr";
  data: string;
};

export default createClient;
export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  cart: Cart<S>,
  history = false
): Client<S> {
  let connected = false;
  let segment: Segment<S> | null;
  let room: RoomData | null = null;
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
    ...{
      game: createActions<S["actions"]>(cart.actionStubs, (action) => {
        socket.send(["machine", action]);
      }),
      server: createActions<ServerActions<S>>(serverActionStubs, (action) => {
        socket.send(["server", action]);
      }),
    },
    meter,
  };

  const sub = createSubscription<ClientState<S>>([
    "title",
    { connected, cart, controls },
  ]);

  function update() {
    const nextProps: ClientState<S> = (() => {
      if (!room) return ["title", { connected, cart, controls, err }];
      if (!frame) return ["lobby", { connected, cart, controls, err, room }];
      return ["game", { connected, cart, controls, err, room, frame }];
    })();

    sub.push(nextProps);
  }

  function reset() {
    room = null;
    frame = null;
    segment = null;
    meter.reset();
    controls.server.leave();
  }

  socket.onmessage = ([type, payload]) => {
    if (type === "server") {
      room = payload;
      if (room === null) reset();
      update();
    } else if (type === "machine") {
      const nextSegment = payload;
      if (segment) {
        payload.prev[1] = shallowPatchWithDeep(
          segment.prev[1],
          nextSegment.prev[1]
        );
      }
      segment = nextSegment;
      meter.push(...getFrames(segment));
    } else if (type === "serverErr" || type === "machineErr") {
      err = { type, data: payload };
      update();
      err = undefined;
      update();
    }
  };

  socket.open();

  meter.subscribe(({ state: nextFrame }, { state: prevFrame }) => {
    if (nextFrame === prevFrame) return;
    frame = nextFrame || null;
    update();
  });

  return {
    meter,
    subscribe: sub.subscribe,
    get: sub.get,
    controls,
    update,
    reset,
  };
}

// ---

export type ConnectedActions<Actions extends Spec["actions"]> = {
  [Action in Actions as Action["type"]]: undefined extends Action["data"]
    ? (input?: Action["data"]) => void
    : (input: Action["data"]) => void;
};

export const createActions = <A extends Spec["actions"]>(
  stubs: ActionStubs<A>,
  submit: (action: A) => void
) => {
  const fns = {} as ConnectedActions<A>;
  for (let k in stubs) {
    const key = k as keyof ConnectedActions<A>;
    fns[key] = (input: any) => submit({ type: key, data: input } as A);
  }
  return fns;
};