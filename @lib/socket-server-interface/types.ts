import { SocketManager } from "../socket/socketManager";
import type {
  EngineTypesShape,
  OutputsWith,
  InputsWith,
} from "../socket-server/types";
import type { Meter } from "../timing";
import type { Store } from "./createStore";

export type ManagerWith<ET extends EngineTypesShape> = SocketManager<
  InputsWith<ET>,
  OutputsWith<ET>
>;

export type AppAPI<ET extends EngineTypesShape> = {
  manager: ManagerWith<ET>;
  store: Store<ET>;
  meter: Meter<ET["states"]>;
};
