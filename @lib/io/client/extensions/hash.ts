import type { EngineTypes } from "@lib/engine/types";
import type { ServerSlice } from "./server";
import type { AppPrimitives } from "../";

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

export function connectHashListener<
  ET extends EngineTypes,
  Slice extends ServerSlice<ET>
>({ store, manager }: AppPrimitives<ET, Slice>) {
  function onHashChange() {
    let { id, playerIndex } = getHash();
    let room = store.get((x) => x.room);
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

  store.subscribe(
    ({ room }) => room,
    (currRoom, prevRoom) => {
      if (currRoom === prevRoom) return;
      replaceHash(
        currRoom
          ? { id: currRoom.id, playerIndex: currRoom.seatIndex }
          : undefined
      );
    }
  );
}
