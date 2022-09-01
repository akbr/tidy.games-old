import { Spec, Client } from "../../";

export function attachHashListener<S extends Spec>(client: Client<S>) {
  const { get, subscribe } = client;

  function reactToHash() {
    const { room } = get();
    const { id, player } = getHash();

    if (room && room.id === id && room.player === player) return;
    if (id) {
      client.actions.server.join({ id, seatIndex: player });
    } else {
      client.actions.server.leave();
    }
  }

  reactToHash();
  window.onhashchange = () => reactToHash();

  const un = subscribe(({ room }) => {
    replaceHash(room ? { id: room.id, player: room.player } : {});
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
