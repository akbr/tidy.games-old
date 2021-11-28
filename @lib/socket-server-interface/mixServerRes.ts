import type { EngineTypesShape } from "../socket-server/types";
import type { AppAPI } from "./types";

export function mixServerRes<ET extends EngineTypesShape>({
  store,
  meter,
  manager,
}: AppAPI<ET>) {
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
}
