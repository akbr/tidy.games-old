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
