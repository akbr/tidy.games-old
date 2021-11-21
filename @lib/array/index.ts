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

export function shuffle<T>(array: T[]) {
  let length = array.length;
  let t: T;
  let i: number;

  while (length) {
    i = Math.floor(Math.random() * length--);
    t = array[length];
    array[length] = array[i];
    array[i] = t;
  }

  return array;
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
