import { SocketManager } from "../socket/socketManager";
import type {
  EngineTypesShape,
  OutputsWith,
  InputsWith,
} from "../socket-server/types";
import type { Meter } from "../timing";
import { StoreApi } from "zustand";

export type ManagerWith<ET extends EngineTypesShape> = SocketManager<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type AppPrimitives<ET extends EngineTypesShape, Slice extends object> = {
  manager: ManagerWith<ET>;
  meter: Meter<ET["states"]>;
  store: StoreApi<Slice>;
};
