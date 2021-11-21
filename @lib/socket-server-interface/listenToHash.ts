import type { EngineTypesShape } from "../socket-server/types";
import type { AppInterface } from "./types";
import { getHash, replaceHash } from "./hash";

export function listenToHash<ET extends EngineTypesShape>({
  manager,
  store,
}: AppInterface<ET>) {
  function reactToHash() {
    let { id, playerIndex } = getHash();
    let { room } = store.getState();
    if (room && room.id === id && room.seatIndex === playerIndex) return;
    if (id) {
      manager.send([
        "server",
        { type: "join", data: { id, seatIndex: playerIndex } },
      ]);
    }
  }

  window.onhashchange = reactToHash;
  reactToHash();

  store.subscribe((curr, prev) => {
    if (curr.room === prev.room) return;
    replaceHash(
      curr.room
        ? { id: curr.room.id, playerIndex: curr.room.seatIndex }
        : undefined
    );
  });
}
