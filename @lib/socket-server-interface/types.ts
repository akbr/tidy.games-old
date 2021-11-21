import { SocketManager } from "../socket/socketManager";
import type {
  EngineTypesShape,
  OutputsWith,
  InputsWith,
  ServerTypes,
  RoomState,
} from "../socket-server/types";
import type { Meter } from "../timing";
import type { StoreApi } from "zustand/vanilla";

export type ManagerWith<ET extends EngineTypesShape> = SocketManager<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type Frame<ET extends EngineTypesShape> = {
  connected: boolean;
  state: ET["states"] | null;
  room: RoomState["data"];
  err: ET["msgs"] | ServerTypes<ET>["msgs"] | null;
};

export type GameFrame<ET extends EngineTypesShape> = {
  state: ET["states"];
  room: Exclude<RoomState["data"], null>;
  err: ET["msgs"] | ServerTypes<ET>["msgs"] | null;
};

export type Store<ET extends EngineTypesShape> = StoreApi<Frame<ET>>;

export interface StoreInterface<ET extends EngineTypesShape> {
  store: Store<ET>;
  meter: Meter<ET["states"]>;
}

export type AppInterface<ET extends EngineTypesShape> = {
  manager: ManagerWith<ET>;
  store: Store<ET>;
  meter: Meter<ET["states"]>;
};
