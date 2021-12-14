export function randomBetween(n1: number, n2: number) {
  let max = n1 > n2 ? n1 : n2;
  let min = n1 === max ? n2 : n1;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const getRandomRoomID = (length = 4) =>
  String.fromCharCode(
    ...Array.from({ length }).map(() => randomBetween(65, 90))
  );
