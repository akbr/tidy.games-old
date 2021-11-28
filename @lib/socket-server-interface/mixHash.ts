import type { EngineTypesShape } from "../socket-server/types";
import type { AppAPI } from "./types";

type HashStatus = {
  id?: string;
  playerIndex?: number;
};

export function getHashString(status?: HashStatus) {
  if (!status) return "#";
  let { id, playerIndex } = status;
  let hash = `#${id}`;
  if (playerIndex !== undefined) hash += `/${playerIndex}`;
  return hash;
}

export function setHash(status?: HashStatus) {
  window.location.hash = getHashString(status);
}

export function replaceHash(status?: HashStatus) {
  window.history.replaceState(null, "", getHashString(status));
}

export function getHash(): HashStatus {
  let hash = window.location.hash;
  hash = hash.substr(1, hash.length);
  if (hash.length === 0) return {};
  let [id, potentialIndex] = hash.split("/");
  let maybeIndex = parseInt(potentialIndex, 10);
  let playerIndex = isNaN(maybeIndex) ? undefined : maybeIndex;
  return { id, playerIndex };
}

export function mixHash<ET extends EngineTypesShape>({
  manager,
  store,
}: AppAPI<ET>) {
  function onHashChange() {
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

  window.onhashchange = onHashChange;
  onHashChange();

  store.subscribe((curr, prev) => {
    if (curr.room === prev.room) return;
    replaceHash(
      curr.room
        ? { id: curr.room.id, playerIndex: curr.room.seatIndex }
        : undefined
    );
  });
}
