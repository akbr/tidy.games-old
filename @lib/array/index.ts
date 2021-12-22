import { createPRNG } from "@lib/random/prng";

export function rotateIndex(length: number, index: number, steps = 1) {
  if (index < 0) return index;
  const modSteps = Math.abs(steps) > length - 1 ? steps % length : steps;
  const nextIndex = index + modSteps;
  return nextIndex < 0
    ? nextIndex + length
    : nextIndex > length - 1
    ? nextIndex - length
    : nextIndex;
}

export function rotateArray<T>(array: T[], numSteps = 1) {
  const rotatedArray = array.concat();
  array.forEach((value, index) => {
    const newIndex = rotateIndex(array.length, index, numSteps);
    rotatedArray[newIndex] = value;
  });
  return rotatedArray;
}

export function shuffle<T>(array: T[], seed?: string) {
  const random = createPRNG(seed);

  let length = array.length;
  let t: T;
  let i: number;

  while (length) {
    i = Math.floor(random() * length--);
    t = array[length];
    array[length] = array[i];
    array[i] = t;
  }

  return array;
}

export function deal<T>(deck: T[], handSpecs: number[]): T[][] {
  const expectedNumCards = handSpecs.reduce((a, b) => a + b, 0);
  if (deck.length < expectedNumCards)
    throw new Error("Not enough cards in deck.");

  deck = [...deck];
  return Array.from({ length: handSpecs.length }).map((_, idx) =>
    Array.from({ length: handSpecs[idx] }).map(() => deck.pop()!)
  );
}

export function indexOfMax(arr: number[]) {
  if (arr.length === 0) return -1;

  let max = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

export function maxInt(arr: number[]) {
  const index = indexOfMax(arr);
  return arr[index];
}

export const sortBySpec = <T>(arr: T[], sortSpec: T[]) => {
  const sortMap = new Map(sortSpec.map((value, index) => [value, index]));
  return arr.sort((a, b) => (sortMap.get(a) || 0) - (sortMap.get(b) || 0));
};

export const removeOne = <T>(arr: T[], value: T) => {
  const i = arr.indexOf(value);
  if (i === -1) return arr;
  return arr.slice(0, i).concat(arr.slice(i + 1, arr.length));
};
