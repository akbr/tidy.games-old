import { default as createZStore, StoreApi } from "zustand/vanilla";

import type {
  EngineTypesShape,
  ServerTypes,
  RoomState,
} from "../socket-server/types";

export type Store<ET extends EngineTypesShape> = StoreApi<Frame<ET>>;

export type Frame<ET extends EngineTypesShape> = {
  connected: boolean;
  state: ET["states"] | null;
  room: RoomState["data"];
  err: ET["msgs"] | ServerTypes<ET>["msgs"] | null;
};

export const createStore = <ET extends EngineTypesShape>(): Store<ET> =>
  createZStore<Frame<ET>>(() => ({
    connected: false,
    state: null,
    room: null,
    err: null,
  }));
