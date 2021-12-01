import type { ComponentChildren, FunctionComponent } from "preact";
import { EngineTypes } from "@lib/engine/types";
import type { ServerTypes, RoomState } from "@lib/server/types";
import { AppPrimitives } from "./";

export type ServerSlice<ET extends EngineTypes> = {
  connected: boolean;
  state: ET["states"] | null;
  room: RoomState["data"];
  err: ET["msgs"] | ServerTypes<ET>["msgs"] | null;
};

export const createServerSlice = <
  ET extends EngineTypes
>(): ServerSlice<ET> => ({
  connected: false,
  state: null,
  room: null,
  err: null,
});

export function connectServerSlice<ET extends EngineTypes>({
  store,
  manager,
  meter,
}: AppPrimitives<ET>) {
  store.subscribe(
    ({ connected, state }) => connected === false || state === null,
    (reset) => {
      if (reset) meter.empty();
    }
  );

  meter.subscribe((state) => {
    store.set({ state, err: null });
  });

  manager.onData = (res) => {
    if (res[0] === "engine") {
      let state = res[1];
      meter.push(state);
    }

    if (res[0] === "engineMsg") {
      let err = res[1];
      store.set({ err });
    }

    if (res[0] === "server") {
      let room = res[1].data;
      store.set({ room, err: null });
    }

    if (res[0] === "serverMsg") {
      let err = res[1];
      store.set({ err });
    }
  };

  manager.onStatus = (connected) => {
    store.set({ connected });
  };
}

export function createServerActions<
  ET extends EngineTypes,
  Slice extends ServerSlice<ET>
>({ store, manager }: AppPrimitives<ET, Slice>) {
  const { send } = manager;

  return {
    join: (id?: string) => {
      //@ts-ignore
      send(["server", { type: "join", data: { id } }]);
    },
    start: () => send(["server", { type: "start" }]),
    addBot: () => send(["server", { type: "addBot" }]),
    exit: () => {
      store.set({ state: null, room: null });
      manager.openSocket();
    },
  };
}

export type DialogSlice<
  ET extends EngineTypes,
  DialogViewProps = Pick<ServerSlice<ET>, "state">
> = {
  dialog:
    | ComponentChildren
    | FunctionComponent<
        DialogViewProps & {
          setDialog: (dialog: DialogSlice<ET>) => void;
        }
      >;
};

export const createDialogSlice = <
  ET extends EngineTypes
>(): DialogSlice<ET> => ({
  dialog: null,
});

export const createDialogActions = <
  ET extends EngineTypes,
  StoreShape extends DialogSlice<ET>
>({
  store,
}: AppPrimitives<ET, StoreShape>) => ({
  setDialog: (dialog: DialogSlice<ET>) => {
    store.set({ dialog });
  },
});
