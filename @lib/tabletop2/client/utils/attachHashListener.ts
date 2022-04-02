import { Spec } from "../../spec";
import { Client } from "..";

export function attachHashListener<S extends Spec>(client: Client<S>) {
  const { get, controls, reset, update, subscribe } = client;

  function reactToHash(hasRun = false) {
    const [, payload] = get();
    const room = "room" in payload ? payload.room : null;
    const { id, player } = getHash();

    if (room && room.id === id && room.player === player) return;
    if (id) {
      controls.server.join({ id, seatIndex: player });
    } else if (hasRun) {
      reset();
      update();
    }
  }

  reactToHash();
  window.onhashchange = () => reactToHash(true);

  const un = subscribe(([, payload]) => {
    const room = "room" in payload ? payload.room : null;
    if (room) {
      replaceHash({ id: room.id, player: room.player });
    } else {
      replaceHash({});
      reset();
    }
  });

  return () => {
    window.onhashchange = () => undefined;
    un();
  };
}

// ---

export type HashStatus = {
  id?: string;
  player?: number;
};

export function getHashString(status?: HashStatus) {
  if (!status) return "#";
  let { id, player } = status;
  return `#${id || ""}${player !== undefined ? `/${player}` : ""}`;
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
  let player = isNaN(maybeIndex) ? undefined : maybeIndex;
  return { id, player };
}
