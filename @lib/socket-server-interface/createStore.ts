import type { EngineTypesShape } from "../socket-server/types";
import type { ManagerWith, StoreInterface, Frame } from "./types";

import { createMeter } from "../timing";
import { default as createZStore } from "zustand/vanilla";

export function createStore<ET extends EngineTypesShape>(
  manager: ManagerWith<ET>
): StoreInterface<ET> {
  const meter = createMeter<ET["states"]>();
  const store = createZStore<Frame<ET>>(() => ({
    connected: false,
    state: null,
    room: null,
    err: null,
  }));

  store.subscribe((frame) => {
    if (frame.connected === false || frame.state === null) {
      meter.empty();
    }
  });

  meter.subscribe((state) => {
    store.setState({ state, err: null });
  });

  manager.onData = (res) => {
    if (res[0] === "engine") {
      let state = res[1];
      meter.push(state);
    }

    if (res[0] === "engineMsg") {
      let err = res[1];
      store.setState({ err });
    }

    if (res[0] === "server") {
      let room = res[1].data;
      store.setState({ room, err: null });
    }

    if (res[0] === "serverMsg") {
      let err = res[1];
      store.setState({ err });
    }
  };

  manager.onStatus = (connected) => {
    store.setState({ connected });
  };

  return { store, meter };
}
