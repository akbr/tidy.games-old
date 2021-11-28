import type { EngineTypesShape, ServerApi } from "../socket-server/types";
import type { AppAPI } from "./types";

import { createSocketManager } from "../socket/socketManager";
import { createStore } from "./createStore";
import { createMeter } from "@lib/timing";

export const createAppAPI = <ET extends EngineTypesShape>(
  server: ServerApi<ET> | string
): AppAPI<ET> => ({
  manager: createSocketManager(server),
  meter: createMeter(),
  store: createStore(),
});
